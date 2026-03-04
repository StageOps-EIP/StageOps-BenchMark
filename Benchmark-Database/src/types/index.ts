/**
 * Shared type definitions for the StageOps Benchmark suite.
 */

export { BenchmarkRecord, RecordType, Mutation, MutationType } from './record';

/**
 * Supported technologies.
 */
export type TechName = 'pouch' | 'watermelon' | 'ditto';

/**
 * Supported benchmark scenarios.
 */
export type ScenarioName = 'bulkInsert' | 'reconcile' | 'conflict';

/**
 * Latency statistics computed from a set of measurements.
 */
export interface LatencyStats {
  /** Average latency in ms */
  average: number;
  /** Median latency in ms */
  median: number;
  /** 95th percentile latency in ms */
  p95: number;
  /** Minimum latency in ms */
  min: number;
  /** Maximum latency in ms */
  max: number;
}

/**
 * Benchmark result for a single scenario run.
 */
export interface BenchmarkResult {
  technology: TechName;
  scenario: ScenarioName;
  timestamp: string;
  executionTimeMs: number;
  memoryUsageMB: number;
  latency: LatencyStats;
  recordCount: number;
  /** Scenario-specific details */
  details: Record<string, unknown>;
}

/**
 * Statistics returned by adapters.
 */
export interface AdapterStats {
  totalRecords: number;
  syncedRecords: number;
  pendingMutations: number;
  lastSyncTimestamp: number;
}
