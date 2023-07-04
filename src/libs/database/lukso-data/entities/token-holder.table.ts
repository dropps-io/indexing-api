export interface TokenHolderTable {
  holderAddress: string;
  contractAddress: string;
  tokenId: string | null;
  balanceInEth: number;
  balanceInWei: string;
  holderSinceBlock: number;
}
