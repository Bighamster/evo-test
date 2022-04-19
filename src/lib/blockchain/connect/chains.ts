export enum EvmChainName {
  BSC
}

export type EvmChainParams = {
  chainId: number;
  chainName: string;
  nativeCurrency: string;
  rpc: string;
  explorer: string;
};

export const chains: { [name in EvmChainName]: EvmChainParams } = {
  [EvmChainName.BSC]: {
    chainId: 56,
    chainName: 'BSC',
    nativeCurrency: 'BNB',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com/'
  }
};
