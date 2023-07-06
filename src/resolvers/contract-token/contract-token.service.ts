import { Injectable } from '@nestjs/common';
import { ObjectType } from '@nestjs/graphql';

import { ContractTokenEntity } from './entities/contract-token.entity';
import { FindContractTokenArgs } from './dto/find-contract-token.args';
import { Pagination } from '../../entities/pagination.entity';
import { ADDRESS_PAGE_SIZE } from '../../globals';
import { LuksoDataDbService } from '../../libs/database/lukso-data/lukso-data-db.service';
import { MetadataAssetEntity, MetadataImageEntity } from '../../entities/metadata.entity';

@ObjectType()
class ContractTokensPagination extends Pagination(ContractTokenEntity) {}

@Injectable()
export class ContractTokenService {
  constructor(private readonly dataDB: LuksoDataDbService) {}

  /**
   * Method to find the paginated list of addresses.
   *
   * @param {FindAddressArgs} args - Arguments required to find addresses.
   * @returns {Promise<AddressPagination>} - Paginated list of addresses.
   */
  async find(args: FindContractTokenArgs): Promise<ContractTokensPagination> {
    const {
      addressInput,
      input,
      interfaceVersion,
      contractName,
      contractSymbol,
      interfaceCode,
      owner,
      page,
    } = args;
    let response: ContractTokensPagination = {
      count: 0,
      page,
      pageLength: ADDRESS_PAGE_SIZE,
      totalPages: 0,
      results: [],
    };

    const tokens = await this.dataDB.searchTokenWithMetadata(
      ADDRESS_PAGE_SIZE,
      (page - 1) * ADDRESS_PAGE_SIZE,
      addressInput,
      contractName,
      contractSymbol,
      input,
      interfaceVersion,
      interfaceCode,
      owner,
    );

    response = {
      ...response,
      results: tokens.map((token) => {
        return { ...token, balance: 0, isNFT: true };
      }),
    };
    response.count = await this.dataDB.searchTokenWithMetadataCount(
      addressInput,
      contractName,
      contractSymbol,
      input,
      interfaceVersion,
      interfaceCode,
      owner,
    );

    response.totalPages = Math.ceil(response.count / ADDRESS_PAGE_SIZE);
    return response;
  }

  /**
   * Method to find the images associated with an address.
   *
   * @param {number} metadataId - ID of the metadata.
   * @param {string | null} type - Optional type of the image.
   * @returns {Promise<MetadataImageEntity[]>} - Array of images.
   */
  async findImages(metadataId: number, type?: string | null): Promise<MetadataImageEntity[]> {
    return await this.dataDB.getMetadataImages(metadataId, type);
  }

  async findAssets(metadataId: number, fileType?: string): Promise<MetadataAssetEntity[]> {
    return await this.dataDB.getMetadataAssetsByMetadataId(metadataId, fileType);
  }
}
