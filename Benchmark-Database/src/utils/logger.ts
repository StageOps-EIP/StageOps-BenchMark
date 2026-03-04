/**
 * Logger utility for the benchmark suite.
 * Provides colored, timestamped console output.
 */

import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

let currentLevel: LogLevel = LogLevel.INFO;

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

export const logger = {
  setLevel(level: LogLevel): void {
    currentLevel = level;
  },

  debug(msg: string): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[${timestamp()}] DEBUG: ${msg}`));
    }
  },

  info(msg: string): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(chalk.cyan(`[${timestamp()}] INFO:  ${msg}`));
    }
  },

  warn(msg: string): void {
    if (currentLevel <= LogLevel.WARN) {
      console.log(chalk.yellow(`[${timestamp()}] WARN:  ${msg}`));
    }
  },

  error(msg: string): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.log(chalk.red(`[${timestamp()}] ERROR: ${msg}`));
    }
  },

  success(msg: string): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(chalk.green(`[${timestamp()}] ✔ ${msg}`));
    }
  },

  separator(): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(chalk.gray('─'.repeat(70)));
    }
  },
};
