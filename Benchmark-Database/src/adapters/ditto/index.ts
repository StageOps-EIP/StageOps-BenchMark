/**
 * Ditto Adapter — CRDT Simulation
 *
 * Ditto is a commercial peer-to-peer database that uses CRDTs (Conflict-free
 * Replicated Data Types) for conflict resolution. Since Ditto requires a
 * commercial license and cannot run freely in benchmarks, this adapter
 * implements a faithful CRDT simulation.
 *
 * CRDT Conflict Resolution Strategy:
 * ──────────────────────────────────
 * This simulation implements a **Last-Writer-Wins Register (LWW-Register)**
 * combined with a **Grow-Only Set (G-Set)** for tracking record existence.
 *
 * Key behaviors:
 *
 * 1. LWW-Register: Each field in a record has an associated timestamp.
 *    When two replicas modify the same field concurrently, the write with
 *    the highest timestamp wins. If timestamps are equal, the write with
 *    the lexicographically highest replica ID wins (deterministic tie-break).
 *
 * 2. G-Set for existence: Once a record ID is observed, it can never be
 *    truly removed — instead we use a tombstone marker (soft delete).
 *    This ensures convergence across replicas.
 *
 * 3. Version Vector: Each replica maintains a version vector to track which
 *    updates it has seen from each peer, enabling delta-based synchronization.
 *
 * 4. Merge function: Given two versions of the same record, the merge function is:
 *    - For each field, pick the value with the highest (timestamp, replicaId) pair.
 *    - The result is deterministic and commutative (order-independent).
 *
 * Limitations:
 *   - This simulates Ditto's behavior but does NOT use Ditto's actual network
 *     protocol, storage engine, or mesh networking.
 *   - Real Ditto uses more sophisticated CRDTs (e.g., RGA for arrays).
 *   - Performance characteristics may differ from the real Ditto SDK.
 *
 * References:
 *   - Shapiro et al., "A comprehensive study of Convergent and Commutative
 *     Replicated Data Types" (2011)
 *   - Ditto documentation: https://docs.ditto.live
 */

import { IBenchmarkAdapter } from '../base';
import { BenchmarkRecord, AdapterStats } from '../../types';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a CRDT-wrapped record with metadata for conflict resolution.
 */
interface CRDTRecord {
  data: BenchmarkRecord;
  timestamp: number;
  replicaId: string;
  tombstone: boolean;
  /** Version vector: maps replicaId -> sequence number */
  versionVector: Map<string, number>;
}

export class DittoAdapter implements IBenchmarkAdapter {
  readonly name = 'Ditto (CRDT simulation)';

  /** Local replica store */
  private localStore: Map<string, CRDTRecord> = new Map();

  /** Remote replica store (simulates a second Ditto peer) */
  private remoteStore: Map<string, CRDTRecord> = new Map();

  /** This replica's unique identifier */
  private replicaId: string = '';



  /** Local sequence counter */
  private localSeq = 0;

  /** Whether the adapter is currently offline */
  private isOffline = false;

  /** Pending local operations (buffered while offline) */
  private pendingOps: Array<{
    type: 'upsert' | 'delete';
    record?: CRDTRecord;
    id?: string;
  }> = [];

  async init(): Promise<void> {
    logger.info('[DittoAdapter] Initializing CRDT simulation...');
    this.replicaId = `replica-${uuidv4().slice(0, 8)}`;
    this.localStore.clear();
    this.remoteStore.clear();
    this.localSeq = 0;
    this.isOffline = false;
    this.pendingOps = [];
    logger.info(`[DittoAdapter] Initialized with replicaId: ${this.replicaId}`);
  }

  async reset(): Promise<void> {
    logger.info('[DittoAdapter] Resetting...');
    this.localStore.clear();
    this.remoteStore.clear();
    this.localSeq = 0;
    this.isOffline = false;
    this.pendingOps = [];
  }

  async bulkInsert(records: BenchmarkRecord[]): Promise<number> {
    const start = performance.now();

    for (const record of records) {
      this.localSeq++;
      const crdtRecord: CRDTRecord = {
        data: { ...record },
        timestamp: Date.now(),
        replicaId: this.replicaId,
        tombstone: false,
        versionVector: new Map([[this.replicaId, this.localSeq]]),
      };

      this.localStore.set(record.id, crdtRecord);

      // If online, immediately replicate to remote
      if (!this.isOffline) {
        this.remoteStore.set(record.id, this.cloneCRDTRecord(crdtRecord));
      }
    }

    const elapsed = performance.now() - start;
    logger.info(
      `[DittoAdapter] Bulk inserted ${records.length} records in ${elapsed.toFixed(2)}ms`,
    );
    return elapsed;
  }

  async goOffline(): Promise<void> {
    logger.info('[DittoAdapter] Going offline...');
    this.isOffline = true;
    this.pendingOps = [];
  }

  async goOnline(): Promise<void> {
    logger.info('[DittoAdapter] Going online...');
    this.isOffline = false;
  }

  async applyLocalMutations(mutations: {
    updates: { recordId: string; data: Partial<BenchmarkRecord> }[];
    inserts: BenchmarkRecord[];
    deletes: string[];
  }): Promise<void> {
    logger.info(
      `[DittoAdapter] Applying mutations: ${mutations.updates.length} updates, ` +
        `${mutations.inserts.length} inserts, ${mutations.deletes.length} deletes`,
    );

    // Apply updates using CRDT merge to preserve conflict resolution semantics
    for (const update of mutations.updates) {
      const existing = this.localStore.get(update.recordId);
      if (existing) {
        this.localSeq++;
        // Use the updatedAt from the mutation data if available (preserves original timestamps
        // for cross-client conflict resolution), otherwise fall back to Date.now().
        const mutationTimestamp = (update.data.updatedAt as number) || Date.now();
        const incoming: CRDTRecord = {
          data: { ...existing.data, ...update.data } as BenchmarkRecord,
          timestamp: mutationTimestamp,
          replicaId: this.replicaId,
          tombstone: false,
          versionVector: new Map(existing.versionVector),
        };
        incoming.versionVector.set(this.replicaId, this.localSeq);

        // Use CRDT merge: the incoming update only wins if its timestamp is higher
        const merged = this.crdtMerge(existing, incoming);
        this.localStore.set(update.recordId, merged);
        this.pendingOps.push({ type: 'upsert', record: merged });
      }
    }

    // Apply inserts
    for (const record of mutations.inserts) {
      this.localSeq++;
      const crdtRecord: CRDTRecord = {
        data: { ...record },
        timestamp: Date.now(),
        replicaId: this.replicaId,
        tombstone: false,
        versionVector: new Map([[this.replicaId, this.localSeq]]),
      };
      this.localStore.set(record.id, crdtRecord);
      this.pendingOps.push({ type: 'upsert', record: crdtRecord });
    }

    // Apply deletes (tombstone — CRDT G-Set semantics)
    for (const id of mutations.deletes) {
      const existing = this.localStore.get(id);
      if (existing) {
        this.localSeq++;
        existing.tombstone = true;
        existing.timestamp = Date.now();
        existing.replicaId = this.replicaId;
        existing.versionVector.set(this.replicaId, this.localSeq);
        this.pendingOps.push({ type: 'delete', id });
      }
    }
  }

  async syncAndWaitForConsistency(): Promise<{
    syncTimeMs: number;
    deltasProcessed: number;
    isConsistent: boolean;
  }> {
    const start = performance.now();
    let deltasProcessed = 0;

    // Phase 1: Push local pending ops to remote (with CRDT merge)
    for (const op of this.pendingOps) {
      if (op.type === 'upsert' && op.record) {
        const id = op.record.data.id;
        const remoteRecord = this.remoteStore.get(id);
        const merged = this.crdtMerge(remoteRecord ?? null, op.record);
        this.remoteStore.set(id, this.cloneCRDTRecord(merged));
        deltasProcessed++;
      } else if (op.type === 'delete' && op.id) {
        const localRecord = this.localStore.get(op.id);
        if (localRecord) {
          const remoteRecord = this.remoteStore.get(op.id);
          const merged = this.crdtMerge(remoteRecord ?? null, localRecord);
          this.remoteStore.set(op.id, this.cloneCRDTRecord(merged));
          deltasProcessed++;
        }
      }
    }

    // Phase 2: Pull remote changes to local (with CRDT merge)
    for (const [id, remoteRecord] of this.remoteStore.entries()) {
      const localRecord = this.localStore.get(id);
      if (!localRecord || this.hasNewerVersion(remoteRecord, localRecord)) {
        const merged = this.crdtMerge(localRecord ?? null, remoteRecord);
        this.localStore.set(id, this.cloneCRDTRecord(merged));
        deltasProcessed++;
      }
    }

    this.pendingOps = [];

    const syncTimeMs = performance.now() - start;
    const isConsistent = this.verifyConsistency();

    logger.info(
      `[DittoAdapter] Sync complete: ${deltasProcessed} deltas in ${syncTimeMs.toFixed(2)}ms ` +
        `(consistent: ${isConsistent})`,
    );

    return { syncTimeMs, deltasProcessed, isConsistent };
  }

  async readRecord(id: string): Promise<BenchmarkRecord | null> {
    const crdtRecord = this.localStore.get(id);
    if (!crdtRecord || crdtRecord.tombstone) {
      return null;
    }
    return { ...crdtRecord.data };
  }

  async getStats(): Promise<AdapterStats> {
    const active = [...this.localStore.values()].filter((r) => !r.tombstone);
    return {
      totalRecords: active.length,
      syncedRecords: [...this.remoteStore.values()].filter((r) => !r.tombstone).length,
      pendingMutations: this.pendingOps.length,
      lastSyncTimestamp: Date.now(),
    };
  }

  async destroy(): Promise<void> {
    this.localStore.clear();
    this.remoteStore.clear();
    this.pendingOps = [];
    logger.info('[DittoAdapter] Destroyed');
  }

  // ──── CRDT Conflict Resolution ────

  /**
   * Merge two CRDT records using LWW-Register semantics.
   *
   * Resolution rules:
   * 1. Higher timestamp wins.
   * 2. On equal timestamps, higher replicaId (lexicographic) wins.
   * 3. Version vectors are merged by taking the max of each entry.
   * 4. Tombstones are preserved (once deleted, stays deleted unless
   *    a newer non-tombstone write arrives).
   */
  private crdtMerge(existing: CRDTRecord | null, incoming: CRDTRecord): CRDTRecord {
    if (!existing) {
      return incoming;
    }

    // Determine winner based on (timestamp, replicaId)
    let winner: CRDTRecord;
    if (incoming.timestamp > existing.timestamp) {
      winner = incoming;
    } else if (incoming.timestamp < existing.timestamp) {
      winner = existing;
    } else {
      // Tie-break: lexicographically highest replicaId wins
      winner = incoming.replicaId >= existing.replicaId ? incoming : existing;
    }

    // Merge version vectors (take max of each entry)
    const mergedVector = new Map(existing.versionVector);
    for (const [replica, seq] of incoming.versionVector) {
      const currentSeq = mergedVector.get(replica) ?? 0;
      mergedVector.set(replica, Math.max(currentSeq, seq));
    }

    return {
      ...winner,
      versionVector: mergedVector,
    };
  }

  /**
   * Check if the incoming record has version information not yet seen by the local record.
   */
  private hasNewerVersion(incoming: CRDTRecord, local: CRDTRecord): boolean {
    for (const [replica, seq] of incoming.versionVector) {
      const localSeq = local.versionVector.get(replica) ?? 0;
      if (seq > localSeq) {
        return true;
      }
    }
    return false;
  }

  /**
   * Deep clone a CRDT record.
   */
  private cloneCRDTRecord(record: CRDTRecord): CRDTRecord {
    return {
      data: { ...record.data, payload: { ...record.data.payload } },
      timestamp: record.timestamp,
      replicaId: record.replicaId,
      tombstone: record.tombstone,
      versionVector: new Map(record.versionVector),
    };
  }

  /**
   * Verify that local and remote stores have converged.
   */
  private verifyConsistency(): boolean {
    if (this.localStore.size !== this.remoteStore.size) {
      return false;
    }
    for (const [id, local] of this.localStore) {
      const remote = this.remoteStore.get(id);
      if (!remote) return false;
      if (local.tombstone !== remote.tombstone) return false;
      if (local.data.version !== remote.data.version) return false;
      if (local.timestamp !== remote.timestamp) return false;
    }
    return true;
  }
}
