import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import winston from 'winston';
import format from 'pg-format';
import knex, { Knex } from 'knex';

import { DB_DATA_TABLE, LUKSO_DATA_CONNECTION_STRING } from './config';
import { ContractTable } from './entities/contract.table';
import { ContractTokenTable } from './entities/contract-token.table';
import { MetadataTable } from './entities/metadata.table';
import { MetadataImageTable } from './entities/metadata-image.table';
import { MetadataTagTable } from './entities/metadata-tag.table';
import { MetadataLinkTable } from './entities/metadata-link.table';
import { MetadataAssetTable } from './entities/metadata-asset.table';
import { DataChangedTable } from './entities/data-changed.table';
import { TransactionTable } from './entities/tx.table';
import { TxParameterTable } from './entities/tx-parameter.table';
import { TxInputTable } from './entities/tx-input.table';
import { EventTable } from './entities/event.table';
import { EventParameterTable } from './entities/event-parameter.table';
import { WrappedTxTable } from './entities/wrapped-tx.table';
import { WrappedTxParameterTable } from './entities/wrapped-tx-parameter.table';
import { WrappedTxInputTable } from './entities/wrapped-tx-input.table';
import { CONTRACT_TYPE } from '../../../models/enums';
import { knexToSQL } from '../utils/knexToSQL';
import { TokenHolderTable } from './entities/token-holder.table';
import { isPartialEthereumAddress } from '../../../utils/is-ethereum-address';
import { LoggerService } from '../../logger/logger.service';
import { TokenHolderEntity } from '../../../resolvers/token-holder/entities/token-holder.entity';

const queryBuilder = knex({ client: 'pg' });

type TokenWithMetadata = ContractTokenTable &
  ContractTable &
  MetadataTable & {
    contractName: string | null;
    contractDescription: string | null;
    contractSymbol: string | null;
  };

@Injectable()
export class LuksoDataDbService implements OnModuleDestroy {
  protected readonly client: Pool & {
    query: (query: string, values?: any[]) => Promise<QueryResult<any>>;
  };
  protected readonly logger: winston.Logger;

  constructor(protected readonly loggerService: LoggerService) {
    this.logger = this.loggerService.getChildLogger('LuksoDataDbService');
    this.client = new Pool({
      connectionString: LUKSO_DATA_CONNECTION_STRING,
    });
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  public async disconnect() {
    await this.client.end();
  }

  // Contract table functions
  public async insertContract(
    contract: ContractTable,
    onConflict: 'throw' | 'update' | 'do nothing' = 'throw',
  ): Promise<void> {
    let query = `
    INSERT INTO ${DB_DATA_TABLE.CONTRACT}
    ("address", "interfaceCode", "interfaceVersion", "type")
    VALUES ($1, $2, $3, $4)
  `;

    if (onConflict === 'do nothing') query += ' ON CONFLICT DO NOTHING';
    else if (onConflict === 'update')
      query += ` ON CONFLICT ("address") DO UPDATE SET
        "interfaceCode" = EXCLUDED."interfaceCode",
        "interfaceVersion" = EXCLUDED."interfaceVersion",
        "type" = EXCLUDED."type"
    `;

    await this.executeQuery(query, [
      contract.address,
      contract.interfaceCode,
      contract.interfaceVersion,
      contract.type,
    ]);
  }

  public async getContractByAddress(address: string): Promise<ContractTable | null> {
    const rows = await this.executeQuery<ContractTable>(
      `SELECT * FROM ${DB_DATA_TABLE.CONTRACT} WHERE "address" = $1`,
      [address],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  public async getContractsToIndex(): Promise<string[]> {
    const rows = await this.executeQuery<ContractTable>(
      `SELECT * FROM ${DB_DATA_TABLE.CONTRACT} WHERE "interfaceCode" IS NULL`,
    );
    return rows.map((row) => row.address);
  }

  public async getTokensToIndex(): Promise<ContractTokenTable[]> {
    return await this.executeQuery<ContractTokenTable>(
      `SELECT * FROM ${DB_DATA_TABLE.CONTRACT_TOKEN} WHERE "decodedTokenId" IS NULL`,
    );
  }

  // ContractToken table functions
  public async insertContractToken(
    contractToken: Omit<ContractTokenTable, 'index'>,
    onConflict: 'throw' | 'update' | 'do nothing' = 'throw',
  ): Promise<void> {
    let query = `
          INSERT INTO ${DB_DATA_TABLE.CONTRACT_TOKEN} (id, address, "decodedTokenId", "tokenId", "interfaceCode", "latestKnownOwner")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
    if (onConflict === 'do nothing') query += ' ON CONFLICT DO NOTHING';
    else if (onConflict === 'update') {
      query += ` ON CONFLICT ("id") DO UPDATE SET
        "interfaceCode" = EXCLUDED."interfaceCode"`;
      if (contractToken.decodedTokenId) query += `,"decodedTokenId" = EXCLUDED."decodedTokenId"`;
      if (contractToken.latestKnownOwner)
        query += `,"latestKnownOwner" = EXCLUDED."latestKnownOwner"`;
    }

    await this.executeQuery(query, [
      contractToken.id,
      contractToken.address,
      contractToken.decodedTokenId,
      contractToken.tokenId,
      contractToken.interfaceCode,
      contractToken.latestKnownOwner,
    ]);
  }

  public async insertTokenHolder(
    tokenHolder: TokenHolderTable, // 'balanceInEth' is not supplied, hence we omit it
    onConflict: 'throw' | 'update' | 'do nothing' = 'throw',
  ): Promise<void> {
    let query = `
          INSERT INTO ${DB_DATA_TABLE.TOKEN_HOLDER} ("holderAddress", "contractAddress", "tokenId", "balanceInWei", "balanceInEth", "holderSinceBlock")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

    try {
      await this.executeQuery(query, [
        tokenHolder.holderAddress,
        tokenHolder.contractAddress,
        tokenHolder.tokenId,
        tokenHolder.balanceInWei,
        tokenHolder.balanceInEth,
        tokenHolder.holderSinceBlock,
      ]);
    } catch (error) {
      if (onConflict === 'do nothing' && JSON.stringify(error.message).includes('duplicate')) {
        // Do nothing
      } else if (onConflict === 'update' && JSON.stringify(error.message).includes('duplicate')) {
        query = `
          UPDATE ${DB_DATA_TABLE.TOKEN_HOLDER} 
          SET "balanceInWei" = $4, "balanceInEth" = $5
          WHERE "holderAddress" = $1 AND "contractAddress" = $2 
          AND (("tokenId" = $3 AND $3 IS NOT NULL) OR ("tokenId" IS NULL AND $3 IS NULL));
        `;

        await this.executeQuery(query, [
          tokenHolder.holderAddress,
          tokenHolder.contractAddress,
          tokenHolder.tokenId,
          tokenHolder.balanceInWei,
          tokenHolder.balanceInEth,
        ]);
      } else {
        // If some other error occurred, rethrow it
        throw error;
      }
    }
  }

  public async getContractTokenById(id: string): Promise<ContractTokenTable | null> {
    const rows = await this.executeQuery<ContractTokenTable>(
      `SELECT * FROM ${DB_DATA_TABLE.CONTRACT_TOKEN} WHERE "id" = $1`,
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Metadata table functions
  public async insertMetadata(
    metadata: Omit<MetadataTable, 'id'>,
    onConflict: 'throw' | 'update' | 'do nothing' = 'throw',
  ): Promise<{ id: number }> {
    let query = `
        INSERT INTO ${DB_DATA_TABLE.METADATA}
        ("address", "tokenId", "name", "symbol", "description", "isNFT")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;

    let rows;
    try {
      rows = await this.executeQuery(query, [
        metadata.address,
        metadata.tokenId,
        metadata.name,
        metadata.symbol,
        metadata.description,
        metadata.isNFT,
      ]);
    } catch (error) {
      if (onConflict === 'do nothing' && JSON.stringify(error.message).includes('duplicate')) {
        const id = (await this.getMetadata(metadata.address, metadata.tokenId || undefined))?.id;
        if (!id) throw new Error('Could not get id of metadata');
        else return { id };
      } else if (onConflict === 'update' && JSON.stringify(error.message).includes('duplicate')) {
        query = `
        UPDATE ${DB_DATA_TABLE.METADATA}
        SET "name" = $3, "symbol" = $4, "description" = $5, "isNFT" = $6
        WHERE "address" = $1 AND 
        (("tokenId" = $2 AND $2 IS NOT NULL) OR ("tokenId" IS NULL AND $2 IS NULL))
          RETURNING id;
      `;

        rows = await this.executeQuery(query, [
          metadata.address,
          metadata.tokenId,
          metadata.name,
          metadata.symbol,
          metadata.description,
          metadata.isNFT,
        ]);
      } else {
        // If some other error occurred, rethrow it
        throw error;
      }
    }
    return { id: rows[0].id };
  }

  public async getMetadata(address: string, tokenId?: string): Promise<MetadataTable | null> {
    const query = `SELECT * FROM ${DB_DATA_TABLE.METADATA} WHERE "address" = $1 AND "tokenId"${
      tokenId ? '=$2' : ' IS NULL'
    }`;
    const queryParams = tokenId ? [address, tokenId] : [address];

    const rows = await this.executeQuery<MetadataTable>(query, queryParams);
    return rows.length > 0 ? rows[0] : null;
  }

  public async getTokenHolder(
    holderAddress: string,
    contractAddress: string,
    tokenId?: string | null,
  ): Promise<TokenHolderTable | null> {
    const query = `SELECT * FROM ${
      DB_DATA_TABLE.TOKEN_HOLDER
    } WHERE "holderAddress" = $1 AND "contractAddress" = $2 AND "tokenId"${
      tokenId ? '=$3' : ' IS NULL'
    }`;
    const queryParams = tokenId
      ? [holderAddress, contractAddress, tokenId]
      : [holderAddress, contractAddress];

    const rows = await this.executeQuery<TokenHolderTable>(query, queryParams);
    return rows.length > 0 ? rows[0] : null;
  }

  // MetadataImage table functions
  public async insertMetadataImages(
    metadataId: number,
    metadataImages: Omit<MetadataImageTable, 'metadataId'>[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (metadataImages.length === 0) return;

    const values = metadataImages.map((metadataImage) => [
      metadataId,
      metadataImage.url,
      metadataImage.width,
      metadataImage.height,
      metadataImage.type,
      metadataImage.hash,
    ]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
    INSERT INTO %I
    ("metadataId", "url", "width", "height", "type", "hash")
    VALUES %L
    %s
  `,
      DB_DATA_TABLE.METADATA_IMAGE,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  // MetadataLink table functions
  public async insertMetadataLinks(
    metadataId: number,
    metadataLinks: Omit<MetadataLinkTable, 'metadataId'>[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (metadataLinks.length === 0) return;

    const values = metadataLinks.map((metadataLink) => [
      metadataId,
      metadataLink.title,
      metadataLink.url,
    ]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
      INSERT INTO %I
      ("metadataId", "title", "url")
      VALUES %L
      %s
    `,
      DB_DATA_TABLE.METADATA_LINK,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  // MetadataTag table functions
  public async insertMetadataTags(
    metadataId: number,
    metadataTags: string[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (metadataTags.length === 0) return;

    const values = metadataTags.map((metadataTag) => [metadataId, metadataTag]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
      INSERT INTO %I
      ("metadataId", "title")
      VALUES %L
      %s
    `,
      DB_DATA_TABLE.METADATA_TAG,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  public async getMetadataTagsByMetadataId(metadataId: number): Promise<string[]> {
    const rows = await this.executeQuery<MetadataTagTable>(
      `SELECT * FROM ${DB_DATA_TABLE.METADATA_TAG} WHERE "metadataId" = $1`,
      [metadataId],
    );
    return rows.map((r) => r.title);
  }

  public async getMetadataLinks(metadataId: number): Promise<MetadataLinkTable[]> {
    return await this.executeQuery<MetadataLinkTable>(
      `SELECT * FROM ${DB_DATA_TABLE.METADATA_LINK} WHERE "metadataId" = $1`,
      [metadataId],
    );
  }

  // MetadataAsset table functions
  public async insertMetadataAssets(
    metadataId: number,
    metadataAssets: Omit<MetadataAssetTable, 'metadataId'>[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (metadataAssets.length === 0) return;

    const values = metadataAssets.map((metadataAsset) => [
      metadataId,
      metadataAsset.url,
      metadataAsset.fileType,
      metadataAsset.hash,
    ]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
      INSERT INTO %I
      ("metadataId", "url", "fileType", "hash")
      VALUES %L
      %s
    `,
      DB_DATA_TABLE.METADATA_ASSET,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  public async getMetadataAssetsByMetadataId(
    metadataId: number,
    fileType?: string,
  ): Promise<MetadataAssetTable[]> {
    let query = `SELECT * FROM ${DB_DATA_TABLE.METADATA_ASSET} WHERE "metadataId" = $1`;
    const params: any[] = [metadataId];
    if (fileType) {
      params.push(fileType);
      query += ` AND "fileType" = $2`;
    }
    return await this.executeQuery<MetadataAssetTable>(query, params);
  }

  // DataChanged table functions
  public async insertDataChanged(dataChanged: DataChangedTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_DATA_TABLE.ERC725Y_DATA_CHANGED}
      ("address", "key", "value", "decodedValue", "blockNumber")
      VALUES ($1, $2, $3, $4, $5)
    `,
      [
        dataChanged.address,
        dataChanged.key,
        dataChanged.value,
        dataChanged.decodedValue,
        dataChanged.blockNumber,
      ],
    );
  }

  public async getDataChangedHistoryByAddressAndKey(
    address: string,
    key: string,
  ): Promise<DataChangedTable[]> {
    return await this.executeQuery<DataChangedTable>(
      `SELECT * FROM ${DB_DATA_TABLE.ERC725Y_DATA_CHANGED} WHERE "address" = $1 AND "key" = $2`,
      [address, key],
    );
  }

  // Transaction table functions
  public async insertTransaction(transaction: TransactionTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_DATA_TABLE.TRANSACTION}
      ("hash", "nonce", "blockHash", "blockNumber", "date", "transactionIndex", "methodId", "methodName", "from", "to", "value", "gasPrice", "gas") VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
      [
        transaction.hash,
        transaction.nonce,
        transaction.blockHash,
        transaction.blockNumber,
        transaction.date,
        transaction.transactionIndex,
        transaction.methodId,
        transaction.methodName,
        transaction.from,
        transaction.to,
        transaction.value,
        transaction.gasPrice,
        transaction.gas,
      ],
    );
  }

  public async getTransactionByHash(hash: string): Promise<TransactionTable | null> {
    const rows = await this.executeQuery<TransactionTable>(
      `SELECT * FROM ${DB_DATA_TABLE.TRANSACTION} WHERE "hash" = $1`,
      [hash],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // TransactionInput table functions
  public async insertTransactionInput(transactionInput: TxInputTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_DATA_TABLE.TRANSACTION_INPUT}
      ("transactionHash", "input")
      VALUES ($1, $2)
    `,
      [transactionInput.transactionHash, transactionInput.input],
    );
  }

  public async getTransactionInput(transactionHash: string): Promise<string | null> {
    const rows = await this.executeQuery<TxInputTable>(
      `SELECT input FROM ${DB_DATA_TABLE.TRANSACTION_INPUT} WHERE "transactionHash" = $1`,
      [transactionHash],
    );
    return rows.length > 0 ? rows[0].input : null;
  }

  // TransactionParameter table functions
  public async insertTransactionParameters(
    transactionHash: string,
    transactionParameters: Omit<TxParameterTable, 'transactionHash'>[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (transactionParameters.length === 0) return;

    const values = transactionParameters.map((transactionParameter) => [
      transactionHash,
      `${transactionParameter.value}`,
      transactionParameter.name,
      transactionParameter.type,
      transactionParameter.position,
    ]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
    INSERT INTO %I
    ("transactionHash", "value", "name", "type", "position")
    VALUES %L
    %s
  `,
      DB_DATA_TABLE.TRANSACTION_PARAMETER,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  public async getTransactionParameters(transactionHash: string): Promise<TxParameterTable[]> {
    return await this.executeQuery<TxParameterTable>(
      `SELECT * FROM ${DB_DATA_TABLE.TRANSACTION_PARAMETER} WHERE "transactionHash" = $1`,
      [transactionHash],
    );
  }

  // Wrapped Transaction table functions
  public async insertWrappedTx(
    wrappedTransaction: Omit<WrappedTxTable, 'id'>,
  ): Promise<{ id: number }> {
    const rows = await this.executeQuery<{ id: number }>(
      `
    INSERT INTO ${DB_DATA_TABLE.WRAPPED_TRANSACTION}
    ("transactionHash", "parentId", "blockNumber", "from", "to", "value", "methodId", "methodName")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `,
      [
        wrappedTransaction.transactionHash,
        wrappedTransaction.parentId,
        wrappedTransaction.blockNumber,
        wrappedTransaction.from,
        wrappedTransaction.to,
        wrappedTransaction.value,
        wrappedTransaction.methodId,
        wrappedTransaction.methodName,
      ],
    );

    return { id: rows[0].id };
  }

  public async getWrappedTxById(id: number): Promise<WrappedTxTable | null> {
    const rows = await this.executeQuery<WrappedTxTable>(
      `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION} WHERE "id" = $1`,
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Wrapped Transaction Input table functions
  public async insertWrappedTxInput(wrappedTransactionInput: WrappedTxInputTable): Promise<void> {
    await this.executeQuery(
      `
    INSERT INTO ${DB_DATA_TABLE.WRAPPED_TRANSACTION_INPUT}
    ("wrappedTransactionId", "input")
    VALUES ($1, $2)
  `,
      [wrappedTransactionInput.wrappedTransactionId, wrappedTransactionInput.input],
    );
  }

  public async getWrappedTxInputById(wrappedTransactionId: number): Promise<string | null> {
    const rows = await this.executeQuery<WrappedTxInputTable>(
      `SELECT input FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION_INPUT} WHERE "wrappedTransactionId" = $1`,
      [wrappedTransactionId],
    );
    return rows.length > 0 ? rows[0].input : null;
  }

  // Wrapped Transaction Parameter table functions
  public async insertWrappedTxParameters(
    wrappedTransactionId: number,
    wrappedTransactionParameters: Omit<WrappedTxParameterTable, 'wrappedTransactionId'>[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (wrappedTransactionParameters.length === 0) return;

    const values = wrappedTransactionParameters.map((wrappedTransactionParameter) => [
      wrappedTransactionId,
      `${wrappedTransactionParameter.value}`,
      wrappedTransactionParameter.name,
      wrappedTransactionParameter.type,
      wrappedTransactionParameter.position,
    ]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
    INSERT INTO %I
    ("wrappedTransactionId", "value", "name", "type", "position")
    VALUES %L
    %s
  `,
      DB_DATA_TABLE.WRAPPED_TRANSACTION_PARAMETER,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  public async getWrappedTxParameters(
    wrappedTransactionId: number,
  ): Promise<WrappedTxParameterTable[]> {
    return await this.executeQuery<WrappedTxParameterTable>(
      `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION_PARAMETER} WHERE "wrappedTransactionId" = $1`,
      [wrappedTransactionId],
    );
  }

  // Event table functions
  public async insertEvent(event: EventTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_DATA_TABLE.EVENT}
      ("id", "blockNumber", "date", "transactionHash", "logIndex", "address", "eventName", "methodId", "topic0", "topic1", "topic2", "topic3", "data")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
      [
        event.id,
        event.blockNumber,
        event.date,
        event.transactionHash,
        event.logIndex,
        event.address,
        event.eventName,
        event.methodId,
        event.topic0,
        event.topic1,
        event.topic2,
        event.topic3,
        event.data,
      ],
    );
  }

  public async getEventById(id: string): Promise<EventTable | null> {
    const rows = await this.executeQuery<EventTable>(
      `SELECT * FROM ${DB_DATA_TABLE.EVENT} WHERE "id" = $1`,
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // EventParameter table functions
  public async insertEventParameters(
    eventId: string,
    eventParameters: Omit<EventParameterTable, 'eventId'>[],
    onConflict: 'throw' | 'do nothing' = 'throw',
  ): Promise<void> {
    if (eventParameters.length === 0) return;

    const values = eventParameters.map((eventParameter) => [
      eventId,
      `${eventParameter.value}`,
      eventParameter.name,
      eventParameter.type,
      eventParameter.position,
    ]);

    const conflictAction = onConflict === 'do nothing' ? 'ON CONFLICT DO NOTHING' : '';

    const query = format(
      `
        INSERT INTO %I
        ("eventId", "value", "name", "type", "position")
        VALUES %L
        %s
      `,
      DB_DATA_TABLE.EVENT_PARAMETER,
      values,
      conflictAction,
    );

    await this.executeQuery(query);
  }

  public async getEventParameters(eventId: string): Promise<EventParameterTable[]> {
    return await this.executeQuery<EventParameterTable>(
      `SELECT * FROM ${DB_DATA_TABLE.EVENT_PARAMETER} WHERE "eventId" = $1`,
      [eventId],
    );
  }

  protected async executeQuery<T>(query: string, values?: any[]): Promise<T[]> {
    try {
      const result = await this.client.query(query, values);
      return result.rows as T[];
    } catch (error) {
      // Log the error and rethrow a custom error with a more specific message
      this.logger.error('Error executing a query', { query, values, error });
      throw new Error(`Error executing query: ${query}\n\nError details: ${error.message}`);
    }
  }

  public async getContractWithMetadataByAddress(
    address: string,
  ): Promise<(ContractTable & MetadataTable) | null> {
    const rows = await this.executeQuery<ContractTable & MetadataTable>(
      `SELECT * FROM ${DB_DATA_TABLE.CONTRACT} 
              INNER JOIN ${DB_DATA_TABLE.METADATA} 
              ON ${DB_DATA_TABLE.CONTRACT}.address = ${DB_DATA_TABLE.METADATA}.address
              WHERE  ${DB_DATA_TABLE.CONTRACT}."address" = $1`,
      [address],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  public async searchContractWithMetadata(
    limit: number,
    offset: number,
    input?: string,
    type?: CONTRACT_TYPE,
    interfaceVersion?: string,
    interfaceCode?: string,
    tag?: string,
    havePermissions?: string,
  ): Promise<(ContractTable & MetadataTable)[]> {
    const query = this.buildAddressSearchQuery(
      input,
      type,
      interfaceVersion,
      interfaceCode,
      tag,
      havePermissions,
    )
      .select('*')
      .orderBy(`${DB_DATA_TABLE.METADATA}.name`, 'asc')
      .orderBy(`${DB_DATA_TABLE.CONTRACT}.address`, 'asc')
      .limit(limit)
      .offset(offset);

    // Get the SQL query string and bindings
    const { sql, bindings } = knexToSQL(query);

    // Execute the query
    return await this.executeQuery<ContractTable & MetadataTable>(sql, bindings as any[]);
  }

  public async searchContractCount(
    input?: string,
    type?: CONTRACT_TYPE,
    interfaceVersion?: string,
    interfaceCode?: string,
    tag?: string,
    havePermissions?: string,
  ): Promise<number> {
    const query = this.buildAddressSearchQuery(
      input,
      type,
      interfaceVersion,
      interfaceCode,
      tag,
      havePermissions,
    ).count('*');

    // Get the SQL query string and bindings
    const { sql, bindings } = knexToSQL(query);

    // Execute the query
    return (await this.executeQuery<{ count: number }>(sql, bindings as any[]))[0].count;
  }

  private buildAddressSearchQuery(
    input?: string,
    type?: CONTRACT_TYPE,
    interfaceVersion?: string,
    interfaceCode?: string,
    tag?: string,
    havePermissions?: string,
  ): Knex.QueryBuilder {
    const query = queryBuilder
      .from(DB_DATA_TABLE.CONTRACT)
      .innerJoin(
        DB_DATA_TABLE.METADATA,
        `${DB_DATA_TABLE.CONTRACT}.address`,
        `${DB_DATA_TABLE.METADATA}.address`,
      );

    if (input && isPartialEthereumAddress(input))
      query.whereRaw(`LOWER(${DB_DATA_TABLE.CONTRACT}.address) LIKE LOWER(?)`, [`%${input}%`]);
    else if (input)
      query.whereRaw(`LOWER(${DB_DATA_TABLE.METADATA}.name) LIKE LOWER(?)`, [`%${input}%`]);
    if (havePermissions) {
      const subQuery = `
      SELECT erc725y_data_changed.address, 
             erc725y_data_changed.key,
             erc725y_data_changed.value,
             ROW_NUMBER() OVER (PARTITION BY erc725y_data_changed.address 
             ORDER BY erc725y_data_changed."blockNumber" DESC) as rn
      FROM erc725y_data_changed
      WHERE LOWER(erc725y_data_changed.key) = LOWER(?)
    `;

      query
        .innerJoin(
          queryBuilder.raw(
            `(${subQuery}) AS latest_data ON ${DB_DATA_TABLE.CONTRACT}.address = latest_data.address`,
            [`0x4b80742de2bf82acb3630000${havePermissions.slice(2)}`],
          ),
        )
        .whereRaw(
          `latest_data.rn = 1 AND latest_data.value != '0x0000000000000000000000000000000000000000000000000000000000000000'`,
        );
    }
    if (tag)
      query
        .innerJoin(
          DB_DATA_TABLE.METADATA_TAG,
          `${DB_DATA_TABLE.METADATA}.id`,
          `${DB_DATA_TABLE.METADATA_TAG}.metadataId`,
        )
        .whereRaw(`LOWER(${DB_DATA_TABLE.METADATA_TAG}.title) LIKE LOWER(?)`, [`%${tag}%`]);
    if (type) query.andWhere({ type });
    if (interfaceVersion) query.andWhere({ interfaceVersion });
    if (interfaceCode) query.andWhere({ interfaceCode });

    return query;
  }

  public async searchTokenWithMetadata(
    limit: number,
    offset: number,
    addressInput?: string,
    contractName?: string,
    contractSymbol?: string,
    input?: string,
    interfaceCode?: string,
    interfaceVersion?: string,
    owner?: string,
  ): Promise<TokenWithMetadata[]> {
    const query = this.buildTokenSearchQuery(
      addressInput,
      contractName,
      contractSymbol,
      input,
      interfaceCode,
      interfaceVersion,
      owner,
    );

    query
      .select(
        'ct.*',
        'c.*',
        'm1.*',
        'm2.name as contractName',
        'm2.description as contractDescription',
        'm2.symbol as contractSymbol',
      )
      .orderBy('ct.address', 'asc')
      .orderBy('m2.name', 'asc')
      .orderBy('ct.tokenId', 'asc')
      .limit(limit)
      .offset(offset);

    // Get the SQL query string and bindings
    const { sql, bindings } = knexToSQL(query);

    // Execute the query
    return await this.executeQuery<TokenWithMetadata>(sql, bindings as any[]);
  }

  public async searchTokenWithMetadataCount(
    addressInput?: string,
    contractName?: string,
    contractSymbol?: string,
    input?: string,
    interfaceCode?: string,
    interfaceVersion?: string,
    owner?: string,
  ): Promise<number> {
    const query = this.buildTokenSearchQuery(
      addressInput,
      contractName,
      contractSymbol,
      input,
      interfaceCode,
      interfaceVersion,
      owner,
    ).count('*');

    // Get the SQL query string and bindings
    const { sql, bindings } = knexToSQL(query);

    // Execute the query
    return (await this.executeQuery<{ count: number }>(sql, bindings as any[]))[0].count;
  }

  private buildTokenSearchQuery(
    addressInput?: string,
    contractName?: string,
    contractSymbol?: string,
    input?: string,
    interfaceCode?: string,
    interfaceVersion?: string,
    owner?: string,
  ): Knex.QueryBuilder {
    const query = queryBuilder
      .from(`${DB_DATA_TABLE.CONTRACT_TOKEN} as ct`)
      .innerJoin(`${DB_DATA_TABLE.METADATA} as m1`, function () {
        this.on('ct.address', 'm1.address').andOn('ct.tokenId', 'm1.tokenId');
      })
      .innerJoin(`${DB_DATA_TABLE.CONTRACT} as c`, 'ct.address', 'c.address')
      .innerJoin(`${DB_DATA_TABLE.METADATA} as m2`, function () {
        this.on('ct.address', '=', 'm2.address').andOnNull('m2.tokenId');
      });

    if (addressInput) query.whereRaw('ct.address LIKE LOWER(?)', [`%${addressInput}%`]);
    if (input)
      query.whereRaw(
        'CONCAT(LOWER(m1.name), ct."tokenId", LOWER(ct."decodedTokenId")) LIKE LOWER(?)',
        [`%${input}%`],
      );
    if (contractName) query.whereRaw('LOWER(m2.name) LIKE LOWER(?)', [`%${contractName}%`]);
    if (contractSymbol) query.whereRaw('LOWER(m2.symbol) LIKE LOWER(?)', [`%${contractSymbol}%`]);
    if (interfaceVersion) query.andWhere({ interfaceVersion });
    if (interfaceCode) query.andWhere({ interfaceCode });
    if (owner) query.andWhere('ct.latestKnownOwner', owner);

    return query;
  }

  public async searchTokenHolder(
    limit: number,
    offset: number,
    holderAddress?: string,
    contractAddress?: string,
    tokenId?: string | null,
    minBalance?: number,
    maxBalance?: number,
    holderAfterBlock?: number,
    holderBeforeBlock?: number,
  ): Promise<TokenHolderEntity[]> {
    const query = this.buildTokenHolderQuery(
      holderAddress,
      contractAddress,
      tokenId,
      minBalance,
      maxBalance,
      holderAfterBlock,
      holderBeforeBlock,
    )
      .select('*')
      .orderBy('th.holderAddress', 'asc')
      .orderBy('th.contractAddress', 'asc')
      .orderBy('th.tokenId', 'asc')
      .limit(limit)
      .offset(offset);

    // Get the SQL query string and bindings
    const { sql, bindings } = knexToSQL(query);

    // Execute the query
    return await this.executeQuery<TokenHolderEntity>(sql, bindings as any[]);
  }

  public async searchTokenHolderCount(
    holderAddress?: string,
    contractAddress?: string,
    tokenId?: string | null,
    minBalance?: number,
    maxBalance?: number,
    holderAfterBlock?: number,
    holderBeforeBlock?: number,
  ): Promise<number> {
    const query = this.buildTokenHolderQuery(
      holderAddress,
      contractAddress,
      tokenId,
      minBalance,
      maxBalance,
      holderAfterBlock,
      holderBeforeBlock,
    ).count('*');

    // Get the SQL query string and bindings
    const { sql, bindings } = knexToSQL(query);

    // Execute the query
    return (await this.executeQuery<{ count: number }>(sql, bindings as any[]))[0].count;
  }

  private buildTokenHolderQuery(
    holderAddress?: string,
    contractAddress?: string,
    tokenId?: string | null,
    minBalance?: number,
    maxBalance?: number,
    holderAfterBlock?: number,
    holderBeforeBlock?: number,
  ): Knex.QueryBuilder {
    const query = queryBuilder.from(`${DB_DATA_TABLE.TOKEN_HOLDER} as th`);

    if (holderAddress) query.where('th.holderAddress', holderAddress);
    if (contractAddress) query.where('th.contractAddress', contractAddress);
    if (tokenId !== undefined)
      query.whereRaw(
        `th."tokenId" ${tokenId === null ? 'IS NULL' : '= ?'}`,
        tokenId === null ? [] : [tokenId],
      );
    if (minBalance) query.where('th.balanceInEth', '>=', minBalance);
    if (maxBalance) query.where('th.balanceInEth', '<=', maxBalance);
    if (holderBeforeBlock) query.where('th.holderSinceBlock', '<', holderBeforeBlock);
    if (holderAfterBlock) query.where('th.holderSinceBlock', '>', holderAfterBlock);

    return query;
  }

  public async getMetadataImages(
    metadataId: number,
    type?: string | null,
  ): Promise<MetadataImageTable[]> {
    let whereClause = '';
    if (type) whereClause = 'AND type = $2';
    else if (type === null) whereClause = 'AND type IS NULL';

    return await this.executeQuery<MetadataImageTable>(
      `
      SELECT * FROM ${DB_DATA_TABLE.METADATA_IMAGE}
      WHERE "metadataId" = $1 ${whereClause}
    `,
      type ? [metadataId, type] : [metadataId],
    );
  }

  public async getWrappedTxFromTransactionHash(
    transactionHash: string,
    methodId?: string,
  ): Promise<WrappedTxTable[]> {
    let whereClause = '';
    if (methodId) whereClause = 'AND "methodId" = $2';

    return await this.executeQuery<WrappedTxTable>(
      `SELECT * FROM ${DB_DATA_TABLE.WRAPPED_TRANSACTION} 
              WHERE ${DB_DATA_TABLE.WRAPPED_TRANSACTION}."transactionHash" = $1 ${whereClause}`,
      methodId ? [transactionHash, methodId] : [transactionHash],
    );
  }
}
