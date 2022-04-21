import type { ethers } from 'ethers';

export type ExtProvider = ethers.providers.ExternalProvider & {
  on: (event: string, listener: unknown) => unknown,
  removeListener?: (event: string, listener: unknown) => unknown
};

export type Web3Provider = ethers.providers.Web3Provider;

export interface Connector {
  externalProvider: Web3Provider,
  isConnected: boolean,
  network?: string,
  account?: number,
  message?: string | undefined,
  balance?: number
}

export interface Connection {
  connect: () => void,
  disconnect: () => void,
  addBnbNetwork: () => void,
  isConnected: () => boolean,
  isMetaMask: () => boolean
}

declare global {
  interface Window {
    ethereum?: ExtProvider
  }
}
