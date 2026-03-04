/**
 * Dataset generator for the StageOps benchmark suite.
 * Generates 10,000 records conforming to the BenchmarkRecord schema.
 * Each record payload is approximately 1KB.
 */

import { BenchmarkRecord, RecordType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const RECORD_TYPES: RecordType[] = ['incident', 'equipment', 'log'];

const PROJECT_IDS = Array.from({ length: 20 }, () => uuidv4());

/**
 * Generate a random string of the specified byte length.
 * Used to pad the payload to approximately 1KB.
 */
function randomString(byteLength: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < byteLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a single benchmark record with a ~1KB payload.
 */
function generateRecord(index: number): BenchmarkRecord {
  const type = RECORD_TYPES[index % RECORD_TYPES.length];
  const projectId = PROJECT_IDS[index % PROJECT_IDS.length];

  const payload: Record<string, unknown> = {
    title: `Record ${index} - ${type}`,
    description: randomString(200),
    status: index % 2 === 0 ? 'open' : 'closed',
    priority: (index % 5) + 1,
    location: {
      lat: 48.8566 + Math.random() * 0.1,
      lng: 2.3522 + Math.random() * 0.1,
    },
    tags: Array.from({ length: 3 }, (_, i) => `tag-${(index + i) % 50}`),
    metadata: {
      createdBy: `user-${index % 100}`,
      source: 'benchmark-generator',
      notes: randomString(400),
    },
  };

  return {
    id: uuidv4(),
    projectId,
    type,
    payload,
    updatedAt: Date.now() - Math.floor(Math.random() * 86400000),
    version: 1,
  };
}

/**
 * Generate a dataset of `count` benchmark records.
 * @param count Number of records to generate (default: 10,000)
 */
export function generateDataset(count: number = 10_000): BenchmarkRecord[] {
  const records: BenchmarkRecord[] = [];
  for (let i = 0; i < count; i++) {
    records.push(generateRecord(i));
  }
  return records;
}

/**
 * Generate a set of mutations to apply during offline simulation.
 * Returns updates, inserts, and deletes based on the provided records.
 */
export function generateOfflineMutations(
  existingRecords: BenchmarkRecord[],
  updateCount: number = 500,
  insertCount: number = 200,
  deleteCount: number = 100,
): {
  updates: { recordId: string; data: Partial<BenchmarkRecord> }[];
  inserts: BenchmarkRecord[];
  deletes: string[];
} {
  // Pick random records to update
  const shuffled = [...existingRecords].sort(() => Math.random() - 0.5);

  const updates = shuffled.slice(0, updateCount).map((record) => ({
    recordId: record.id,
    data: {
      payload: {
        ...record.payload,
        lastModified: Date.now(),
        offlineEdit: true,
        notes: randomString(100),
      },
      updatedAt: Date.now(),
      version: record.version + 1,
    } as Partial<BenchmarkRecord>,
  }));

  // Generate new records for insertion
  const inserts = Array.from({ length: insertCount }, (_, i) =>
    generateRecord(existingRecords.length + i),
  );

  // Pick random records to delete
  const deletes = shuffled.slice(updateCount, updateCount + deleteCount).map((r) => r.id);

  return { updates, inserts, deletes };
}
