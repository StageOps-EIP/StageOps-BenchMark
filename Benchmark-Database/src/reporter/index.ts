/**
 * Results reporter: writes benchmark results to JSON and CSV files.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BenchmarkResult } from '../types';
import { logger } from '../utils/logger';

const RESULTS_DIR = path.resolve(__dirname, '../../results');

function ensureResultsDir(): void {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

/**
 * Generate a filename-safe timestamp string.
 */
function fileTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Write a single benchmark result to JSON.
 */
export function writeJsonResult(result: BenchmarkResult): string {
  ensureResultsDir();
  const filename = `${result.technology}-${result.scenario}-${fileTimestamp()}.json`;
  const filepath = path.join(RESULTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8');
  logger.info(`[Reporter] JSON result saved to: ${filepath}`);
  return filepath;
}

/**
 * Write a single benchmark result to CSV.
 */
export function writeCsvResult(result: BenchmarkResult): string {
  ensureResultsDir();
  const filename = `${result.technology}-${result.scenario}-${fileTimestamp()}.csv`;
  const filepath = path.join(RESULTS_DIR, filename);

  const headers = [
    'technology',
    'scenario',
    'timestamp',
    'executionTimeMs',
    'memoryUsageMB',
    'recordCount',
    'latencyAvg',
    'latencyMedian',
    'latencyP95',
    'latencyMin',
    'latencyMax',
  ];

  const values = [
    result.technology,
    result.scenario,
    result.timestamp,
    result.executionTimeMs.toFixed(2),
    result.memoryUsageMB.toFixed(2),
    result.recordCount.toString(),
    result.latency.average.toFixed(4),
    result.latency.median.toFixed(4),
    result.latency.p95.toFixed(4),
    result.latency.min.toFixed(4),
    result.latency.max.toFixed(4),
  ];

  const csv = [headers.join(','), values.join(',')].join('\n');
  fs.writeFileSync(filepath, csv, 'utf-8');
  logger.info(`[Reporter] CSV result saved to: ${filepath}`);
  return filepath;
}

/**
 * Write multiple results to a combined summary file.
 */
export function writeSummary(results: BenchmarkResult[]): string {
  ensureResultsDir();
  const filename = `summary-${fileTimestamp()}.json`;
  const filepath = path.join(RESULTS_DIR, filename);
  fs.writeFileSync(
    filepath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalScenarios: results.length,
        results,
      },
      null,
      2,
    ),
    'utf-8',
  );
  logger.info(`[Reporter] Summary saved to: ${filepath}`);
  return filepath;
}

/**
 * Pad a string to a fixed width (left-aligned).
 */
function padRight(str: string, width: number): string {
  return str.length >= width ? str : str + ' '.repeat(width - str.length);
}

/**
 * Pad a string to a fixed width (right-aligned).
 */
function padLeft(str: string, width: number): string {
  return str.length >= width ? str : ' '.repeat(width - str.length) + str;
}

/**
 * Print a formatted result table to the console.
 */
export function printResultTable(results: BenchmarkResult[]): void {
  logger.separator();
  console.log('\n  BENCHMARK RESULTS SUMMARY\n');

  const header =
    '  ' +
    padRight('Technology', 15) +
    padRight('Scenario', 15) +
    padLeft('Time (ms)', 12) +
    padLeft('Mem (MB)', 10) +
    padLeft('Avg (ms)', 10) +
    padLeft('Med (ms)', 10) +
    padLeft('P95 (ms)', 10);
  console.log(header);
  console.log('  ' + '─'.repeat(82));

  for (const r of results) {
    const row =
      '  ' +
      padRight(r.technology, 15) +
      padRight(r.scenario, 15) +
      padLeft(r.executionTimeMs.toFixed(2), 12) +
      padLeft(r.memoryUsageMB.toFixed(2), 10) +
      padLeft(r.latency.average.toFixed(4), 10) +
      padLeft(r.latency.median.toFixed(4), 10) +
      padLeft(r.latency.p95.toFixed(4), 10);
    console.log(row);
  }

  console.log();
  logger.separator();
}
