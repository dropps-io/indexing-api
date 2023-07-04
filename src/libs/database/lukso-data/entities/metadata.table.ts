export interface MetadataTable {
  id: number;
  address: string;
  tokenId: string | null;
  name: string | null;
  symbol: string | null;
  description: string | null;
  isNFT: boolean | null;
}
