import { config } from "dotenv";
import path from "path";
import pg from "pg";
import { DB_DATA_TABLE } from "../../../src/libs/database/client-data/config";

if (process.env.NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });

config();

const client = new pg.Client({
  connectionString: process.env.CLIENT_DATA_CONNECTION_STRING,
});


export const seedClientData = async (dropTables?: boolean) => {
  await client.connect();

  if (dropTables) {
    for (const table of Object.keys(DB_DATA_TABLE).values())
      await client.query(`DROP TABLE IF EXISTS ${DB_DATA_TABLE[table]} CASCADE`);
    }

  await client.query(`
CREATE TABLE IF NOT EXISTS ${DB_DATA_TABLE.API_USAGE} (
	"id" INTEGER NOT NULL,
  "client_ip" INTEGER NOT NULL,
  "country" VARCHAR(20),
  "user_agent" VARCHAR(40) NOT NULL,
  "device_id" INTEGER,
  "request_count" INTEGER NOT NULL,
  "rate_limit_quota" INTEGER NOT NULL,
	PRIMARY KEY ("id")
)`);

  await client.end();
  // eslint-disable-next-line no-console
  console.log('client-data seed script successfully executed');
}

