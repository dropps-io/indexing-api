import { setupEnv } from '../../../utils/setup-env';

setupEnv();

export enum DB_STRUCTURE_TABLE {
  ERC725Y_SCHEMA = 'erc725y_schema',
  CONTRACT_INTERFACE = 'contract_interface',
  METHOD_INTERFACE = 'method_interface',
  METHOD_PARAMETER = 'method_parameter',
  CONFIG = 'config',
}

export enum DB_STRUCTURE_TYPE {
  METHOD_TYPE = 'method_type',
  CONTRACT_TYPE = 'contract_type',
}

export const LUKSO_STRUCTURE_CONNECTION_STRING = process.env.LUKSO_STRUCTURE_CONNECTION_STRING;

export const CACHE_REFRESH_INTERVAL_IN_MS = 1000 * 60 * 60; // 60 minutes
