import { CONTRACT_TYPE } from '../../../../models/enums';

export interface ContractTable {
  address: string;
  interfaceCode: string | null;
  interfaceVersion: string | null;
  type: CONTRACT_TYPE | null;
}
