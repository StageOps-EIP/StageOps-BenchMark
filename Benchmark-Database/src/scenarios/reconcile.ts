/**
 * Scenario: Offline Reconciliation
 *
 * 1. Initial sync: bulk insert 10,000 records
 * 2. Go offline
 * 3. Apply local mutations (500 updates, 200 inserts, 100 deletes)
 * 4. Simulate a 30-minute offline window (fast-forwarded)
 * 5. Reconnect and measure full synchronization time
 * 6. Verify data consistency
 */

import { IBenchmarkAdapter } from '../adapters/base';
import { BenchmarkResult } from '../types';
import { generateDataset, generateOfflineMutations } from '../generator/dataset';
import { computeLatencyStats, getMemoryUsageMB, measureTime } from '../utils/metrics';
import { logger } from '../utils/logger';

const RECORD_COUNT = 10_000;
const UPDATE_COUNT = 500;
const INSERT_COUNT = 200;
const DELETE_COUNT = 100;

export async function runReconciliation(adapter: IBenchmarkAdapter): Promise<BenchmarkResult> {
  logger.separator();
  logger.info(`[Reconcile] Starting with ${adapter.name}`);

  const memBefore = getMemoryUsageMB();

  // Step 1: Initial data load
  logger.info(`[Reconcile] Step 1: Generating and inserting ${RECORD_COUNT} records...`);
  const records = generateDataset(RECORD_COUNT);
  await adapter.bulkInsert(records);

  // Step 2: Go offline
  logger.info('[Reconcile] Step 2: Going offline...');
  await adapter.goOffline();

  // Step 3: Apply local mutations
  logger.info(
    `[Reconcile] Step 3: Applying mutations (${UPDATE_COUNT} updates, ` +
      `${INSERT_COUNT} inserts, ${DELETE_COUNT} deletes)...`,
  );
  const mutations = generateOfflineMutations(records, UPDATE_COUNT, INSERT_COUNT, DELETE_COUNT);
  const [, mutationTimeMs] = await measureTime(() => adapter.applyLocalMutations(mutations));
  logger.info(`[Reconcile] Mutations applied in ${mutationTimeMs.toFixed(2)}ms`);

  // Step 4: Simulate 30-minute offline window
  // In a real scenario, this would be actual time passing.
  // We fast-forward by just noting the simulated duration.
  logger.info('[Reconcile] Step 4: Simulating 30-minute offline window (fast-forwarded)...');
  const simulatedOfflineMs = 30 * 60 * 1000; // 30 minutes in ms

  // Step 5: Reconnect and synchronize
  logger.info('[Reconcile] Step 5: Going online and synchronizing...');
  await adapter.goOnline();

  const [syncResult, totalSyncMs] = await measureTime(() =>
    adapter.syncAndWaitForConsistency(),
  );

  // Step 6: Verify consistency by reading back some records
  logger.info('[Reconcile] Step 6: Verifying consistency...');
  const verificationLatencies: number[] = [];

  // Check updated records
  let updatesVerified = 0;
  for (const update of mutations.updates.slice(0, 50)) {
    const start = performance.now();
    const record = await adapter.readRecord(update.recordId);
    verificationLatencies.push(performance.now() - start);
    if (record) updatesVerified++;
  }

  // Check inserted records
  let insertsVerified = 0;
  for (const insert of mutations.inserts.slice(0, 50)) {
    const start = performance.now();
    const record = await adapter.readRecord(insert.id);
    verificationLatencies.push(performance.now() - start);
    if (record) insertsVerified++;
  }

  // Check deleted records (should be null)
  let deletesVerified = 0;
  for (const id of mutations.deletes.slice(0, 50)) {
    const start = performance.now();
    const record = await adapter.readRecord(id);
    verificationLatencies.push(performance.now() - start);
    if (!record) deletesVerified++;
  }

  const memAfter = getMemoryUsageMB();
  const stats = await adapter.getStats();

  const result: BenchmarkResult = {
    technology: adapter.name.includes('Pouch')
      ? 'pouch'
      : adapter.name.includes('Watermelon')
        ? 'watermelon'
        : 'ditto',
    scenario: 'reconcile',
    timestamp: new Date().toISOString(),
    executionTimeMs: totalSyncMs,
    memoryUsageMB: memAfter - memBefore,
    latency: computeLatencyStats(verificationLatencies),
    recordCount: RECORD_COUNT,
    details: {
      syncTimeMs: syncResult.syncTimeMs,
      deltasProcessed: syncResult.deltasProcessed,
      isConsistent: syncResult.isConsistent,
      simulatedOfflineMs,
      mutationTimeMs,
      mutations: {
        updates: UPDATE_COUNT,
        inserts: INSERT_COUNT,
        deletes: DELETE_COUNT,
      },
      verification: {
        updatesVerified: `${updatesVerified}/50`,
        insertsVerified: `${insertsVerified}/50`,
        deletesVerified: `${deletesVerified}/50`,
      },
      finalRecordCount: stats.totalRecords,
    },
  };

  logger.success(
    `[Reconcile] Complete: sync in ${syncResult.syncTimeMs.toFixed(2)}ms, ` +
      `${syncResult.deltasProcessed} deltas processed, ` +
      `consistent: ${syncResult.isConsistent}`,
  );

  return result;
}
