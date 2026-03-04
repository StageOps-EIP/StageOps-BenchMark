/**
 * Scenario: Bulk Insert
 *
 * Insert 10,000 records into the database and measure performance.
 * Records are inserted in a single bulk operation. Individual record
 * insertion times are sampled for latency statistics.
 */

import { IBenchmarkAdapter } from '../adapters/base';
import { BenchmarkResult } from '../types';
import { generateDataset } from '../generator/dataset';
import { computeLatencyStats, getMemoryUsageMB, measureTime } from '../utils/metrics';
import { logger } from '../utils/logger';

const RECORD_COUNT = 10_000;
const SAMPLE_SIZE = 100; // Number of individual inserts to sample for latency

export async function runBulkInsert(adapter: IBenchmarkAdapter): Promise<BenchmarkResult> {
  logger.separator();
  logger.info(`[BulkInsert] Starting with ${adapter.name}`);
  logger.info(`[BulkInsert] Generating ${RECORD_COUNT} records...`);

  const memBefore = getMemoryUsageMB();
  const records = generateDataset(RECORD_COUNT);

  logger.info(`[BulkInsert] Dataset generated. Starting bulk insert...`);

  // Main bulk insert
  const [bulkTimeMs, totalTimeMs] = await measureTime(() => adapter.bulkInsert(records));

  // Sample individual record read times for latency stats
  const latencies: number[] = [];
  const sampleIds = records
    .sort(() => Math.random() - 0.5)
    .slice(0, SAMPLE_SIZE)
    .map((r) => r.id);

  for (const id of sampleIds) {
    const start = performance.now();
    await adapter.readRecord(id);
    latencies.push(performance.now() - start);
  }

  const memAfter = getMemoryUsageMB();
  const stats = await adapter.getStats();

  const result: BenchmarkResult = {
    technology: adapter.name.includes('Pouch')
      ? 'pouch'
      : adapter.name.includes('Watermelon')
        ? 'watermelon'
        : 'ditto',
    scenario: 'bulkInsert',
    timestamp: new Date().toISOString(),
    executionTimeMs: totalTimeMs,
    memoryUsageMB: memAfter - memBefore,
    latency: computeLatencyStats(latencies),
    recordCount: RECORD_COUNT,
    details: {
      bulkInsertTimeMs: bulkTimeMs,
      totalRecords: stats.totalRecords,
      avgInsertTimePerRecord: bulkTimeMs / RECORD_COUNT,
      readSampleSize: SAMPLE_SIZE,
    },
  };

  logger.success(
    `[BulkInsert] Complete: ${bulkTimeMs.toFixed(2)}ms for ${RECORD_COUNT} records ` +
      `(${(bulkTimeMs / RECORD_COUNT).toFixed(4)}ms/record)`,
  );

  return result;
}
