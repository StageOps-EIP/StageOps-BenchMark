/**
 * Scenario: Conflict Resolution
 *
 * Simulate two clients (A and B) modifying the same records while offline.
 * After reconnection, verify that:
 *   - Conflicts are resolved deterministically
 *   - Data converges correctly (both clients have identical data)
 *
 * This scenario tests the core conflict resolution strategy of each technology:
 *   - PouchDB: revision tree, automatic conflict detection
 *   - WatermelonDB: last-write-wins (updatedAt)
 *   - Ditto: LWW-Register CRDT with version vectors
 *
 * Implementation note:
 *   Each adapter instance has its own local/remote store pair.
 *   To simulate cross-client conflict, we:
 *   1. Both clients start with the same data
 *   2. Both modify the same records offline (with different values)
 *   3. Client A syncs first (establishes its version on its remote)
 *   4. Client B syncs next (using LWW/CRDT, B's later timestamps should win)
 *   5. We verify convergence by comparing what each client reads
 *   For simulated adapters, we additionally cross-apply mutations to test
 *   the actual conflict resolution logic.
 */

import { IBenchmarkAdapter } from '../adapters/base';
import { BenchmarkResult, BenchmarkRecord } from '../types';
import { generateDataset } from '../generator/dataset';
import { computeLatencyStats, getMemoryUsageMB, measureTime } from '../utils/metrics';
import { logger } from '../utils/logger';

const RECORD_COUNT = 1_000; // Smaller set for conflict testing
const CONFLICT_COUNT = 200; // Number of records to modify on both clients

/**
 * Create a second adapter instance of the same type for Client B.
 */
async function createClientB(adapterFactory: () => IBenchmarkAdapter): Promise<IBenchmarkAdapter> {
  const clientB = adapterFactory();
  await clientB.init();
  return clientB;
}

export async function runConflictResolution(
  clientA: IBenchmarkAdapter,
  adapterFactory: () => IBenchmarkAdapter,
): Promise<BenchmarkResult> {
  logger.separator();
  logger.info(`[Conflict] Starting with ${clientA.name}`);

  const memBefore = getMemoryUsageMB();

  // Step 1: Generate shared dataset
  logger.info(`[Conflict] Step 1: Generating ${RECORD_COUNT} shared records...`);
  const records = generateDataset(RECORD_COUNT);

  // Step 2: Insert into Client A
  logger.info('[Conflict] Step 2: Inserting records into Client A...');
  await clientA.bulkInsert(records);

  // Step 3: Create Client B and insert same records (simulates initial sync)
  logger.info('[Conflict] Step 3: Creating Client B with same dataset...');
  const clientB = await createClientB(adapterFactory);
  await clientB.bulkInsert(records);

  // Step 4: Both clients go offline
  logger.info('[Conflict] Step 4: Both clients going offline...');
  await clientA.goOffline();
  await clientB.goOffline();

  // Step 5: Both clients modify the same records differently
  logger.info(`[Conflict] Step 5: Generating conflicting mutations on ${CONFLICT_COUNT} records...`);
  const conflictRecords = records.slice(0, CONFLICT_COUNT);

  const timestampA = Date.now();

  // Client A mutations: modify payload with "clientA" marker
  const clientAUpdates = conflictRecords.map((record) => ({
    recordId: record.id,
    data: {
      payload: {
        ...record.payload,
        modifiedBy: 'clientA',
        conflictField: `value-from-A`,
        priority: 1,
      },
      updatedAt: timestampA,
      version: record.version + 1,
    } as Partial<BenchmarkRecord>,
  }));

  // Small delay to ensure different timestamps
  await new Promise((resolve) => setTimeout(resolve, 50));

  const timestampB = Date.now();

  // Client B mutations: modify payload with "clientB" marker (later timestamp → should win in LWW)
  const clientBUpdates = conflictRecords.map((record) => ({
    recordId: record.id,
    data: {
      payload: {
        ...record.payload,
        modifiedBy: 'clientB',
        conflictField: `value-from-B`,
        priority: 2,
      },
      updatedAt: timestampB,
      version: record.version + 1,
    } as Partial<BenchmarkRecord>,
  }));

  // Apply mutations to both clients
  logger.info('[Conflict] Applying mutations to Client A...');
  await clientA.applyLocalMutations({ updates: clientAUpdates, inserts: [], deletes: [] });

  logger.info('[Conflict] Applying mutations to Client B...');
  await clientB.applyLocalMutations({ updates: clientBUpdates, inserts: [], deletes: [] });

  // Step 6: Both clients go online and sync
  logger.info('[Conflict] Step 6: Reconnecting both clients...');
  await clientA.goOnline();
  await clientB.goOnline();

  const [syncResultA, syncTimeA] = await measureTime(() =>
    clientA.syncAndWaitForConsistency(),
  );
  const [syncResultB, syncTimeB] = await measureTime(() =>
    clientB.syncAndWaitForConsistency(),
  );

  // Now simulate the shared-server exchange:
  // Feed Client B's mutations (with B's original timestamps) to Client A,
  // and Client A's mutations (with A's original timestamps) to Client B.
  // We use the original update objects which carry the correct updatedAt.
  logger.info('[Conflict] Simulating shared-server sync (cross-applying with original timestamps)...');
  await clientA.applyLocalMutations({ updates: clientBUpdates, inserts: [], deletes: [] });
  await clientB.applyLocalMutations({ updates: clientAUpdates, inserts: [], deletes: [] });

  // Sync again to reconcile the cross-applied data
  const [syncResult2A] = await measureTime(() => clientA.syncAndWaitForConsistency());
  const [syncResult2B] = await measureTime(() => clientB.syncAndWaitForConsistency());

  // Step 7: Verify convergence
  // After cross-apply, each adapter should resolve conflicts using its strategy.
  // For LWW: timestampB > timestampA → clientB should win on both.
  // For CRDT: timestamp comparison + replicaId tiebreak.
  // We check that both clients agree on who won each record.
  logger.info('[Conflict] Step 7: Verifying convergence...');
  let convergedCount = 0;
  let divergedCount = 0;
  const readLatencies: number[] = [];
  let clientAWins = 0;
  let clientBWins = 0;

  for (const record of conflictRecords) {
    const startA = performance.now();
    const recordA = await clientA.readRecord(record.id);
    readLatencies.push(performance.now() - startA);

    const startB = performance.now();
    const recordB = await clientB.readRecord(record.id);
    readLatencies.push(performance.now() - startB);

    if (recordA && recordB) {
      // Compare the semantic conflict-resolution outcome:
      // Both clients should agree on which writer won (modifiedBy field).
      const payloadA = recordA.payload as Record<string, unknown>;
      const payloadB = recordB.payload as Record<string, unknown>;

      if (payloadA.modifiedBy === 'clientA') clientAWins++;
      if (payloadA.modifiedBy === 'clientB') clientBWins++;

      if (payloadA.modifiedBy === payloadB.modifiedBy) {
        convergedCount++;
      } else {
        divergedCount++;
      }
    } else {
      divergedCount++;
    }
  }

  // Determine which client's writes won (for LWW strategies)
  const winnerSample = clientBWins >= clientAWins ? 'clientB' : 'clientA';

  const memAfter = getMemoryUsageMB();

  // Clean up Client B
  await clientB.destroy();

  const result: BenchmarkResult = {
    technology: clientA.name.includes('Pouch')
      ? 'pouch'
      : clientA.name.includes('Watermelon')
        ? 'watermelon'
        : 'ditto',
    scenario: 'conflict',
    timestamp: new Date().toISOString(),
    executionTimeMs: syncTimeA + syncTimeB,
    memoryUsageMB: memAfter - memBefore,
    latency: computeLatencyStats(readLatencies),
    recordCount: CONFLICT_COUNT,
    details: {
      conflictCount: CONFLICT_COUNT,
      convergedRecords: convergedCount,
      divergedRecords: divergedCount,
      convergenceRate: `${((convergedCount / CONFLICT_COUNT) * 100).toFixed(1)}%`,
      isDeterministic: divergedCount === 0,
      winnerSample,
      clientAWins,
      clientBWins,
      timestampA,
      timestampB,
      clientA: {
        syncTimeMs: syncResultA.syncTimeMs,
        deltasProcessed: syncResultA.deltasProcessed + syncResult2A.deltasProcessed,
        isConsistent: syncResult2A.isConsistent,
      },
      clientB: {
        syncTimeMs: syncResultB.syncTimeMs,
        deltasProcessed: syncResultB.deltasProcessed + syncResult2B.deltasProcessed,
        isConsistent: syncResult2B.isConsistent,
      },
    },
  };

  logger.success(
    `[Conflict] Complete: ${convergedCount}/${CONFLICT_COUNT} records converged ` +
      `(${divergedCount} diverged). Winner: ${winnerSample}`,
  );

  return result;
}
