/**
 * PouchDB + CouchDB Adapter
 *
 * Uses PouchDB as the local database with optional CouchDB remote sync.
 * PouchDB natively supports offline-first with bidirectional replication.
 */

import PouchDB from 'pouchdb';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { IBenchmarkAdapter } from '../base';
import { BenchmarkRecord, AdapterStats } from '../../types';
import { logger } from '../../utils/logger';

// Register the in-memory adapter for benchmarking
PouchDB.plugin(PouchDBAdapterMemory);

const COUCHDB_URL = process.env.COUCHDB_URL || 'http://admin:password@localhost:5984';
const DB_NAME = 'stageops_bench';

export class PouchAdapter implements IBenchmarkAdapter {
  readonly name = 'PouchDB + CouchDB';

  private localDb!: PouchDB.Database;
  private remoteDb!: PouchDB.Database;
  private syncHandler: PouchDB.Replication.Sync<object> | null = null;
  private _isOffline = false;
  private deltasProcessed = 0;

  async init(): Promise<void> {
    logger.info('[PouchAdapter] Initializing...');
    this.localDb = new PouchDB(DB_NAME, { adapter: 'memory' });
    this.remoteDb = new PouchDB(`${COUCHDB_URL}/${DB_NAME}`);
    this._isOffline = false;
    this.deltasProcessed = 0;

    // Start live replication
    this.startSync();
    logger.info('[PouchAdapter] Initialized with local (memory) + remote (CouchDB)');
  }

  async reset(): Promise<void> {
    logger.info('[PouchAdapter] Resetting...');
    this.stopSync();
    try {
      await this.localDb.destroy();
    } catch (_e) {
      // Ignore if already destroyed
    }
    try {
      await this.remoteDb.destroy();
    } catch (_e) {
      // Ignore if CouchDB not available
    }
    this.localDb = new PouchDB(DB_NAME, { adapter: 'memory' });
    this.remoteDb = new PouchDB(`${COUCHDB_URL}/${DB_NAME}`);
    this.deltasProcessed = 0;
    this._isOffline = false;
  }

  async bulkInsert(records: BenchmarkRecord[]): Promise<number> {
    const docs = records.map((r) => ({
      _id: r.id,
      ...r,
    }));

    const start = performance.now();
    const result = await this.localDb.bulkDocs(docs);
    const elapsed = performance.now() - start;

    const errors = result.filter((r: PouchDB.Core.Response | PouchDB.Core.Error) => 'error' in r);
    if (errors.length > 0) {
      logger.warn(`[PouchAdapter] ${errors.length} errors during bulk insert`);
    }

    logger.info(`[PouchAdapter] Bulk inserted ${records.length} records in ${elapsed.toFixed(2)}ms`);
    return elapsed;
  }

  async goOffline(): Promise<void> {
    logger.info('[PouchAdapter] Going offline...');
    this._isOffline = true;
    this.stopSync();
  }

  async goOnline(): Promise<void> {
    logger.info('[PouchAdapter] Going online...');
    this._isOffline = false;
    // Sync will be explicitly started in syncAndWaitForConsistency
  }

  async applyLocalMutations(mutations: {
    updates: { recordId: string; data: Partial<BenchmarkRecord> }[];
    inserts: BenchmarkRecord[];
    deletes: string[];
  }): Promise<void> {
    logger.info(
      `[PouchAdapter] Applying mutations: ${mutations.updates.length} updates, ` +
        `${mutations.inserts.length} inserts, ${mutations.deletes.length} deletes`,
    );

    // Apply updates
    for (const update of mutations.updates) {
      try {
        const doc = await this.localDb.get(update.recordId);
        await this.localDb.put({
          ...doc,
          ...update.data,
          _id: update.recordId,
          _rev: doc._rev,
        });
      } catch (e) {
        logger.warn(`[PouchAdapter] Failed to update record ${update.recordId}: ${e}`);
      }
    }

    // Apply inserts
    if (mutations.inserts.length > 0) {
      const docs = mutations.inserts.map((r) => ({ _id: r.id, ...r }));
      await this.localDb.bulkDocs(docs);
    }

    // Apply deletes
    for (const id of mutations.deletes) {
      try {
        const doc = await this.localDb.get(id);
        await this.localDb.remove(doc);
      } catch (e) {
        logger.warn(`[PouchAdapter] Failed to delete record ${id}: ${e}`);
      }
    }
  }

  async syncAndWaitForConsistency(): Promise<{
    syncTimeMs: number;
    deltasProcessed: number;
    isConsistent: boolean;
  }> {
    this.deltasProcessed = 0;
    const start = performance.now();

    return new Promise((resolve) => {
      const replication = this.localDb.sync(this.remoteDb, {
        batch_size: 1000,
      });

      replication.on('change', (info) => {
        const changeCount = info.change?.docs?.length ?? 0;
        this.deltasProcessed += changeCount;
      });

      replication.on('complete', async () => {
        const syncTimeMs = performance.now() - start;
        const isConsistent = await this.verifyConsistency();
        resolve({
          syncTimeMs,
          deltasProcessed: this.deltasProcessed,
          isConsistent,
        });
      });

      replication.on('error', (err) => {
        logger.error(`[PouchAdapter] Sync error: ${err}`);
        const syncTimeMs = performance.now() - start;
        resolve({
          syncTimeMs,
          deltasProcessed: this.deltasProcessed,
          isConsistent: false,
        });
      });
    });
  }

  async readRecord(id: string): Promise<BenchmarkRecord | null> {
    try {
      const doc = await this.localDb.get(id);
      // Strip PouchDB internal fields
      const { _id: _stripId, _rev: _stripRev, ...record } = doc as PouchDB.Core.IdMeta &
        PouchDB.Core.GetMeta &
        BenchmarkRecord;
      return record as BenchmarkRecord;
    } catch (_e) {
      return null;
    }
  }

  async getStats(): Promise<AdapterStats> {
    const info = await this.localDb.info();
    return {
      totalRecords: info.doc_count,
      syncedRecords: info.doc_count,
      pendingMutations: this._isOffline ? -1 : 0,
      lastSyncTimestamp: Date.now(),
    };
  }

  async destroy(): Promise<void> {
    this.stopSync();
    try {
      await this.localDb.destroy();
    } catch (_e) {
      // Ignore
    }
  }

  // -- Private helpers --

  private startSync(): void {
    if (this.syncHandler) return;
    this.syncHandler = this.localDb
      .sync(this.remoteDb, {
        live: true,
        retry: true,
        batch_size: 1000,
      })
      .on('change', (info) => {
        const changeCount = info.change?.docs?.length ?? 0;
        this.deltasProcessed += changeCount;
      })
      .on('error', (err) => {
        logger.warn(`[PouchAdapter] Live sync error: ${err}`);
      });
  }

  private stopSync(): void {
    if (this.syncHandler) {
      this.syncHandler.cancel();
      this.syncHandler = null;
    }
  }

  private async verifyConsistency(): Promise<boolean> {
    try {
      const localInfo = await this.localDb.info();
      const remoteInfo = await this.remoteDb.info();
      return localInfo.doc_count === remoteInfo.doc_count;
    } catch (_e) {
      logger.warn('[PouchAdapter] Could not verify consistency (CouchDB unavailable)');
      return false;
    }
  }
}
