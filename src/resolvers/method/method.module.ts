import { Module } from '@nestjs/common';

import { MethodResolver } from './method.resolver';
import { MethodService } from './method.service';
import { LoggerModule } from '../../libs/logger/logger.module';
import { LuksoStructureDbModule } from '../../libs/database/lukso-structure/lukso-structure-db.module';

@Module({
  imports: [LoggerModule, LuksoStructureDbModule],
  providers: [MethodResolver, MethodService],
  exports: [MethodResolver],
})
export class MethodModule {}
