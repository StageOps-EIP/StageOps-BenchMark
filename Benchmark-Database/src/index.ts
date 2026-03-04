/**
 * StageOps Benchmark CLI
 *
 * Usage:
 *   npm run bench -- --tech pouch|watermelon|ditto --scenario bulkInsert|reconcile|conflict
 *   npm run bench -- --all   (run all combinations)
 */

import { Command } from 'commander';
import { TechName, ScenarioName, BenchmarkResult } from './types';
import { IBenchmarkAdapter } from './adapters/base';
import { PouchAdapter } from './adapters/pouch';
import { WatermelonAdapter } from './adapters/watermelon';
import { DittoAdapter } from './adapters/ditto';
import { runBulkInsert } from './scenarios/bulk-insert';
import { runReconciliation } from './scenarios/reconcile';
import { runConflictResolution } from './scenarios/conflict';
import {
  writeJsonResult,
  writeCsvResult,
  writeSummary,
  printResultTable,
} from './reporter';
import { logger, LogLevel } from './utils/logger';

const VALID_TECHS: TechName[] = ['pouch', 'watermelon', 'ditto'];
const VALID_SCENARIOS: ScenarioName[] = ['bulkInsert', 'reconcile', 'conflict'];

/**
 * Factory to create an adapter by technology name.
 */
function createAdapter(tech: TechName): IBenchmarkAdapter {
  switch (tech) {
    case 'pouch':
      return new PouchAdapter();
    case 'watermelon':
      return new WatermelonAdapter();
    case 'ditto':
      return new DittoAdapter();
    default:
      throw new Error(`Unknown technology: ${tech as string}`);
  }
}

/**
 * Factory function suitable for creating adapter instances (used by conflict scenario).
 */
function adapterFactory(tech: TechName): () => IBenchmarkAdapter {
  return () => createAdapter(tech);
}

/**
 * Run a single scenario for a given technology.
 */
async function runScenario(
  tech: TechName,
  scenario: ScenarioName,
): Promise<BenchmarkResult> {
  const adapter = createAdapter(tech);
  await adapter.init();

  let result: BenchmarkResult;

  try {
    switch (scenario) {
      case 'bulkInsert':
        result = await runBulkInsert(adapter);
        break;
      case 'reconcile':
        result = await runReconciliation(adapter);
        break;
      case 'conflict':
        result = await runConflictResolution(adapter, adapterFactory(tech));
        break;
      default:
        throw new Error(`Unknown scenario: ${scenario as string}`);
    }
  } finally {
    await adapter.destroy();
  }

  // Save results
  writeJsonResult(result);
  writeCsvResult(result);

  return result;
}

/**
 * Main CLI program.
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('stageops-bench')
    .description('StageOps Benchmark Suite — Offline-first database synchronization')
    .version('1.0.0');

  program
    .option('-t, --tech <technology>', 'Technology to benchmark: pouch|watermelon|ditto')
    .option(
      '-s, --scenario <scenario>',
      'Scenario to run: bulkInsert|reconcile|conflict',
    )
    .option('-a, --all', 'Run all technology/scenario combinations')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-q, --quiet', 'Suppress most output');

  program.parse(process.argv);
  const opts = program.opts<{
    tech?: string;
    scenario?: string;
    all?: boolean;
    verbose?: boolean;
    quiet?: boolean;
  }>();

  // Configure log level
  if (opts.verbose) logger.setLevel(LogLevel.DEBUG);
  if (opts.quiet) logger.setLevel(LogLevel.WARN);

  logger.separator();
  logger.info('StageOps Benchmark Suite v1.0.0');
  logger.separator();

  const results: BenchmarkResult[] = [];

  if (opts.all) {
    // Run all combinations
    for (const tech of VALID_TECHS) {
      for (const scenario of VALID_SCENARIOS) {
        logger.info(`\nRunning: ${tech} / ${scenario}`);
        try {
          const result = await runScenario(tech, scenario);
          results.push(result);
        } catch (err) {
          logger.error(`Failed: ${tech}/${scenario} — ${err}`);
        }
      }
    }
  } else {
    // Validate inputs
    const tech = opts.tech as TechName;
    const scenario = opts.scenario as ScenarioName;

    if (!tech || !VALID_TECHS.includes(tech)) {
      console.error(
        `Error: --tech must be one of: ${VALID_TECHS.join(', ')}. Use --all to run everything.`,
      );
      process.exit(1);
    }

    if (!scenario || !VALID_SCENARIOS.includes(scenario)) {
      console.error(
        `Error: --scenario must be one of: ${VALID_SCENARIOS.join(', ')}. Use --all to run everything.`,
      );
      process.exit(1);
    }

    try {
      const result = await runScenario(tech, scenario);
      results.push(result);
    } catch (err) {
      logger.error(`Failed: ${tech}/${scenario} — ${err}`);
      process.exit(1);
    }
  }

  // Print summary
  if (results.length > 0) {
    printResultTable(results);
    writeSummary(results);
  }

  logger.success('Benchmark complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
