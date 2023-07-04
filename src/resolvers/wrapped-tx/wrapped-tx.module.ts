import { Module } from '@nestjs/common';

import { WrappedTxResolver } from './wrapped-tx.resolver';
import { WrappedTxService } from './wrapped-tx.service';
import { LoggerModule } from '../../libs/logger/logger.module';
import { LuksoDataDbModule } from '../../libs/database/lukso-data/lukso-data-db.module';

@Module({
  imports: [LoggerModule, LuksoDataDbModule],
  providers: [WrappedTxResolver, WrappedTxService],
  exports: [WrappedTxResolver],
})
export class WrappedTxModule {}
