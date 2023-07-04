import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

/**
 * LoggerService is a NestJS service for logging, using the Winston library.
 * It has separate methods for console and file logging to ensure that logs
 * from the console are never printed to the files and vice versa.
 */
@Injectable()
export class LoggerService {
  private readonly logger: WinstonLogger;

  constructor() {
    const consoleFormat = format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    });

    // Logger configuration
    this.logger = createLogger({
      format: format.errors({ stack: true }),
      transports: [
        new transports.Console({
          level: 'info',
          format: format.combine(format.colorize(), format.timestamp(), consoleFormat),
        }),
        new LoggingWinston(),
      ],
    });
  }

  /**
   * Log an information message to the application log file.
   * @param service
   * @param process
   */
  public getChildLogger(service: string, process?: 'REWARDS' | 'VALIDATORS'): WinstonLogger {
    return this.logger.child({ service, process });
  }
}
