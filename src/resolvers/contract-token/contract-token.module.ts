import { Module } from '@nestjs/common';

import { ContractTokenResolver } from './contract-token.resolver';
import { ContractTokenService } from './contract-token.service';
import { LoggerModule } from '../../libs/logger/logger.module';
import { LuksoDataDbModule } from '../../libs/database/lukso-data/lukso-data-db.module';
@Module({
  imports: [LoggerModule, LuksoDataDbModule],
  providers: [ContractTokenResolver, ContractTokenService],
  exports: [ContractTokenResolver],
})
export class ContractTokenModule {}
