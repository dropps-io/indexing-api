import { ObjectType, Field, ID } from '@nestjs/graphql';

import {
  MetadataAssetEntity,
  MetadataImageEntity,
  MetadataLinkEntity,
} from '../../../entities/metadata.entity';

@ObjectType()
export class CollectionTokenEntity {
  @Field(() => ID, {
    nullable: false,
    description: 'The unique address associated with the entity.',
  })
  address: string;

  @Field(() => String, {
    nullable: true,
    description: 'The token id associated with the entity.',
  })
  tokenId: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The decoded version of the token id associated with the entity.',
  })
  decodedTokenId: string | null;

  @Field(() => Number, {
    nullable: true,
    description: 'The balance owned of the entity.',
  })
  balance: number | null;

  @Field(() => String, {
    nullable: false,
    description: 'The interface code, such as ERC721, ERC1155, etc.',
  })
  interfaceCode: string;

  @Field(() => String, {
    nullable: true,
    description: 'The version of the interface.',
  })
  interfaceVersion: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The name of the entity.',
  })
  name: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The symbol of the entity, typically a short-form name or abbreviation.',
  })
  symbol: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'A description of the entity.',
  })
  description: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The name of the asset collection.',
  })
  collectionName: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The symbol of the asset collection, typically a short-form name or abbreviation.',
  })
  collectionSymbol: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'A description of the asset collection.',
  })
  collectionDescription: string | null;

  @Field(() => Boolean, {
    nullable: false,
    description: 'Indicates whether the entity is a non-fungible token (NFT).',
  })
  isNFT: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Address of the latest know token owner.',
  })
  latestKnownOwner: string | null;

  @Field(() => [MetadataImageEntity], {
    nullable: 'items',
    description: 'An array of images associated with the entity.',
  })
  images?: MetadataImageEntity[];

  @Field(() => [MetadataLinkEntity], {
    nullable: 'items',
    description: 'An array of related links with titles and URLs.',
  })
  links?: MetadataLinkEntity[];

  @Field(() => [MetadataAssetEntity], {
    nullable: 'items',
    description: 'An array of assets associated with the entity.',
  })
  assets?: MetadataAssetEntity[];

  // Metadata ID
  id: number;
}
