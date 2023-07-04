import { Client, QueryResult } from 'pg';

import { seedLuksoData } from '../../scripts/database/lukso-data/seed';
import { seedLuksoStructure } from '../../scripts/database/lukso-structure/seed';
import {
  DB_STRUCTURE_TABLE,
  LUKSO_STRUCTURE_CONNECTION_STRING,
} from '../../src/libs/database/lukso-structure/config';
import {
  DB_DATA_TABLE,
  LUKSO_DATA_CONNECTION_STRING,
} from '../../src/libs/database/lukso-data/config';
import { setupEnv } from '../../src/utils/setup-env';

setupEnv();

const structureClient = new Client({
  connectionString: LUKSO_STRUCTURE_CONNECTION_STRING,
});

const dataClient = new Client({
  connectionString: LUKSO_DATA_CONNECTION_STRING,
});

const cleanup = async () => {
  for (const table of Object.keys(DB_STRUCTURE_TABLE).values()) {
    await structureClient.query(`DELETE FROM ${DB_STRUCTURE_TABLE[table]}`);
  }
  for (const table of Object.keys(DB_DATA_TABLE).values())
    await dataClient.query(`DELETE FROM ${DB_DATA_TABLE[table]}`);

  await structureClient.query(`INSERT INTO ${DB_STRUCTURE_TABLE.CONFIG} DEFAULT VALUES`);
};

beforeAll(async () => {
  await dataClient.connect();
  await structureClient.connect();

  await seedLuksoData(true);
  await seedLuksoStructure(true);
});

beforeEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await structureClient.end();
  await dataClient.end();
});

export const executeQuery = async (
  query: string,
  DB: 'DATA' | 'STRUCTURE',
  values?: any[],
): Promise<QueryResult> => {
  let client;
  switch (DB) {
    case 'DATA':
      client = dataClient;
      break;
    case 'STRUCTURE':
      client = structureClient;
      break;
  }
  return new Promise((resolve, reject) => {
    client.query(query, values ? values : [], async (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};
