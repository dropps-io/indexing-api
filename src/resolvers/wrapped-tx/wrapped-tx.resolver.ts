import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';

import { WrappedTxService } from './wrapped-tx.service';
import { WrappedTxEntity } from './entities/wrapped-tx.entity';
import { WrappedTxParameterEntity } from './entities/wrapped-tx-parameter.entity';

@Resolver(() => WrappedTxEntity)
export class WrappedTxResolver {
  constructor(private wrappedTxService: WrappedTxService) {}

  @Query(() => [WrappedTxEntity], { nullable: 'items' })
  async wrappedTransactions(
    @Args('transactionHash') transactionHash: string,
    @Args('methodId', { nullable: true, type: () => String }) methodId?: string,
  ): Promise<WrappedTxEntity[]> {
    return this.wrappedTxService.findByTransactionHash(transactionHash, methodId);
  }

  @ResolveField(() => [WrappedTxParameterEntity])
  async parameters(@Parent() wrappedTx: WrappedTxEntity): Promise<WrappedTxParameterEntity[]> {
    return this.wrappedTxService.findParametersById(wrappedTx.id);
  }
}
