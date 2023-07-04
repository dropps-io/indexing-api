export interface ContractTokenTable {
  id: string; // keccak(address + tokenId)
  address: string;
  index: number;
  decodedTokenId: string | null;
  tokenId: string;
  interfaceCode: string;
  latestKnownOwner: string | null;
}
