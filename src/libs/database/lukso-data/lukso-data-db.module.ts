import { Module } from '@nestjs/common';

import { LuksoDataDbService } from './lukso-data-db.service';
import { LoggerModule } from '../../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [LuksoDataDbService],
  exports: [LuksoDataDbService],
})
export class LuksoDataDbModule {}
