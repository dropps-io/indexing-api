import { ObjectType, Field } from '@nestjs/graphql';

import { WrappedTxParameterEntity } from './wrapped-tx-parameter.entity';

@ObjectType()
export class WrappedTxEntity {
  id: number;
  parentId: number | null;

  @Field(() => String, {
    description: 'The transaction hash of the wrapped transaction.',
  })
  transactionHash: string;

  @Field(() => Number, {
    description: 'The block number of the transaction.',
  })
  blockNumber: number;

  @Field(() => String, {
    description: 'The address from where this wrapped transaction is emitted.',
  })
  from: string;

  @Field(() => String, {
    description: 'The address to where this wrapped transaction is executed.',
  })
  to: string;

  @Field(() => String, {
    description: 'The value (in native token) contained in the wrapped transaction.',
  })
  value: string;

  @Field(() => String, {
    description: 'The method id of the wrapped transaction.',
  })
  methodId: string;

  @Field(() => String, {
    nullable: true,
    description: 'The method name of the wrapped transaction.',
  })
  methodName: string | null;

  @Field(() => [WrappedTxParameterEntity], {
    nullable: 'items',
    description: 'An array of the parameters of the wrapped transaction.',
  })
  wrappedTxParameters?: WrappedTxParameterEntity[];

  @Field(() => [WrappedTxEntity], {
    nullable: 'items',
    description: 'An array of wrapped transactions contained in the wrapped transaction.',
  })
  wrappedTxEntities?: WrappedTxEntity[];
}
