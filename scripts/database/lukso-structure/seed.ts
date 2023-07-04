import { config } from 'dotenv';
import path from 'path';
import pg from 'pg';

import {
  DB_STRUCTURE_TABLE,
  DB_STRUCTURE_TYPE,
} from '../../../src/libs/database/lukso-structure/config';

if (process.env.NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });

config();

const client = new pg.Client({
  connectionString: process.env.LUKSO_STRUCTURE_CONNECTION_STRING,
});

export const seedLuksoStructure = async (dropTables?: boolean) => {
  await client.connect();

  if (dropTables) {
    for (const table of Object.keys(DB_STRUCTURE_TABLE).values())
      await client.query(`DROP TABLE IF EXISTS ${DB_STRUCTURE_TABLE[table]} CASCADE`);
    for (const type of Object.keys(DB_STRUCTURE_TYPE).values()) {
      await client.query(`DROP TYPE IF EXISTS ${DB_STRUCTURE_TYPE[type]}`);
    }
  }

  try {
    await client.query(
      `CREATE TYPE ${DB_STRUCTURE_TYPE.METHOD_TYPE} AS ENUM ('event', 'function')`,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Type already exists');
  }

  try {
    await client.query(
      `CREATE TYPE ${DB_STRUCTURE_TYPE.CONTRACT_TYPE} AS ENUM ('profile', 'asset', 'collection')`,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Type already exists');
  }

  await client.query(`
CREATE TABLE IF NOT EXISTS ${DB_STRUCTURE_TABLE.ERC725Y_SCHEMA} (
	"key" VARCHAR(66) NOT NULL,
  "name" VARCHAR(66) NOT NULL,
	"keyType" VARCHAR(20) NOT NULL,
	"valueType" VARCHAR(20) NOT NULL,
	"valueContent" VARCHAR(20) NOT NULL,
	PRIMARY KEY ("key")
)`);

  await client.query(`
CREATE TABLE IF NOT EXISTS ${DB_STRUCTURE_TABLE.CONTRACT_INTERFACE} (
	"id" CHAR(10) NOT NULL,
  "code" VARCHAR(20) NOT NULL,
	"name" VARCHAR(40) NOT NULL,
	"version" VARCHAR(10),
	"type" ${DB_STRUCTURE_TYPE.CONTRACT_TYPE},
	PRIMARY KEY ("id")
)`);

  await client.query(`
CREATE TABLE IF NOT EXISTS ${DB_STRUCTURE_TABLE.METHOD_INTERFACE} (
	"id" CHAR(10) NOT NULL,
  "hash" CHAR(66) NOT NULL,
	"name" VARCHAR(40) NOT NULL,
	"type" ${DB_STRUCTURE_TYPE.METHOD_TYPE} NOT NULL,
	PRIMARY KEY ("id")
)`);

  await client.query(`
CREATE TABLE IF NOT EXISTS ${DB_STRUCTURE_TABLE.METHOD_PARAMETER} (
	"methodId" CHAR(10) NOT NULL,
	"name" VARCHAR(40) NOT NULL,
	"type" VARCHAR(40) NOT NULL,
	"indexed" BOOLEAN NOT NULL,
	"position" INTEGER NOT NULL,
	FOREIGN KEY("methodId") REFERENCES ${DB_STRUCTURE_TABLE.METHOD_INTERFACE}("id") ON DELETE CASCADE
)`);

  await client.query(`
CREATE TABLE IF NOT EXISTS ${DB_STRUCTURE_TABLE.CONFIG} (
	"blockIteration" INTEGER NOT NULL DEFAULT 5000,
	"sleepBetweenIteration" INTEGER NOT NULL DEFAULT 2000,
	"nbrOfThreads" INTEGER NOT NULL DEFAULT 20,
	"paused" BOOLEAN NOT NULL DEFAULT false,
	"latestIndexedBlock" INTEGER NOT NULL DEFAULT 0,
	"latestIndexedEventBlock" INTEGER NOT NULL DEFAULT 0
	)`);

  try {
    await client.query(`INSERT INTO ${DB_STRUCTURE_TABLE.CONFIG} DEFAULT VALUES`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Config already initialized');
  }

  await client.end();
  // eslint-disable-next-line no-console
  console.log('lukso-structure seed script successfully executed');
};
