import { ObjectType, Field } from '@nestjs/graphql';

import { AddressEntity } from '../../address/entities/address.entity';

@ObjectType()
export class TokenHolderEntity {
  @Field(() => String, {
    nullable: false,
    description: 'The address associated with the token contract.',
  })
  contractAddress: string;

  @Field(() => String, {
    nullable: false,
    description: 'The address associated with the token holder.',
  })
  holderAddress: string;

  @Field(() => String, {
    nullable: true,
    description: 'The token id associated with the token.',
  })
  tokenId: string | null;

  @Field(() => Number, {
    nullable: false,
    description: 'The balance owned by the holder, in eth or unit.',
  })
  balanceInEth: number;

  @Field(() => String, {
    nullable: false,
    description: 'The balance owned by the holder, in wei or unit.',
  })
  balanceInWei: string;

  @Field(() => Number, {
    nullable: false,
    description: 'The block since when the holder held the token.',
  })
  holderSinceBlock: number;

  @Field(() => AddressEntity, {
    nullable: true,
    description: 'The details of the holder address.',
  })
  holderAddressDetails?: AddressEntity | null;

  @Field(() => AddressEntity, {
    nullable: true,
    description: 'The details of the token address.',
  })
  tokenAddressDetails?: AddressEntity | null;
}
