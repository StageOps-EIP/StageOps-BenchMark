/**
 * Metrics utilities for measuring performance and computing statistics.
 */

import { LatencyStats } from '../types';

/**
 * Measure execution time of an async function.
 * Returns [result, elapsedMs].
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const result = await fn();
  const elapsed = performance.now() - start;
  return [result, elapsed];
}

/**
 * Compute latency statistics from an array of measurements (in ms).
 */
export function computeLatencyStats(measurements: number[]): LatencyStats {
  if (measurements.length === 0) {
    return { average: 0, median: 0, p95: 0, min: 0, max: 0 };
  }

  const sorted = [...measurements].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  return {
    average: sum / sorted.length,
    median: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

/**
 * Compute the p-th percentile from a sorted array.
 */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

/**
 * Get current memory usage in MB.
 */
export function getMemoryUsageMB(): number {
  const usage = process.memoryUsage();
  return Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100;
}

/**
 * Format milliseconds for display.
 */
export function formatMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
