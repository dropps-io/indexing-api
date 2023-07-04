import { Resolver, Query, Args, ResolveField, Parent, ObjectType } from '@nestjs/graphql';

import { AddressService } from './address.service';
import { AddressEntity } from './entities/address.entity';
import { FindAddressArgs } from './dto/find-address.args';
import { Pagination } from '../../entities/pagination.entity';
import {
  MetadataAssetEntity,
  MetadataImageEntity,
  MetadataLinkEntity,
} from '../../entities/metadata.entity';

@ObjectType()
class AddressPagination extends Pagination(AddressEntity) {}

@Resolver(() => AddressEntity)
export class AddressResolver {
  constructor(private addressService: AddressService) {}

  @Query(() => AddressPagination)
  async address(@Args() args: FindAddressArgs): Promise<AddressPagination> {
    return this.addressService.find(args);
  }

  @ResolveField(() => [MetadataImageEntity], { nullable: 'items' })
  async images(
    @Parent() address: AddressEntity,
    @Args('type', { nullable: true, type: () => String }) type?: string | null,
  ): Promise<MetadataImageEntity[]> {
    return this.addressService.findImages(address.id, type);
  }

  @ResolveField(() => [MetadataAssetEntity], { nullable: 'items' })
  async assets(
    @Parent() address: AddressEntity,
    @Args('fileType', { nullable: true, type: () => String }) fileType?: string,
  ): Promise<MetadataAssetEntity[]> {
    return this.addressService.findAssets(address.id, fileType);
  }

  @ResolveField(() => [MetadataLinkEntity], { nullable: 'items' })
  async links(@Parent() address: AddressEntity): Promise<MetadataLinkEntity[]> {
    return this.addressService.findLinks(address.id);
  }

  @ResolveField(() => [String], { nullable: 'items' })
  async tags(@Parent() address: AddressEntity): Promise<string[]> {
    return this.addressService.findTags(address.id);
  }
}
