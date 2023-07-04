import { Module } from '@nestjs/common';

import { LuksoStructureDbService } from './lukso-structure-db.service';
import { LoggerModule } from '../../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [LuksoStructureDbService],
  exports: [LuksoStructureDbService],
})
export class LuksoStructureDbModule {}
