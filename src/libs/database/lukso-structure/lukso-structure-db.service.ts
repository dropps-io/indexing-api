import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import winston from 'winston';

import {
  CACHE_REFRESH_INTERVAL_IN_MS,
  DB_STRUCTURE_TABLE,
  LUKSO_STRUCTURE_CONNECTION_STRING,
} from './config';
import { ConfigTable } from './entities/config.table';
import { ERC725YSchemaTable } from './entities/erc725YSchema.table';
import { ContractInterfaceTable } from './entities/contractInterface.table';
import { MethodInterfaceTable } from './entities/methodInterface.table';
import { MethodParameterTable } from './entities/methodParameter.table';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LuksoStructureDbService implements OnModuleDestroy {
  private readonly client: Pool & {
    query: (query: string, values?: any[]) => Promise<QueryResult<any>>;
  };
  protected readonly logger: winston.Logger;
  private cache: {
    contractInterfaces: {
      values: ContractInterfaceTable[];
      lastRefresh: number;
    };
  } = {
    contractInterfaces: {
      values: [],
      lastRefresh: 0,
    },
  };

  constructor(protected readonly loggerService: LoggerService) {
    this.logger = loggerService.getChildLogger('LuksoStructureDbService');
    this.client = new Pool({
      connectionString: LUKSO_STRUCTURE_CONNECTION_STRING,
    });
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  public async disconnect() {
    await this.client.end();
  }

  public async getConfig(): Promise<ConfigTable> {
    const rows = await this.executeQuery<ConfigTable>(`SELECT * FROM ${DB_STRUCTURE_TABLE.CONFIG}`);
    if (rows.length === 0) throw 'Config table need to be initialized';
    else return rows[0];
  }

  public async updateLatestIndexedBlock(blockNumber: number): Promise<void> {
    await this.executeQuery(
      `
      UPDATE ${DB_STRUCTURE_TABLE.CONFIG}
      SET "latestIndexedBlock" = $1
    `,
      [blockNumber],
    );
  }

  public async updateLatestIndexedEventBlock(blockNumber: number): Promise<void> {
    await this.executeQuery(
      `
      UPDATE ${DB_STRUCTURE_TABLE.CONFIG}
      SET "latestIndexedEventBlock" = $1
    `,
      [blockNumber],
    );
  }

  async insertErc725ySchema(schema: ERC725YSchemaTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_STRUCTURE_TABLE.ERC725Y_SCHEMA}
      ("key", "name", "keyType", "valueType", "valueContent")
      VALUES ($1, $2, $3, $4, $5)
    `,
      [schema.key, schema.name, schema.keyType, schema.valueType, schema.valueContent],
    );
  }

  async getErc725ySchemaByKey(key: string): Promise<ERC725YSchemaTable | null> {
    const rows = await this.executeQuery<ERC725YSchemaTable>(
      'SELECT * FROM "erc725y_schema" WHERE LOWER(key) LIKE LOWER($1)',
      [`%${key.slice(0, 26)}%`],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async insertContractInterface(contractInterface: ContractInterfaceTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_STRUCTURE_TABLE.CONTRACT_INTERFACE} ("id", "code", "name", "version", "type") VALUES ($1, $2, $3, $4, $5)`,
      [
        contractInterface.id,
        contractInterface.code,
        contractInterface.name,
        contractInterface.version,
        contractInterface.type,
      ],
    );

    // Update cache with the new value
    this.cache.contractInterfaces.values.push(contractInterface);
  }

  async getContractInterfaceById(id: string): Promise<ContractInterfaceTable | null> {
    const cachedInterface = this.cache.contractInterfaces.values.find((c) => c.id === id);
    if (cachedInterface) return cachedInterface;

    const rows = await this.executeQuery<ContractInterfaceTable>(
      `SELECT * FROM ${DB_STRUCTURE_TABLE.CONTRACT_INTERFACE} WHERE "id" = $1`,
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async getContractInterfaces(): Promise<ContractInterfaceTable[]> {
    const now = Date.now();

    //If the cache is empty or the cache is older than CACHE_REFRESH_INTERVAL_IN_MS, then refresh the cache
    if (
      this.cache.contractInterfaces.values.length === 0 ||
      now - this.cache.contractInterfaces.lastRefresh >= CACHE_REFRESH_INTERVAL_IN_MS
    ) {
      this.cache.contractInterfaces.values = await this.executeQuery<ContractInterfaceTable>(
        `SELECT * FROM ${DB_STRUCTURE_TABLE.CONTRACT_INTERFACE}`,
      );
      this.cache.contractInterfaces.lastRefresh = now;
    }

    return this.cache.contractInterfaces.values;
  }

  async insertMethodInterface(methodInterface: MethodInterfaceTable): Promise<void> {
    await this.executeQuery(
      `
      INSERT INTO ${DB_STRUCTURE_TABLE.METHOD_INTERFACE}
      VALUES ($1, $2, $3, $4)`,
      [methodInterface.id, methodInterface.hash, methodInterface.name, methodInterface.type],
    );
  }
  async getMethodInterfaceById(id: string): Promise<MethodInterfaceTable | null> {
    const rows = await this.executeQuery<MethodInterfaceTable>(
      `SELECT * FROM ${DB_STRUCTURE_TABLE.METHOD_INTERFACE} WHERE "id" = $1`,
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async insertMethodParameter(methodParameter: MethodParameterTable): Promise<void> {
    await this.executeQuery(
      `INSERT INTO ${DB_STRUCTURE_TABLE.METHOD_PARAMETER} ("methodId", "name", "type", "indexed", "position") VALUES ($1, $2, $3, $4, $5)`,
      [
        methodParameter.methodId,
        methodParameter.name,
        methodParameter.type,
        methodParameter.indexed,
        methodParameter.position,
      ],
    );
  }

  async getMethodParametersByMethodId(methodId: string): Promise<MethodParameterTable[]> {
    return await this.executeQuery<MethodParameterTable>(
      `SELECT * FROM ${DB_STRUCTURE_TABLE.METHOD_PARAMETER} WHERE "methodId" = $1`,
      [methodId],
    );
  }

  private async executeQuery<T>(query: string, values?: any[]): Promise<T[]> {
    try {
      const result = await this.client.query(query, values);
      return result.rows as T[];
    } catch (error) {
      this.logger.error('Error executing a query', { query, values, error });
      throw new Error(`Error executing query: ${query}`);
    }
  }
}
