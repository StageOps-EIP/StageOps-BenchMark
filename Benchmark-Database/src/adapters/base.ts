/**
 * IBenchmarkAdapter — Generic adapter interface for all benchmark technologies.
 *
 * Each adapter wraps a specific database/sync technology and exposes
 * a unified API for the benchmark scenarios to use.
 */

import { BenchmarkRecord, AdapterStats } from '../types';

export interface IBenchmarkAdapter {
  /** Technology name */
  readonly name: string;

  /**
   * Initialize the adapter: create database, establish connections, etc.
   */
  init(): Promise<void>;

  /**
   * Reset the adapter: clear all data and return to a clean state.
   */
  reset(): Promise<void>;

  /**
   * Bulk insert records into the local database.
   * @param records Array of records to insert
   * @returns Time taken in milliseconds
   */
  bulkInsert(records: BenchmarkRecord[]): Promise<number>;

  /**
   * Simulate going offline (disable synchronization).
   */
  goOffline(): Promise<void>;

  /**
   * Simulate going online (re-enable synchronization).
   */
  goOnline(): Promise<void>;

  /**
   * Apply local mutations while offline.
   * @param mutations Object containing updates, inserts, and deletes
   */
  applyLocalMutations(mutations: {
    updates: { recordId: string; data: Partial<BenchmarkRecord> }[];
    inserts: BenchmarkRecord[];
    deletes: string[];
  }): Promise<void>;

  /**
   * Trigger synchronization and wait until full consistency is achieved.
   * @returns Object with syncTimeMs, deltasProcessed and isConsistent
   */
  syncAndWaitForConsistency(): Promise<{
    syncTimeMs: number;
    deltasProcessed: number;
    isConsistent: boolean;
  }>;

  /**
   * Read a single record by its ID.
   * @param id Record identifier
   */
  readRecord(id: string): Promise<BenchmarkRecord | null>;

  /**
   * Get current adapter statistics.
   */
  getStats(): Promise<AdapterStats>;

  /**
   * Destroy the adapter and free resources.
   */
  destroy(): Promise<void>;
}
