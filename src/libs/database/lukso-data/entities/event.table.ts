export interface EventTable {
  id: string;
  blockNumber: number;
  date: Date;
  transactionHash: string;
  logIndex: number;
  address: string;
  eventName: string | null;
  methodId: string;
  topic0: string;
  topic1: string | null;
  topic2: string | null;
  topic3: string | null;
  data: string | null;
}
