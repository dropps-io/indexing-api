import { setupEnv } from '../../../utils/setup-env';

setupEnv();

export enum DB_DATA_TYPE {
  CONTRACT_TYPE = 'contract_type',
}

export enum DB_DATA_INDEX {
  TOKEN_HOLDER_UNIQUE = 'token_holder_unique',
  TOKEN_HOLDER_UNIQUE_NO_TOKEN = 'token_holder_unique_no_token',
  METADATA_UNIQUE = 'metadata_unique',
  METADATA_UNIQUE_NO_TOKEN = 'metadata_unique_no_token',
}

export enum DB_DATA_TABLE {
  CONTRACT = 'contract',
  METADATA = 'metadata',
  METADATA_IMAGE = 'metadata_image',
  METADATA_LINK = 'metadata_link',
  METADATA_TAG = 'metadata_tag',
  METADATA_ASSET = 'metadata_asset',
  CONTRACT_TOKEN = 'contract_token',
  TOKEN_HOLDER = 'token_holder',
  ERC725Y_DATA_CHANGED = 'erc725y_data_changed',
  TRANSACTION = 'transaction',
  TRANSACTION_INPUT = 'transaction_input',
  TRANSACTION_PARAMETER = 'transaction_parameter',
  WRAPPED_TRANSACTION = 'wrapped_transaction',
  WRAPPED_TRANSACTION_INPUT = 'wrapped_transaction_input',
  WRAPPED_TRANSACTION_PARAMETER = 'wrapped_transaction_parameter',
  EVENT = 'event',
  EVENT_PARAMETER = 'event_parameter',
}

export const LUKSO_DATA_CONNECTION_STRING = process.env.LUKSO_DATA_CONNECTION_STRING;
