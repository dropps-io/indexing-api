import { setupEnv } from '../../../utils/setup-env';

setupEnv();

export enum DB_DATA_TABLE {
    API_USAGE = 'api_usage',
}

export const CLIENT_DATA_CONNECTION_STRING = process.env.CLIENT_DATA_CONNECTION_STRING;
