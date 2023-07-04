import { Injectable } from '@nestjs/common';

import { WrappedTxEntity } from './entities/wrapped-tx.entity';
import { WrappedTxParameterEntity } from './entities/wrapped-tx-parameter.entity';
import { LuksoDataDbService } from '../../libs/database/lukso-data/lukso-data-db.service';

@Injectable()
export class WrappedTxService {
  constructor(private readonly dataDB: LuksoDataDbService) {}

  async findByTransactionHash(
    transactionHash: string,
    methodId?: string,
  ): Promise<WrappedTxEntity[]> {
    return await this.dataDB.getWrappedTxFromTransactionHash(transactionHash, methodId);
  }

  async findParametersById(wrappedTxId: number): Promise<WrappedTxParameterEntity[]> {
    return await this.dataDB.getWrappedTxParameters(wrappedTxId);
  }
}
