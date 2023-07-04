import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class FindTokenHolderArgs {
  @Field(() => String, {
    nullable: true,
    description: 'The address of the holder',
  })
  holderAddress?: string;

  @Field(() => String, {
    nullable: true,
    description: 'The address of the token contract',
  })
  contractAddress?: string;

  @Field(() => String, {
    nullable: true,
    description: 'The token ID of the token',
  })
  tokenId?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'The minimum amount of tokens to be held by the holder (in eth or in units)',
  })
  minBalance?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'The maximum amount of tokens to be held by the holder (in eth or in units)',
  })
  maxBalance?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'The block number after which the holder has started to hold the tokens',
  })
  holderAfterBlock?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'The block number before which the holder has started to hold the tokens',
  })
  holderBeforeBlock?: number;

  @Field(() => Int, { nullable: true, defaultValue: 1, description: 'The page number to query.' })
  page: number; // This is the page number user wants to fetch.
}
