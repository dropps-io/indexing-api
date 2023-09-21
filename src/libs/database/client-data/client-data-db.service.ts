import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import winston from 'winston';
import {ApiUsageEntity} from "../../../resolvers/apiUsage/entities/apiUsage.entity";
import {LoggerService} from "../../logger/logger.service";
import {CLIENT_DATA_CONNECTION_STRING} from "../client-data/config";

@Injectable()
export class ApiUsageService implements OnModuleDestroy {
    protected readonly client: Pool & {
        query: (query: string, values?: any[]) => Promise<QueryResult<any>>;
    };
    protected readonly logger: winston.Logger;

    constructor(protected readonly loggerService: LoggerService) {
        this.logger = this.loggerService.getChildLogger('ClientDataDbService');
        this.client = new Pool({
            connectionString: "CLIENT_DATA_CONNECTION_STRING",
        });
    }

    async create(apiUsageData: Partial<ApiUsageEntity>): Promise<void> {
        const client = await this.client.connect();

        try {
            const { client_ip, user_agent, country, device_id, request_count, rate_limit_quota } = apiUsageData;
            const query = 'INSERT INTO api_usage (client_ip, user_agent, country, device_id, request_count, rate_limit_quota) VALUES ($1, $2, $3, $4, $5, $6)';
            const values = [client_ip, user_agent, country, device_id, request_count, rate_limit_quota];

            await client.query(query, values);
        } finally {
            client.release();
        }
    }

    async findAll(): Promise<ApiUsageEntity[]> {
        const query = 'SELECT * FROM api_usage';
        const result: QueryResult = await this.client.query(query);

        return result.rows;
    }

    async findById(id: string): Promise<ApiUsageEntity | null> {
        const query = 'SELECT * FROM api_usage WHERE id = $1';
        const result: QueryResult = await this.client.query(query, [id]);

        return result.rows[0] || null;
    }7

    async update(id: string, updateData: Partial<ApiUsageEntity>): Promise<void> {
        const { client_ip, user_agent, country, device_id, request_count, rate_limit_quota } = updateData;
        const query = `
      UPDATE api_usage
      SET
        client_ip = $1,
        user_agent = $2,
        country = $3,
        device_id = $4,
        request_count = $5,
        rate_limit_quota = $6
      WHERE id = $7
    `;
        const values = [client_ip, user_agent, country, device_id, request_count, rate_limit_quota, id];

        await this.client.query(query, values);
    }

    onModuleDestroy() {
        this.client.end();
    }
}
