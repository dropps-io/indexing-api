import { Args, ObjectType, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ContractTokenService } from './contract-token.service';
import { ContractTokenEntity } from './entities/contract-token.entity';
import { FindContractTokenArgs } from './dto/find-contract-token.args';
import { Pagination } from '../../entities/pagination.entity';
import { MetadataAssetEntity, MetadataImageEntity } from '../../entities/metadata.entity';

@ObjectType()
class ContractTokensPagination extends Pagination(ContractTokenEntity) {}

@Resolver(() => ContractTokenEntity)
export class ContractTokenResolver {
  constructor(private contractTokenService: ContractTokenService) {}

  @Query(() => ContractTokensPagination)
  async contractToken(@Args() args: FindContractTokenArgs): Promise<ContractTokensPagination> {
    return this.contractTokenService.find(args);
  }

  @ResolveField(() => [MetadataImageEntity], { nullable: 'items' })
  async images(
    @Parent() contractToken: ContractTokenEntity,
    @Args('type', { nullable: true, type: () => String }) type?: string | null,
  ): Promise<MetadataImageEntity[]> {
    return this.contractTokenService.findImages(contractToken.id, type);
  }

  @ResolveField(() => [MetadataAssetEntity], { nullable: 'items' })
  async assets(
    @Parent() contractToken: ContractTokenEntity,
    @Args('fileType', { nullable: true, type: () => String }) fileType?: string,
  ): Promise<MetadataAssetEntity[]> {
    return this.contractTokenService.findAssets(contractToken.id, fileType);
  }
}
