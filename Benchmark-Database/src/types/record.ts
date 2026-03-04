/**
 * Record schema for benchmark datasets.
 * Each record simulates a StageOps operational entity (~1KB payload).
 */

export type RecordType = 'incident' | 'equipment' | 'log';

export interface BenchmarkRecord {
  id: string;
  projectId: string;
  type: RecordType;
  payload: Record<string, unknown>;
  updatedAt: number;
  version: number;
}

/**
 * Mutation types used during offline simulation.
 */
export type MutationType = 'update' | 'insert' | 'delete';

export interface Mutation {
  type: MutationType;
  recordId: string;
  data?: Partial<BenchmarkRecord>;
}
