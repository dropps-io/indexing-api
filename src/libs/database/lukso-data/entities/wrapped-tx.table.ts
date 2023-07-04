export interface WrappedTxTable {
  id: number;
  transactionHash: string;
  parentId: number | null;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  methodId: string;
  methodName: string | null;
}
