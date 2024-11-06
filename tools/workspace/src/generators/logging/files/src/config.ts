import type { Union2Tuple } from '@lantean/types';

export const LOGS_CONFIG = {
  colorize(str: string, level: string) {
    level = level.toLowerCase();

    switch (level as keyof typeof this.icons) {
      case 'error':
      case 'fatal':
        return `\x1b[41m\x1b[30m${str}\x1b[0m`;
      case 'warn':
        return `\x1b[43m\x1b[30m${str}\x1b[0m`;
      case 'info':
      case 'verbose':
      case 'log':
        return `\x1b[44m\x1b[30m${str}\x1b[0m`;
      case 'debug':
        return `\x1b[47m\x1b[30m${str}\x1b[0m`;
      case 'trace':
        return `\x1b[47m\x1b[30m${str}\x1b[0m`;
      case 'success':
        return `\x1b[42m\x1b[30m${str}\x1b[0m`;
      default:
        return str;
    }
  },
  colors: {
    debug: 'gray',
    error: 'red',
    fatal: 'red',
    info: 'cyan',
    log: 'cyan',
    verbose: 'cyan',
    success: 'green',
    trace: 'orange',
    warn: 'yellow',
  },

  getIcon(icon: string) {
    const level = icon.toLowerCase() as keyof typeof this.icons;

    return this.icons[level];
  },
  icons: {
    debug: '⚙',
    error: '⨯',
    fatal: '⨯',
    info: 'ℹ',
    log: 'ℹ',
    verbose: 'ℹ',
    success: '✓',
    trace: '→',
    warn: '⚠️',
  },

  levels: {
    verbose: 7,
    success: 6,
    info: 5,
    debug: 4,
    trace: 3,
    warn: 2,
    error: 1,
    fatal: 0,
  },
} as const;

export const logLevels = LOGS_CONFIG.levels;
export const logColors = LOGS_CONFIG.colors;
export const logIcons = LOGS_CONFIG.icons;

export type LogLevel = keyof typeof logLevels;
export type LogLevels = Union2Tuple<LogLevel>;
