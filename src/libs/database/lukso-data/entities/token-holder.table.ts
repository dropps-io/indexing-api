export interface TokenHolderTable {
  holderAddress: string;
  contractAddress: string;
  tokenId: string | null;
  balanceInEth: string;
  balanceInWei: string;
  holderSinceBlock: number;
}
