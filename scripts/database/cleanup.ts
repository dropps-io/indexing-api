import { Client } from 'pg';

import { setupEnv } from '../../src/utils/setup-env';
import {
  DB_STRUCTURE_TABLE,
  LUKSO_STRUCTURE_CONNECTION_STRING,
} from '../../src/libs/database/lukso-structure/config';

setupEnv();

const luksoStructureClient = new Client({
  connectionString: LUKSO_STRUCTURE_CONNECTION_STRING,
});

const cleanup = async () => {
  await luksoStructureClient.connect();

  for (const table of Object.values(DB_STRUCTURE_TABLE)) {
    await luksoStructureClient.query(`DELETE FROM ${table}`);
  }

  await luksoStructureClient.end();
};

cleanup().then();
