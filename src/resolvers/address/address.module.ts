import { Module } from '@nestjs/common';

import { AddressResolver } from './address.resolver';
import { AddressService } from './address.service';
import { LoggerModule } from '../../libs/logger/logger.module';
import { LuksoDataDbModule } from '../../libs/database/lukso-data/lukso-data-db.module';

@Module({
  imports: [LoggerModule, LuksoDataDbModule],
  providers: [AddressResolver, AddressService],
  exports: [AddressResolver],
})
export class AddressModule {}
