import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

/**
 * LoggerService is a NestJS service for logging, using the Winston library.
 * It has separate methods for console and file logging to ensure that logs
 * from the console are never printed to the files and vice versa.
 */
@Injectable()
export class LoggerService {
  private readonly logger: WinstonLogger;

  constructor() {
    const consoleFormat = format.printf((info) => {
      let severity;
      if (info.level === 'info') {
        severity = 'INFO';
      } else if (info.level === 'warn') {
        severity = 'WARNING';
      } else if (info.level === 'error') {
        severity = 'ERROR';
      } else {
        severity = 'DEFAULT';
      }

      // unpack metadata from info[Symbol.for('splat')]
      const metadata = info[Symbol.for('splat')] ? info[Symbol.for('splat')][0] : {};

      const entry = {
        message: `${info.timestamp} ${info.message}`,
        severity: severity,
        service: info.service,
        ...info.metadata,
        ...metadata,
      };

      return JSON.stringify(entry);
    });

    const fileFormat = format.combine(format.timestamp(), format.metadata(), format.json());

    const prod = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';
    const fileLogging = process.env.FILE_LOGGING === 'true';

    const fileTransport = fileLogging
      ? [
          new transports.File({
            filename: 'logs/application.log',
            level: 'debug',
            format: fileFormat,
          }),
          new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
          }),
        ]
      : [];

    // Logger configuration
    this.logger = createLogger({
      format: format.combine(format.timestamp(), format.errors({ stack: true })),
      transports: [
        new transports.Console({
          level: prod ? 'info' : 'debug',
          format: format.combine(consoleFormat),
        }),
        ...fileTransport,
      ],
    });
  }

  /**
   * Log an information message to the application log file.
   * @param service
   */
  public getChildLogger(service: string): WinstonLogger {
    return this.logger.child({ service });
  }
}
