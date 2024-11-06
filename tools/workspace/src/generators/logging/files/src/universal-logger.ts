// https://github.com/nestjs/nest/issues/507#issuecomment-374221089
// https://adrianhall.github.io/cloud/2019/06/30/building-an-efficient-logger-in-typescript/
import isError from 'lodash/isError';

import universalLogger, { TRACE, DEBUG, INFO, WARN, ERROR } from 'universal-logger';
import { styleable } from 'universal-logger-browser';

import { LogLevel } from './config';

/**
 * The Logger class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
class Logger {
  private static instance?: Logger;
  private static level?: LogLevel;
  private static project?: string;
  private logger?: ReturnType<typeof universalLogger>;

  /**
   * The Logger's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(project: string, level: LogLevel) {
    Logger.level = level;
    Logger.project = project;

    this.configure();
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Logger class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(project: string, level: LogLevel): Logger {
    if (!Logger.instance) Logger.instance = new Logger(project, level);

    return Logger.instance;
  }

  private getLevel() {
    switch (Logger.level) {
      case 'verbose':
        return TRACE;
      case 'success':
        return DEBUG;
      case 'info':
        return INFO;
      case 'debug':
        return DEBUG;
      case 'trace':
        return TRACE;
      case 'warn':
        return WARN;
      case 'error':
        return ERROR;
      case 'fatal':
        return ERROR;
      default:
        return TRACE;
    }
  }

  private configure() {
    this.logger = universalLogger(Logger.project)
      .use(styleable({ showSource: true, showTimestamp: true }))
      .on('log', () => {
        // If context.level === Error
        // Call snetry
      });

    this.logger.disableStackTrace();
    this.logger.setLevel(this.getLevel());
  }

  fatal(message: string, ...args: unknown[]) {
    this.logger?.error(message, ...args);
  }

  error(error: Error, message = '') {
    let msg = message;

    if (isError(error)) {
      msg = '';

      const scope = error.stack?.split('\n')[2]?.trim().split(' ')[1];

      if (scope) msg += `(${scope}): `;

      msg += message;

      if (error.message) {
        msg += ' - ';
        msg += error.message;
      }
    }

    // Add error monitoring here

    this.logger?.error(msg, error);
  }

  warn(message: string, ...args: unknown[]) {
    this.logger?.warn(message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.logger?.info(message, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    this.logger?.debug(message, ...args);
  }

  trace(message: string, ...args: unknown[]) {
    this.logger?.trace(message, ...args);
  }

  success(message: string, ...args: unknown[]) {
    this.logger?.info(message, ...args);
  }
}

/**
 * Creates and returns a singleton instance of the Logger for a given project.
 * This ensures that only one Logger instance exists for each unique project
 * and log level combination.
 *
 * @param project - The name of the project for which the logger is created.
 * @param level - The log level for the logger, which determines the severity
 * of messages to be logged.
 * @returns The singleton Logger instance for the specified project and level.
 */
export function createProjectLogger(project: string, level: LogLevel) {
  return Logger.getInstance(project, level);
}
