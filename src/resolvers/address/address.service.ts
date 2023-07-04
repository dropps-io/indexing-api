import { Injectable } from '@nestjs/common';
import winston from 'winston';
import { ObjectType } from '@nestjs/graphql';

import { AddressEntity } from './entities/address.entity';
import { Pagination } from '../../entities/pagination.entity';
import {
  MetadataAssetEntity,
  MetadataImageEntity,
  MetadataLinkEntity,
} from '../../entities/metadata.entity';
import { FindAddressArgs } from './dto/find-address.args';
import { ADDRESS_PAGE_SIZE } from '../../globals';
import { LuksoDataDbService } from '../../libs/database/lukso-data/lukso-data-db.service';
import { isEthereumAddress } from '../../utils/is-ethereum-address';
import { LoggerService } from '../../libs/logger/logger.service';

@ObjectType()
class AddressPagination extends Pagination(AddressEntity) {}

@Injectable()
export class AddressService {
  private readonly logger: winston.Logger;

  constructor(
    private readonly dataDB: LuksoDataDbService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = loggerService.getChildLogger('AddressService');
  }

  /**
   * Method to find the paginated list of addresses.
   *
   * @param {FindAddressArgs} args - Arguments required to find addresses.
   * @returns {Promise<AddressPagination>} - Paginated list of addresses.
   */
  async find(args: FindAddressArgs): Promise<AddressPagination> {
    const { input, page } = args;
    let response: AddressPagination = {
      count: 0,
      page,
      pageLength: ADDRESS_PAGE_SIZE,
      totalPages: 0,
      results: [],
    };
    if (input && isEthereumAddress(input)) {
      try {
        const contract = await this.dataDB.getContractWithMetadataByAddress(input);
        response.results = contract ? [contract] : [];
        response.count = contract ? 1 : 0;
      } catch (e) {
        this.logger.error(`Error while searching for contract by address: ${e.message}`, {
          stack: e.stack,
          ...args,
        });
        throw e;
      }
    } else response = { ...response, ...(await this.findAddress(args)) };

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

  async findLinks(metadataId: number): Promise<MetadataLinkEntity[]> {
    return await this.dataDB.getMetadataLinks(metadataId);
  }

  async findTags(metadataId: number): Promise<string[]> {
    return await this.dataDB.getMetadataTagsByMetadataId(metadataId);
  }

  /**
   * Helper method to find address either by incomplete address or name.
   *
   * @param {FindAddressArgs} args - Arguments required to find addresses.
   * @returns {Promise<{ results: AddressEntity[]; count: number }>} - Resulting addresses and their count.
   */
  protected async findAddress(
    args: FindAddressArgs,
  ): Promise<{ results: AddressEntity[]; count: number }> {
    const { input, page, type, interfaceVersion, interfaceCode, tag, havePermissions } = args;

    let count = 0;
    try {
      count = await this.dataDB.searchContractCount(
        input,
        type,
        interfaceVersion,
        interfaceCode,
        tag,
        havePermissions,
      );
      if ((page - 1) * ADDRESS_PAGE_SIZE > count) return { results: [], count };
    } catch (error) {
      this.logger.error(`Error while counting addresses: ${error.message}`);
      throw error;
    }

    let results: AddressEntity[] = [];
    try {
      results = await this.dataDB.searchContractWithMetadata(
        ADDRESS_PAGE_SIZE,
        (page - 1) * ADDRESS_PAGE_SIZE,
        input,
        type,
        interfaceVersion,
        interfaceCode,
        tag,
        havePermissions,
      );
    } catch (error) {
      this.logger.error(`Error while retrieving addresses: ${error.message}`);
      throw error;
    }

    return { results, count };
  }
}
