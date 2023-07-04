import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class FindCollectionTokenArgs {
  @Field(() => String, {
    nullable: true,
    description: 'The search input, can be a complete or incomplete name, tokenId, decodedTokenId',
  })
  input?: string;

  @Field(() => String, {
    nullable: true,
    description: 'The address search input, can be a complete or incomplete',
  })
  addressInput?: string;

  @Field(() => String, {
    nullable: true,
    description: 'The interface code, such as ERC721, ERC1155, etc.',
  })
  interfaceCode?: string;

  @Field(() => String, { nullable: true, description: 'The version of the interface.' })
  interfaceVersion?: string;

  @Field(() => String, { nullable: true, description: 'The name of the collection.' })
  collectionName?: string;

  @Field(() => String, { nullable: true, description: 'The symbol of the collection.' })
  collectionSymbol?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Indicates whether the entity is a non-fungible token (NFT).',
  })
  isNFT?: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'The address that should have ownership over the asset.',
  })
  owner?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1, description: 'The page number to query.' })
  page: number; // This is the page number user wants to fetch.
}
