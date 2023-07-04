import { Test, TestingModule } from '@nestjs/testing';
import {
  ADDRESS1,
  ADDRESS2,
  ADDRESS3,
  HASH1,
  HASH2,
  HASH3,
  URL1,
  URL2,
} from '@test/utils/test-values';
import { executeQuery } from '@test/utils/db-helpers';

import { ContractTokenTable } from './entities/contract-token.table';
import { MetadataAssetTable } from './entities/metadata-asset.table';
import { MetadataTagTable } from './entities/metadata-tag.table';
import { TransactionTable } from './entities/tx.table';
import { EventParameterTable } from './entities/event-parameter.table';
import { ContractTable } from './entities/contract.table';
import { DataChangedTable } from './entities/data-changed.table';
import { EventTable } from './entities/event.table';
import { MetadataLinkTable } from './entities/metadata-link.table';
import { TxParameterTable } from './entities/tx-parameter.table';
import { MetadataTable } from './entities/metadata.table';
import { TxInputTable } from './entities/tx-input.table';
import { LuksoDataDbService } from './lukso-data-db.service';
import { MetadataImageTable } from './entities/metadata-image.table';
import { DB_DATA_TABLE } from './config';
import { WrappedTxTable } from './entities/wrapped-tx.table';
import { WrappedTxInputTable } from './entities/wrapped-tx-input.table';
import { WrappedTxParameterTable } from './entities/wrapped-tx-parameter.table';
import { CONTRACT_TYPE } from '../../../models/enums';
import { LoggerService } from '../../logger/logger.service';

describe('LuksoDataDbService', () => {
  let service: LuksoDataDbService;

  const contract: ContractTable = {
    address: ADDRESS1,
    interfaceCode: 'LSP0',
    interfaceVersion: '0.8.0',
    type: CONTRACT_TYPE.PROFILE,
  };

  const contract1: ContractTable = {
    address: ADDRESS1,
    interfaceCode: 'LSP0',
    interfaceVersion: '0.8.0',
    type: CONTRACT_TYPE.PROFILE,
  };

  const contractToken1: ContractTokenTable = {
    id: HASH1,
    address: ADDRESS1,
    index: 1,
    decodedTokenId: 'Hello Test',
    tokenId: '0x0000000000000000000000000000000000000000000048656c6c6f2054657374',
    interfaceCode: 'LSP8',
    latestKnownOwner: ADDRESS1,
  };

  const contractMetadata: Omit<MetadataTable, 'id'> = {
    address: ADDRESS1,
    tokenId: null,
    name: 'Test Token',
    symbol: 'TST',
    description: 'A test token',
    isNFT: true,
  };

  const tokenMetadata = { ...contractMetadata, tokenId: contractToken1.tokenId };

  const transaction: TransactionTable = {
    hash: HASH1,
    nonce: 1,
    blockHash: HASH1,
    blockNumber: 42,
    date: new Date(),
    transactionIndex: 0,
    methodId: '0x12345678',
    methodName: null,
    from: ADDRESS1,
    to: ADDRESS2,
    value: '1000000000000000000',
    gasPrice: '20000000000',
    gas: 21000,
  };

  const event: EventTable = {
    id: HASH2,
    blockNumber: 42,
    date: new Date(),
    transactionHash: HASH1,
    logIndex: 0,
    address: ADDRESS1,
    eventName: 'TestEvent',
    methodId: HASH2.slice(0, 10),
    topic0: HASH1,
    topic1: HASH2,
    topic2: HASH3,
    topic3: null,
    data: '0xjkl',
  };

  const wrappedTransaction: Omit<WrappedTxTable, 'id'> = {
    transactionHash: HASH1,
    parentId: null,
    blockNumber: 1234,
    from: ADDRESS1,
    to: ADDRESS2,
    value: '1000000000000000000',
    methodId: '0x12345678',
    methodName: 'transfer',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LuksoDataDbService, { provide: LoggerService, useValue: new LoggerService() }],
    }).compile();

    service = module.get<LuksoDataDbService>(LuksoDataDbService);
  });

  afterEach(async () => {
    // make sure to close the connections to the database
    await service.disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // This is a sample test suite. In practice, you should use a test database and clean up after each test.
  describe('ContractTable', () => {
    it('should be able insert a contract', async () => {
      await service.insertContract(contract1);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.CONTRACT}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(contract1);
    });

    it('should be able to query a contract by address', async () => {
      await service.insertContract(contract1);

      const res = await service.getContractByAddress(contract1.address);
      expect(res).toEqual(contract1);
    });

    it('should throw by default if inserting on existing contract', async () => {
      await service.insertContract(contract1);
      await expect(service.insertContract(contract1)).rejects.toThrow();
    });

    it('should not throw if inserting on existing contract when do nothing on conflict', async () => {
      await service.insertContract(contract1);
      await expect(service.insertContract(contract1, 'do nothing')).resolves.not.toThrow();
    });

    it('should update if inserting on existing contract when update on conflict', async () => {
      await service.insertContract(contract1);
      await service.insertContract(
        { ...contract1, interfaceCode: 'NEW_CODE', interfaceVersion: 'NEW_VERSION' },
        'update',
      );
      const res = await service.getContractByAddress(contract1.address);

      expect(res).toEqual({
        ...contract1,
        interfaceCode: 'NEW_CODE',
        interfaceVersion: 'NEW_VERSION',
      });
    });

    it('should return null if query a non-existing contract', async () => {
      const res = await service.getContractByAddress(contract1.address);
      expect(res).toBeNull();
    });

    describe('getContractsToIndex', () => {
      it('should return an array of contract addresses with null interfaceCode', async () => {
        // insert contracts with null interfaceCode
        await service.insertContract({
          address: ADDRESS1,
          interfaceCode: null,
          interfaceVersion: '1.0',
          type: null,
        });
        await service.insertContract({
          address: ADDRESS2,
          interfaceCode: null,
          interfaceVersion: '1.0',
          type: null,
        });

        // insert contracts with non-null interfaceCode
        await service.insertContract({
          address: ADDRESS3,
          interfaceCode: 'LSP1',
          interfaceVersion: '1.0',
          type: null,
        });

        const result = await service.getContractsToIndex();

        expect(result).toEqual([ADDRESS1, ADDRESS2]);
      });

      it('should return an empty array when there are no contracts with null interfaceCode', async () => {
        await service.insertContract({
          address: ADDRESS1,
          interfaceCode: 'LSP0',
          interfaceVersion: '1.0',
          type: null,
        });
        await service.insertContract({
          address: ADDRESS2,
          interfaceCode: 'LSP1',
          interfaceVersion: '1.0',
          type: null,
        });

        const result = await service.getContractsToIndex();

        expect(result).toEqual([]);
      });

      it('should return an empty array when there are no contracts', async () => {
        const result = await service.getContractsToIndex();
        expect(result).toEqual([]);
      });
    });
  });

  describe('ContractTokenTable', () => {
    beforeEach(async () => {
      await service.insertContract(contract1);
    });

    it('should be able to insert a contract token', async () => {
      await service.insertContractToken(contractToken1);
      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.CONTRACT_TOKEN}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(contractToken1);
    });

    it('should throw by default if inserting on existing token', async () => {
      await service.insertContractToken(contractToken1);
      await expect(service.insertContractToken(contractToken1)).rejects.toThrow();
    });

    it('should not throw if inserting on existing token when do nothing on conflict', async () => {
      await service.insertContractToken(contractToken1);
      await expect(
        service.insertContractToken(contractToken1, 'do nothing'),
      ).resolves.not.toThrow();
    });

    it('should be able to update on conflict', async () => {
      await service.insertContractToken(contractToken1);
      await service.insertContractToken(
        { ...contractToken1, interfaceCode: 'NEW_CODE', decodedTokenId: 'TOKEN_ID' },
        'update',
      );
      const res = await service.getContractTokenById(contractToken1.id);

      expect(res).toEqual({
        ...contractToken1,
        interfaceCode: 'NEW_CODE',
        decodedTokenId: 'TOKEN_ID',
      });
    });

    it('should be able to query a contract token by id', async () => {
      await service.insertContractToken(contractToken1);

      const res = await service.getContractTokenById(contractToken1.id);
      expect(res).toEqual(contractToken1);
    });

    it('should return null if query an unknown id', async () => {
      const res = await service.getContractTokenById(contractToken1.id);
      expect(res).toBeNull();
    });

    it('should increment index automatically for each contract address', async () => {
      await service.insertContract({ ...contract1, address: ADDRESS2 });

      await service.insertContractToken(contractToken1);
      await service.insertContractToken({ ...contractToken1, id: HASH2, tokenId: HASH2 });
      await service.insertContractToken({ ...contractToken1, id: HASH3, address: ADDRESS2 });

      const res1 = await service.getContractTokenById(HASH1);
      const res2 = await service.getContractTokenById(HASH2);
      const res3 = await service.getContractTokenById(HASH3);

      expect(res1?.index).toEqual(1);
      expect(res2?.index).toEqual(2);
      expect(res3?.index).toEqual(1);
    });

    describe('getTokensToIndex', () => {
      it('should return an array of contract tokens with null decodedTokenId', async () => {
        // Insert tokens with null decodedTokenId
        await service.insertContractToken({
          id: HASH1,
          address: ADDRESS1,
          decodedTokenId: null,
          tokenId: HASH1,
          interfaceCode: 'LSP8',
          latestKnownOwner: ADDRESS2,
        });
        await service.insertContractToken({
          id: HASH2,
          address: ADDRESS1,
          decodedTokenId: null,
          tokenId: HASH2,
          interfaceCode: 'LSP8',
          latestKnownOwner: ADDRESS2,
        });

        // Insert tokens with non-null decodedTokenId
        await service.insertContractToken({
          id: HASH3,
          address: ADDRESS1,
          decodedTokenId: '3',
          tokenId: '3',
          interfaceCode: 'LSP8',
          latestKnownOwner: ADDRESS2,
        });

        const result = await service.getTokensToIndex();

        expect(result).toEqual([
          {
            id: HASH1,
            address: ADDRESS1,
            index: 1,
            decodedTokenId: null,
            tokenId: HASH1,
            interfaceCode: 'LSP8',
            latestKnownOwner: ADDRESS2,
          },
          {
            id: HASH2,
            address: ADDRESS1,
            index: 2,
            decodedTokenId: null,
            tokenId: HASH2,
            interfaceCode: 'LSP8',
            latestKnownOwner: ADDRESS2,
          },
        ]);
      });

      it('should return an empty array when there are no tokens with null decodedTokenId', async () => {
        await service.insertContractToken({
          id: HASH1,
          address: ADDRESS1,
          decodedTokenId: '1',
          tokenId: '1',
          interfaceCode: 'LSP8',
          latestKnownOwner: ADDRESS2,
        });
        await service.insertContractToken({
          id: HASH2,
          address: ADDRESS1,
          decodedTokenId: '2',
          tokenId: '2',
          interfaceCode: 'LSP8',
          latestKnownOwner: ADDRESS2,
        });

        const result = await service.getTokensToIndex();

        expect(result).toEqual([]);
      });

      it('should return an empty array when there are no tokens', async () => {
        const result = await service.getTokensToIndex();
        expect(result).toEqual([]);
      });
    });
  });

  describe('TokenHolderTable', () => {
    describe('When tokenId is null', () => {
      const tokenHolder1 = {
        holderAddress: ADDRESS2,
        contractAddress: contractToken1.address,
        tokenId: null,
        balanceInEth: 1,
        balanceInWei: '1000000000000000000',
        holderSinceBlock: 1234,
      };

      beforeEach(async () => {
        await service.insertContract(contract1);
        await service.insertContractToken(contractToken1);
      });

      it('should be able to insert a token holder', async () => {
        await service.insertTokenHolder(tokenHolder1);
        const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.TOKEN_HOLDER}`, 'DATA');
        expect(res.rows.length).toEqual(1);
        expect(res.rows[0]).toEqual(tokenHolder1);
      });

      it('should throw by default if inserting on existing holder', async () => {
        await service.insertTokenHolder(tokenHolder1);
        await expect(service.insertTokenHolder(tokenHolder1)).rejects.toThrow();
      });

      it('should not throw if inserting on existing holder when do nothing on conflict', async () => {
        await service.insertTokenHolder(tokenHolder1);
        await expect(service.insertTokenHolder(tokenHolder1, 'do nothing')).resolves.not.toThrow();
      });

      it('should be able to update balances on conflict', async () => {
        await service.insertTokenHolder(tokenHolder1);
        await service.insertTokenHolder(
          { ...tokenHolder1, balanceInWei: 'NEW_BALANCE', balanceInEth: 999, holderSinceBlock: 2 },
          'update',
        );
        const res = await service.getTokenHolder(
          tokenHolder1.holderAddress,
          tokenHolder1.contractAddress,
          tokenHolder1.tokenId,
        );

        expect(res).toEqual({
          ...tokenHolder1,
          balanceInWei: 'NEW_BALANCE',
          balanceInEth: 999,
          holderSinceBlock: tokenHolder1.holderSinceBlock,
        });
      });

      it('should be able to query a token holder by address and tokenId', async () => {
        await service.insertTokenHolder(tokenHolder1);
        const res = await service.getTokenHolder(
          tokenHolder1.holderAddress,
          tokenHolder1.contractAddress,
          tokenHolder1.tokenId,
        );
        expect(res).toEqual(tokenHolder1);
      });

      it('should return null if query an unknown address and tokenId', async () => {
        const res = await service.getTokenHolder(
          tokenHolder1.holderAddress,
          tokenHolder1.contractAddress,
          tokenHolder1.tokenId,
        );
        expect(res).toBeNull();
      });
    });

    describe('When tokenId is not null', () => {
      const tokenHolder1 = {
        holderAddress: ADDRESS2,
        contractAddress: contractToken1.address,
        tokenId: contractToken1.tokenId,
        balanceInEth: 1,
        balanceInWei: '1000000000000000000',
        holderSinceBlock: 1234,
      };

      beforeEach(async () => {
        await service.insertContract(contract1);
        await service.insertContractToken(contractToken1);
      });

      it('should be able to insert a token holder', async () => {
        await service.insertTokenHolder(tokenHolder1);
        const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.TOKEN_HOLDER}`, 'DATA');
        expect(res.rows.length).toEqual(1);
        expect(res.rows[0]).toEqual(tokenHolder1);
      });

      it('should throw by default if inserting on existing holder', async () => {
        await service.insertTokenHolder(tokenHolder1);
        await expect(service.insertTokenHolder(tokenHolder1)).rejects.toThrow();
      });

      it('should not throw if inserting on existing holder when do nothing on conflict', async () => {
        await service.insertTokenHolder(tokenHolder1);
        await expect(service.insertTokenHolder(tokenHolder1, 'do nothing')).resolves.not.toThrow();
      });

      it('should be able to update balances on conflict', async () => {
        await service.insertTokenHolder(tokenHolder1);
        await service.insertTokenHolder(
          { ...tokenHolder1, balanceInWei: 'NEW_BALANCE', balanceInEth: 999, holderSinceBlock: 2 },
          'update',
        );
        const res = await service.getTokenHolder(
          tokenHolder1.holderAddress,
          tokenHolder1.contractAddress,
          tokenHolder1.tokenId,
        );

        expect(res).toEqual({
          ...tokenHolder1,
          balanceInWei: 'NEW_BALANCE',
          balanceInEth: 999,
          holderSinceBlock: tokenHolder1.holderSinceBlock,
        });
      });

      it('should be able to query a token holder by address and tokenId', async () => {
        await service.insertTokenHolder(tokenHolder1);
        const res = await service.getTokenHolder(
          tokenHolder1.holderAddress,
          tokenHolder1.contractAddress,
          tokenHolder1.tokenId,
        );
        expect(res).toEqual(tokenHolder1);
      });

      it('should return null if query an unknown address and tokenId', async () => {
        const res = await service.getTokenHolder(
          tokenHolder1.holderAddress,
          tokenHolder1.contractAddress,
          tokenHolder1.tokenId,
        );
        expect(res).toBeNull();
      });
    });
  });

  describe('MetadataTable', () => {
    beforeEach(async () => {
      await service.insertContract(contract1);
    });

    it('should be able to insert metadata for a contract', async () => {
      await service.insertMetadata(contractMetadata);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(contractMetadata);
    });

    it('should throw by default when inserting metadata for an existing contract', async () => {
      await service.insertMetadata(contractMetadata);

      await expect(service.insertMetadata(contractMetadata)).rejects.toThrow();
    });

    it('should be able to update when inserting metadata for an existing contract', async () => {
      const updatedContract = {
        ...contractMetadata,
        name: 'NEW_NAME',
        isNFT: true,
        symbol: 'NEW',
        description: 'NEW_DESCRIPTION',
      };
      await service.insertMetadata(contractMetadata);
      await service.insertMetadata(updatedContract, 'update');

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(updatedContract);
    });

    it('should do nothing when inserting metadata for an existing contract if selected', async () => {
      const updatedContract = {
        ...contractMetadata,
        name: 'NEW_NAME',
        isNFT: true,
        symbol: 'NEW',
        description: 'NEW_DESCRIPTION',
      };
      await service.insertMetadata(contractMetadata);
      await service.insertMetadata(updatedContract, 'do nothing');

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(contractMetadata);
    });

    it('should throw by default when inserting metadata for an existing token', async () => {
      await service.insertContractToken(contractToken1);
      const res = await service.insertMetadata(tokenMetadata);

      expect(res.id).toBeDefined();
      await expect(service.insertMetadata(tokenMetadata)).rejects.toThrow();
    });

    it('should be able to update when inserting metadata for an existing token', async () => {
      await service.insertContractToken(contractToken1);
      const updatedTokenMetadata = {
        ...tokenMetadata,
        name: 'NEW_NAME',
        isNFT: true,
        symbol: 'NEW',
        description: 'NEW_DESCRIPTION',
      };
      await service.insertMetadata(tokenMetadata);
      const updateRes = await service.insertMetadata(updatedTokenMetadata, 'update');

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA}`, 'DATA');

      expect(updateRes.id).toBeDefined();

      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(updatedTokenMetadata);
    });

    it('should do nothing when inserting metadata for an existing token if selected', async () => {
      await service.insertContractToken(contractToken1);

      const updatedTokenMetadata = {
        ...tokenMetadata,
        name: 'NEW_NAME',
        isNFT: true,
        symbol: 'NEW',
        description: 'NEW_DESCRIPTION',
      };
      await service.insertMetadata(tokenMetadata);
      const insertRes = await service.insertMetadata(updatedTokenMetadata, 'do nothing');

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA}`, 'DATA');

      expect(insertRes.id).toBeDefined();

      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(tokenMetadata);
    });

    it('should be able to insert metadata for a contract token', async () => {
      await service.insertContractToken(contractToken1);
      await service.insertMetadata(tokenMetadata);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(tokenMetadata);
    });

    it('should be able to query metadata for a contract', async () => {
      await service.insertMetadata(contractMetadata);

      const res = await service.getMetadata(ADDRESS1);
      expect(res).toMatchObject(contractMetadata);
    });

    it('should be able to query metadata for a contract token', async () => {
      await service.insertContractToken(contractToken1);
      await service.insertMetadata(tokenMetadata);

      const res = await service.getMetadata(ADDRESS1, contractToken1.tokenId);
      expect(res).toMatchObject(tokenMetadata);
    });
  });

  describe('MetadataImageTable', () => {
    const metadataImage: MetadataImageTable = {
      metadataId: 1,
      url: 'https://example.com/image.png',
      width: 100,
      height: 100,
      type: 'image/png',
      hash: HASH1,
    };

    beforeEach(async () => {
      await service.insertContract(contract1);
      metadataImage.metadataId = (await service.insertMetadata(contractMetadata)).id;
    });

    it('should be able to insert a metadata image', async () => {
      await service.insertMetadataImages(metadataImage.metadataId, [metadataImage]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_IMAGE}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(metadataImage);
    });

    it('should be able to insert multiple metadata images', async () => {
      await service.insertMetadataImages(metadataImage.metadataId, [
        metadataImage,
        { ...metadataImage, url: 'url1' },
      ]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_IMAGE}`, 'DATA');
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([metadataImage, { ...metadataImage, url: 'url1' }]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertMetadataImages(metadataImage.metadataId, [metadataImage, metadataImage]),
      ).rejects.toThrow();
    });

    it('should not throw and insert non conflict rows on conflict do nothing', async () => {
      await service.insertMetadataImages(
        metadataImage.metadataId,
        [metadataImage, metadataImage],
        'do nothing',
      );

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_IMAGE}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([metadataImage]);
    });
  });

  describe('MetadataLinkTable', () => {
    const metadataLink: MetadataLinkTable = {
      metadataId: 1,
      title: 'Test Link',
      url: 'https://example.com',
    };

    beforeEach(async () => {
      await service.insertContract(contract1);
      metadataLink.metadataId = (await service.insertMetadata(contractMetadata)).id;
    });

    it('should be able to insert a metadata link', async () => {
      await service.insertMetadataLinks(metadataLink.metadataId, [metadataLink]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_LINK}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(metadataLink);
    });

    it('should be able to insert multiple metadata links', async () => {
      await service.insertMetadataLinks(metadataLink.metadataId, [
        metadataLink,
        { ...metadataLink, url: 'https://example.com/url2' },
      ]);
      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_LINK}`, 'DATA');
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([
        metadataLink,
        { ...metadataLink, url: 'https://example.com/url2' },
      ]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertMetadataLinks(metadataLink.metadataId, [metadataLink, metadataLink]),
      ).rejects.toThrow();
    });

    it('should not throw and insert non conflict rows on conflict do nothing', async () => {
      await service.insertMetadataLinks(
        metadataLink.metadataId,
        [metadataLink, metadataLink],
        'do nothing',
      );
      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_LINK}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([metadataLink]);
    });

    it('should be able to query metadata links by id', async () => {
      await service.insertMetadataLinks(metadataLink.metadataId, [
        metadataLink,
        { ...metadataLink, url: 'https://example.com/url2' },
      ]);

      const res = await service.getMetadataLinks(metadataLink.metadataId);
      expect(res).toEqual([metadataLink, { ...metadataLink, url: 'https://example.com/url2' }]);
    });
  });

  describe('MetadataTagTable', () => {
    const metadataTag: MetadataTagTable = {
      metadataId: 1,
      title: 'Test Tag',
    };

    beforeEach(async () => {
      await service.insertContract(contract1);
      metadataTag.metadataId = (await service.insertMetadata(contractMetadata)).id;
    });

    it('should be able to insert a metadata tag', async () => {
      await service.insertMetadataTags(metadataTag.metadataId, ['Test Tag']);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_TAG}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(metadataTag);
    });

    it('should be able to insert multiple metadata tags', async () => {
      await service.insertMetadataTags(metadataTag.metadataId, ['Test Tag', 'Test Tag2']);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_TAG}`, 'DATA');
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([metadataTag, { ...metadataTag, title: 'Test Tag2' }]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertMetadataTags(metadataTag.metadataId, ['TAG', 'TAG']),
      ).rejects.toThrow();
    });

    it('should not throw and insert non conflict rows on conflict do nothing', async () => {
      await service.insertMetadataTags(metadataTag.metadataId, ['TAG', 'TAG'], 'do nothing');

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_TAG}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([{ ...metadataTag, title: 'TAG' }]);
    });

    it('should be able to query metadata tags by id', async () => {
      await service.insertMetadataTags(metadataTag.metadataId, ['TAG', 'TAG1', 'TAG2']);

      const res = await service.getMetadataTagsByMetadataId(metadataTag.metadataId);
      expect(res).toEqual(['TAG', 'TAG1', 'TAG2']);
    });
  });

  describe('MetadataAssetTable', () => {
    const metadataAsset: MetadataAssetTable = {
      metadataId: 1,
      url: 'https://example.com/asset',
      fileType: 'image/png',
      hash: HASH1,
    };

    beforeEach(async () => {
      await service.insertContract(contract1);
      metadataAsset.metadataId = (await service.insertMetadata(contractMetadata)).id;
    });

    it('should be able to insert a metadata asset', async () => {
      await service.insertMetadataAssets(metadataAsset.metadataId, [metadataAsset]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_ASSET}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(metadataAsset);
    });

    it('should be able to insert multiple metadata assets', async () => {
      await service.insertMetadataAssets(metadataAsset.metadataId, [
        metadataAsset,
        { ...metadataAsset, url: 'https://example.com/asset2.txt' },
      ]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_ASSET}`, 'DATA');
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([
        metadataAsset,
        { ...metadataAsset, url: 'https://example.com/asset2.txt' },
      ]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertMetadataAssets(metadataAsset.metadataId, [metadataAsset, metadataAsset]),
      ).rejects.toThrow();
    });

    it('should not throw and insert non conflict rows on conflict do nothing', async () => {
      await service.insertMetadataAssets(
        metadataAsset.metadataId,
        [metadataAsset, metadataAsset],
        'do nothing',
      );
      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.METADATA_ASSET}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([metadataAsset]);
    });

    it('should query metadata assets', async () => {
      await service.insertMetadataAssets(metadataAsset.metadataId, [
        metadataAsset,
        { ...metadataAsset, url: 'url1' },
        { ...metadataAsset, url: 'url2' },
      ]);

      const res = await service.getMetadataAssetsByMetadataId(metadataAsset.metadataId);
      expect(res.length).toEqual(3);
      expect(res).toEqual([
        metadataAsset,
        { ...metadataAsset, url: 'url1' },
        { ...metadataAsset, url: 'url2' },
      ]);
    });

    it('should query metadata assets with fileType filter', async () => {
      await service.insertMetadataAssets(metadataAsset.metadataId, [
        metadataAsset,
        { ...metadataAsset, url: 'url1', fileType: 'type1' },
        { ...metadataAsset, url: 'url2', fileType: 'type2' },
      ]);

      const res = await service.getMetadataAssetsByMetadataId(metadataAsset.metadataId, 'type1');
      expect(res.length).toEqual(1);
      expect(res).toEqual([{ ...metadataAsset, url: 'url1', fileType: 'type1' }]);
    });
  });

  describe('DataChangedTable', () => {
    const dataChanged: DataChangedTable = {
      address: ADDRESS1,
      key: HASH1,
      value: 'testValue',
      decodedValue: null,
      blockNumber: 42,
    };

    it('should insert a data changed record', async () => {
      await service.insertDataChanged(dataChanged);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.ERC725Y_DATA_CHANGED}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(dataChanged);
    });

    it('should fetch a data changed record', async () => {
      await service.insertDataChanged(dataChanged);
      await service.insertDataChanged({ ...dataChanged, value: 'value1', blockNumber: 1234 });
      await service.insertDataChanged({ ...dataChanged, value: 'value2', blockNumber: 12345 });

      const result = await service.getDataChangedHistoryByAddressAndKey(
        dataChanged.address,
        dataChanged.key,
      );
      expect(result).toEqual([
        dataChanged,
        { ...dataChanged, value: 'value1', blockNumber: 1234 },
        { ...dataChanged, value: 'value2', blockNumber: 12345 },
      ]);
    });

    it('should fetch empty array if no record', async () => {
      const result = await service.getDataChangedHistoryByAddressAndKey(
        dataChanged.address,
        dataChanged.key,
      );
      expect(result).toEqual([]);
    });
  });

  describe('TransactionTable', () => {
    it('should insert and retrieve a transaction', async () => {
      await service.insertTransaction(transaction);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.TRANSACTION}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(transaction);
    });

    it('should fetch a transaction by hash', async () => {
      await service.insertTransaction(transaction);

      const result = await service.getTransactionByHash(transaction.hash);
      expect(result).toEqual(transaction);
    });
  });

  describe('TxInputTable', () => {
    const transactionInput: TxInputTable = {
      transactionHash: HASH1,
      input: '0x456',
    };

    beforeEach(async () => {
      await service.insertTransaction(transaction);
    });

    it('should insert a transaction input', async () => {
      await service.insertTransactionInput(transactionInput);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.TRANSACTION}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(transaction);
    });

    it('should fetch a transaction input', async () => {
      await service.insertTransactionInput(transactionInput);

      const res = await service.getTransactionInput(HASH1);
      expect(res).toEqual(transactionInput.input);
    });

    it('should fetch null if no transaction input', async () => {
      const res = await service.getTransactionInput(HASH1);
      expect(res).toEqual(null);
    });
  });

  describe('TxParameterTable', () => {
    const txParameter: TxParameterTable = {
      transactionHash: HASH1,
      value: 'testValue',
      name: 'testName',
      type: 'testType',
      position: 0,
    };

    beforeEach(async () => {
      await service.insertTransaction(transaction);
    });

    it('should be able to insert a transaction parameter', async () => {
      await service.insertTransactionParameters(txParameter.transactionHash, [txParameter]);

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.TRANSACTION_PARAMETER}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(txParameter);
    });

    it('should be able to insert multiple transaction parameters', async () => {
      await service.insertTransactionParameters(txParameter.transactionHash, [
        txParameter,
        { ...txParameter, value: 'value1', name: 'name1', position: 1 },
      ]);

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.TRANSACTION_PARAMETER}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([
        txParameter,
        { ...txParameter, value: 'value1', name: 'name1', position: 1 },
      ]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertTransactionParameters(txParameter.transactionHash, [
          txParameter,
          txParameter,
        ]),
      ).rejects.toThrow();
    });

    it('should not throw and insert non-conflict rows on conflict do nothing', async () => {
      await service.insertTransactionParameters(
        txParameter.transactionHash,
        [txParameter, txParameter],
        'do nothing',
      );

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.TRANSACTION_PARAMETER}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([txParameter]);
    });

    it('should fetch the transaction parameters', async () => {
      await service.insertTransactionParameters(txParameter.transactionHash, [
        txParameter,
        { ...txParameter, value: 'value1', position: 1 },
        { ...txParameter, value: 'value2', position: 2 },
      ]);

      const res = await service.getTransactionParameters(transaction.hash);
      expect(res).toEqual([
        txParameter,
        { ...txParameter, value: 'value1', position: 1 },
        { ...txParameter, value: 'value2', position: 2 },
      ]);
    });

    it('should fetch empty array if no transaction parameters', async () => {
      const res = await service.getTransactionParameters(transaction.hash);
      expect(res).toEqual([]);
    });
  });

  describe('EventTable', () => {
    it('should insert an event', async () => {
      await service.insertEvent(event);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.EVENT}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(event);
    });

    it('should fetch an event', async () => {
      await service.insertEvent(event);

      const res = await service.getEventById(event.id);
      expect(res).toEqual(event);
    });

    it('should fetch null if no event', async () => {
      const res = await service.getEventById(event.id);
      expect(res).toEqual(null);
    });
  });

  describe('EventParameterTable', () => {
    const eventParameter: EventParameterTable = {
      eventId: event.id,
      value: 'testValue',
      name: 'testName',
      type: 'testType',
      position: 0,
    };

    beforeEach(async () => {
      await service.insertEvent(event);
    });

    it('should be able to insert an event parameter', async () => {
      await service.insertEventParameters(eventParameter.eventId, [eventParameter]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.EVENT_PARAMETER}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(eventParameter);
    });

    it('should be able to insert multiple event parameters', async () => {
      await service.insertEventParameters(eventParameter.eventId, [
        eventParameter,
        { ...eventParameter, value: 'value1', name: 'name1', position: 1 },
      ]);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.EVENT_PARAMETER}`, 'DATA');
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([
        eventParameter,
        { ...eventParameter, value: 'value1', name: 'name1', position: 1 },
      ]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertEventParameters(eventParameter.eventId, [eventParameter, eventParameter]),
      ).rejects.toThrow();
    });

    it('should not throw and insert non-conflict rows on conflict do nothing', async () => {
      await service.insertEventParameters(
        eventParameter.eventId,
        [eventParameter, eventParameter],
        'do nothing',
      );

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.EVENT_PARAMETER}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([eventParameter]);
    });

    it('should fetch event parameters', async () => {
      await service.insertEventParameters(eventParameter.eventId, [
        eventParameter,
        { ...eventParameter, position: 1 },
        { ...eventParameter, position: 2 },
      ]);

      const res = await service.getEventParameters(event.id);
      expect(res).toEqual([
        eventParameter,
        { ...eventParameter, position: 1 },
        { ...eventParameter, position: 2 },
      ]);
    });

    it('should fetch empty array if no event parameters', async () => {
      const res = await service.getEventParameters(event.id);
      expect(res).toEqual([]);
    });
  });

  describe('WrappedTransactionTable', () => {
    beforeEach(async () => {
      await service.insertTransaction(transaction);
    });

    it('should be able to insert a wrapped transaction', async () => {
      await service.insertWrappedTx(wrappedTransaction);

      const res = await executeQuery(`SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION}`, 'DATA');
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(wrappedTransaction);
    });

    it('should return id when insert a wrapped transaction', async () => {
      const res = await service.insertWrappedTx(wrappedTransaction);

      expect(res.id).toBeDefined();
    });

    it('should be able to query a wrapped transaction by id', async () => {
      const id = (await service.insertWrappedTx(wrappedTransaction)).id;

      const res = await service.getWrappedTxById(id);
      expect(res).toMatchObject(wrappedTransaction);
    });

    it('should return null if querying an unknown id', async () => {
      const res = await service.getWrappedTxById(1);
      expect(res).toBeNull();
    });
  });

  describe('WrappedTransactionInputTable', () => {
    const wrappedTxInput: WrappedTxInputTable = {
      wrappedTransactionId: 1,
      input: '0x456',
    };

    beforeEach(async () => {
      await service.insertTransaction(transaction);
      wrappedTxInput.wrappedTransactionId = (await service.insertWrappedTx(wrappedTransaction)).id;
    });

    it('should be able to insert a wrapped transaction input', async () => {
      await service.insertWrappedTxInput(wrappedTxInput);

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION_INPUT}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toMatchObject(wrappedTxInput);
    });

    it('should be able to query a wrapped transaction input by wrapped transaction id', async () => {
      await service.insertWrappedTxInput(wrappedTxInput);

      const res = await service.getWrappedTxInputById(wrappedTxInput.wrappedTransactionId);
      expect(res).toEqual(wrappedTxInput.input);
    });

    it('should return null if querying an unknown wrapped transaction id', async () => {
      const res = await service.getWrappedTxInputById(wrappedTxInput.wrappedTransactionId);
      expect(res).toBeNull();
    });
  });

  describe('WrappedTransactionParameterTable', () => {
    const wrappedTxParameter: WrappedTxParameterTable = {
      wrappedTransactionId: 1,
      value: '0x123',
      name: 'param1',
      type: 'uint256',
      position: 1,
    };

    beforeEach(async () => {
      await service.insertTransaction(transaction);
      wrappedTxParameter.wrappedTransactionId = (
        await service.insertWrappedTx(wrappedTransaction)
      ).id;
    });

    it('should be able to insert a wrapped transaction parameter', async () => {
      await service.insertWrappedTxParameters(wrappedTxParameter.wrappedTransactionId, [
        wrappedTxParameter,
      ]);

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION_PARAMETER}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(1);
      expect(res.rows[0]).toEqual(wrappedTxParameter);
    });

    it('should be able to insert multiple wrapped transaction parameters', async () => {
      await service.insertWrappedTxParameters(wrappedTxParameter.wrappedTransactionId, [
        wrappedTxParameter,
        { ...wrappedTxParameter, value: 'value1', name: 'name1', position: 2 },
      ]);

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION_PARAMETER}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(2);
      expect(res.rows).toEqual([
        wrappedTxParameter,
        { ...wrappedTxParameter, value: 'value1', name: 'name1', position: 2 },
      ]);
    });

    it('should throw by default if conflict on insert', async () => {
      await expect(
        service.insertWrappedTxParameters(wrappedTxParameter.wrappedTransactionId, [
          wrappedTxParameter,
          wrappedTxParameter,
        ]),
      ).rejects.toThrow();
    });

    it('should not throw and insert non-conflict rows on conflict do nothing', async () => {
      await service.insertWrappedTxParameters(
        wrappedTxParameter.wrappedTransactionId,
        [wrappedTxParameter, wrappedTxParameter],
        'do nothing',
      );

      const res = await executeQuery(
        `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION_PARAMETER}`,
        'DATA',
      );
      expect(res.rows.length).toEqual(1);
      expect(res.rows).toEqual([wrappedTxParameter]);
    });

    it('should be able to query wrapped transaction parameters by wrapped transaction id', async () => {
      await service.insertWrappedTxParameters(wrappedTxParameter.wrappedTransactionId, [
        wrappedTxParameter,
        {
          ...wrappedTxParameter,
          value: 'value1',
          position: 2,
        },
        {
          ...wrappedTxParameter,
          value: 'value2',
          position: 3,
        },
      ]);

      const res = await service.getWrappedTxParameters(wrappedTxParameter.wrappedTransactionId);
      expect(res.length).toEqual(3);
      expect(res).toMatchObject([
        wrappedTxParameter,
        {
          ...wrappedTxParameter,
          value: 'value1',
          position: 2,
        },
        {
          ...wrappedTxParameter,
          value: 'value2',
          position: 3,
        },
      ]);
    });

    it('should return an empty array if querying with an unknown wrapped transaction id', async () => {
      const res = await service.getWrappedTxParameters(1);
      expect(res.length).toEqual(0);
    });
  });

  describe('getContractWithMetadata', () => {
    it('should return contract with metadata', async () => {
      await service.insertContract(contract);
      await service.insertMetadata(contractMetadata);

      const result = await service.getContractWithMetadataByAddress(ADDRESS1);
      expect(result).toMatchObject({ ...contract, ...contractMetadata });
    });

    it('should be null if no metadata', async () => {
      await service.insertContract(contract);

      const result = await service.getContractWithMetadataByAddress(ADDRESS1);
      expect(result).toBeNull();
    });
  });

  describe('getContractWithMetadata', () => {
    const metadataImage: MetadataImageTable = {
      hash: HASH1,
      height: 0,
      metadataId: 0,
      type: null,
      url: URL1,
      width: 0,
    };

    beforeEach(async () => {
      await service.insertContract(contract);
      metadataImage.metadataId = (await service.insertMetadata(contractMetadata)).id;
    });

    it('should fetch all metadata images', async () => {
      await service.insertMetadataImages(metadataImage.metadataId, [
        metadataImage,
        { ...metadataImage, type: 'profile', url: URL2 },
      ]);

      const result = await service.getMetadataImages(metadataImage.metadataId);
      expect(result).toMatchObject([
        metadataImage,
        { ...metadataImage, type: 'profile', url: URL2 },
      ]);
    });

    it('should be able to fetch only metadata images with type null', async () => {
      await service.insertMetadataImages(metadataImage.metadataId, [
        metadataImage,
        { ...metadataImage, type: 'profile', url: URL2 },
      ]);

      const result = await service.getMetadataImages(metadataImage.metadataId, null);
      expect(result).toMatchObject([metadataImage]);
    });

    it('should be able to fetch only metadata images of a specific type', async () => {
      await service.insertMetadataImages(metadataImage.metadataId, [
        metadataImage,
        { ...metadataImage, type: 'profile', url: URL2 },
      ]);

      const result = await service.getMetadataImages(metadataImage.metadataId, 'profile');
      expect(result).toMatchObject([{ ...metadataImage, type: 'profile', url: URL2 }]);
    });

    it('should return empty array if nothing found', async () => {
      const result = await service.getMetadataImages(metadataImage.metadataId, 'profile');
      expect(result).toEqual([]);
    });
  });

  describe('getWrappedTxFromTransactionHash', () => {
    const transaction: TransactionTable = {
      hash: HASH1,
      nonce: 0,
      blockHash: HASH2,
      blockNumber: 0,
      date: new Date(),
      transactionIndex: 0,
      methodId: 'METHOD_ID1',
      methodName: 'METHOD_NAME1',
      from: ADDRESS1,
      to: ADDRESS2,
      value: '100',
      gasPrice: '2000000',
      gas: 21000,
    };

    const wrappedTx: WrappedTxTable = {
      id: 0,
      transactionHash: HASH1,
      parentId: null,
      blockNumber: 0,
      from: ADDRESS1,
      to: ADDRESS2,
      value: '100',
      methodId: 'METHOD_ID1',
      methodName: 'METHOD_NAME1',
    };

    beforeEach(async () => {
      await service.insertTransaction(transaction);
    });

    it('should fetch all wrapped transactions for the given transaction hash', async () => {
      await service.insertWrappedTx(wrappedTx);
      await service.insertWrappedTx({
        ...wrappedTx,
        methodId: 'METHOD_ID2',
        methodName: 'METHOD_NAME2',
      });

      const result = await service.getWrappedTxFromTransactionHash(HASH1);
      expect(result).toMatchObject([
        { ...wrappedTx, id: expect.any(Number) },
        {
          ...wrappedTx,
          methodId: 'METHOD_ID2',
          methodName: 'METHOD_NAME2',
          id: expect.any(Number),
        },
      ]);
    });

    it('should fetch only wrapped transactions with a specific method ID', async () => {
      await service.insertWrappedTx(wrappedTx);
      await service.insertWrappedTx({
        ...wrappedTx,
        methodId: '0x12345678',
        methodName: 'METHOD_NAME2',
      });

      const result = await service.getWrappedTxFromTransactionHash(HASH1, 'METHOD_ID1');
      expect(result).toMatchObject([{ ...wrappedTx, id: expect.any(Number) }]);
    });

    it('should return an empty array if no matching wrapped transactions found', async () => {
      const result = await service.getWrappedTxFromTransactionHash(HASH3);
      expect(result).toEqual([]);
    });
  });
});
