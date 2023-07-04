import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MetadataImageEntity {
  @Field(() => String, { description: 'The URL of the image.' })
  url: string;

  @Field(() => Number, { description: 'The width of the image in pixels.' })
  width: number;

  @Field(() => Number, { description: 'The height of the image in pixels.' })
  height: number;

  @Field(() => String, {
    nullable: true,
    description: 'The type of the image: profile, background, etc.',
  })
  type: string | null;

  @Field(() => String, {
    description: 'The unique keccak hash of the image content.',
  })
  hash: string;
}

@ObjectType()
export class MetadataAssetEntity {
  @Field({ description: 'The URL of the asset.' })
  url: string;

  @Field({ description: 'The file type of the asset, such as "application/pdf", etc.' })
  fileType: string;

  @Field({
    description: 'The unique hash of the asset content.',
  })
  hash: string;
}

@ObjectType()
export class MetadataLinkEntity {
  @Field({ description: 'The title of the related link.' })
  title: string;

  @Field({ description: 'The URL of the related link.' })
  url: string;
}
