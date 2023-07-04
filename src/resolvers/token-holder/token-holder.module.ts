import { Module } from '@nestjs/common';

import { TokenHolderResolver } from './token-holder.resolver';
import { TokenHolderService } from './token-holder.service';
import { LoggerModule } from '../../libs/logger/logger.module';
import { LuksoDataDbModule } from '../../libs/database/lukso-data/lukso-data-db.module';

@Module({
  imports: [LoggerModule, LuksoDataDbModule],
  providers: [TokenHolderResolver, TokenHolderService],
  exports: [TokenHolderResolver],
})
export class TokenHolderModule {}
