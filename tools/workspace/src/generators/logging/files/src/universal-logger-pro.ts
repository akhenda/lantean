// https://github.com/nestjs/nest/issues/507#issuecomment-374221089
// https://adrianhall.github.io/cloud/2019/06/30/building-an-efficient-logger-in-typescript/
import isError from 'lodash/isError';

import { Logger as UniversalLoggerPro } from 'universal-logger-pro';

import { LogLevel } from './config';

/**
 * The Logger class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
class Logger {
  // eslint-disable-next-line no-use-before-define
  private static instance?: Logger;
  private static level?: LogLevel;
  private static project?: string;
  private logger?: UniversalLoggerPro;

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

  private configure() {
    this.logger = UniversalLoggerPro.getInstance({
      // Basic configuration
      colors: process.stdout.isTTY, // Colors in dev, plain in prod
      timestamp: true,
      format: 'json', // Structured logging in prod
      minLevel: Logger.level,

      // Timestamp formatting
      timeFormat: 'ISO', // 'ISO' | 'UTC' | 'UNIX' | 'locale'
      timeZone: 'America/New_York', // Any valid timezone

      // Output styling
      indentation: 2, // Spaces for metadata formatting
      levelColumnWidth: 7, // Width of level column
      colorizeObjects: true, // Colorize object output
      prettyPrint: false, // Pretty print objects

      // Development helpers
      debugMode: false, // Extra debug information
      stackTraceLimit: 10, // Limit stack trace lines

      // Data protection
      maskSecrets: true, // Mask sensitive data
      maskFields: ['password', 'token', 'key'], // Fields to mask
      maskChar: '*', // Character for masking

      // Buffering & async
      bufferSize: 1000, // Buffer size for batch writing
      flushInterval: 5000, // Flush interval in ms
      asyncLogging: true, // Enable async logging

      // File management
      compression: true, // Compress rotated logs
      compressFormat: 'gzip', // 'gzip' | 'zip'
      logFileMode: 0o666, // File permissions

      // File handling
      // outputFile: 'app.log',
      // maxSize: 5 * 1024 * 1024, // 5MB
      // rotate: true,
      // rotateCount: 5,
      // compress: true,

      // Error handling
      // errorHandler: (error) => sendToSentry(error),
      // exitOnError: false,

      // Metadata
      metadata: {
        app: Logger.project,
        env: process.env.NODE_ENV,
      },
    });
  }

  fatal(message: string, ...args: unknown[]) {
    this.logger?.fatal(message, ...args);
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
    this.logger?.info('info', message, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    this.logger?.debug(message, ...args);
  }

  trace(message: string, ...args: unknown[]) {
    this.logger?.trace(message, ...args);
  }

  success(message: string, ...args: unknown[]) {
    this.logger?.success(message, ...args);
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
