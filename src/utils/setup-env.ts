import { config } from 'dotenv';
import path from 'path';

export const setupEnv = () => {
  if (process.env.NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });
  if (process.env.NODE_ENV === 'mainnet')
    config({ path: path.resolve(process.cwd(), '.env.mainnet') });
  if (process.env.NODE_ENV === 'testnet')
    config({ path: path.resolve(process.cwd(), '.env.testnet') });

  config();
};
