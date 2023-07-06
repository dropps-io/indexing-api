import { ObjectType, Field, ID } from '@nestjs/graphql';

import { CONTRACT_TYPE } from '../../../models/enums';
import {
  MetadataAssetEntity,
  MetadataImageEntity,
  MetadataLinkEntity,
} from '../../../entities/metadata.entity';
@ObjectType()
export class AddressEntity {
  @Field(() => ID, {
    description: 'The unique address associated with the entity.',
  })
  address: string;

  @Field(() => String, {
    nullable: true,
    description: 'The interface code, such as ERC721, ERC1155, etc.',
  })
  interfaceCode: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The version of the interface.',
  })
  interfaceVersion: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'The type of the contract. E.g. asset, contract, profile, etc.',
  })
  type: CONTRACT_TYPE | null;

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

  @Field(() => Boolean, {
    nullable: true,
    description: 'Indicates whether the entity is a non-fungible token (NFT).',
  })
  isNFT: boolean | null;

  @Field(() => [MetadataImageEntity], {
    nullable: 'items',
    description: 'An array of images associated with the entity.',
  })
  images?: MetadataImageEntity[];

  @Field(() => [String], {
    nullable: 'items',
    description: 'An array of tags that categorize or describe the entity.',
  })
  tags?: string[];

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
