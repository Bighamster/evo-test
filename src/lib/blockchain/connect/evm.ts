import { ethers } from 'ethers';
import { get, writable } from 'svelte/store';
import { EvmChainName, chains } from './chains';
import type { Connection, Connector, ConnectorStore } from '$lib/types/connect';
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';

import type { IWalletConnectProviderOptions } from '@walletconnect/types';

type ExtProvider = ethers.providers.ExternalProvider & {
  on: (event: string, listener: unknown) => unknown;
  removeListener?: (event: string, listener: unknown) => unknown;
};

declare global {
  interface Window {
    ethereum?: ExtProvider;
    BinanceChain?: ExtProvider;
    WalletConnectProvider?: {
      default: new (
        opts: IWalletConnectProviderOptions
      ) => WalletConnectProvider;
    };
  }
}

interface EvmConnection extends Connection {
  chainId: number;
  provider: ethers.providers.Web3Provider;
}

export interface EvmConnector extends Connector {
  connection?: EvmConnection;
}

export interface EvmConnectorStore
  extends ConnectorStore<EvmConnector, EvmChainName> {
  switchChain: (chainName: EvmChainName) => Promise<void>;
}

const CONNECTOR_KEY = 'evmConnector';

function createEvmConnector(): EvmConnectorStore {
  const connector = writable<EvmConnector>({
    name: 'EVM Based wallet',
    variants: [
      {
        id: 'injected',
        name: 'Metamask',
        icon: '/images/providers/metamask.svg'
      },
      {
        id: 'walletconnect',
        name: 'Wallet Connect',
        icon: '/images/providers/walletconnect.svg'
      },
      {
        id: 'binance',
        name: 'Binance Wallet',
        icon: '/images/providers/bsc.svg'
      },
      {
        id: 'injected',
        name: 'Trust Wallet',
        icon: '/images/providers/trustwallet.svg'
      },
      {
        id: 'injected',
        name: 'Math Wallet',
        icon: '/images/providers/mathwallet.svg'
      },
      {
        id: 'injected',
        name: 'Token Pocket',
        icon: '/images/providers/tokenpocket.svg'
      }
    ]
  });

  let close: () => void | undefined;

  const disconnect = () => {
    localStorage.removeItem(CONNECTOR_KEY);
    connector.update((ctor) => {
      close?.();
      ctor.connection = undefined;
      return ctor;
    });
  };

  const onDisconnect = (err?: Error) => {
    console.log(err);
    if (err?.message?.endsWith('Attempting to connect.')) {
      return;
    }

    err && console.error(err);
    disconnect();
  };

  const onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('disconnect');
      disconnect();
    } else {
      connector.update((ctor) => {
        if (!ctor.connection) {
          console.warn('no evm connection when accounts changed');
        } else {
          ctor.connection.account = ethers.utils.getAddress(accounts[0]);
        }
        return ctor;
      });
    }
  };

  const onChainChanged = (chainId: string) => {
    try {
      const id = ethers.BigNumber.from(chainId).toNumber();
      connector.update((ctor) => {
        if (!ctor.connection) {
          console.warn('no evm connection when chain changed');
        } else {
          ctor.connection.chainId = id;
        }
        return ctor;
      });
    } catch (e) {
      console.error(e);
      disconnect();
    }
  };

  const connect: EvmConnectorStore['connect'] = async (id) => {
    disconnect();
    let walletConnectProvider: WalletConnectProvider | undefined;
    let externalProvider: ExtProvider | undefined;
    let accounts: string[];
    switch (id) {
      case 'injected': {
        if (!window.ethereum) {
          throw new Error('provider not installed');
        }

        externalProvider = window.ethereum;
        accounts = await externalProvider.request({
          method: 'eth_requestAccounts'
        });
        break;
      }
      case 'binance': {
        if (!window.BinanceChain) {
          throw new Error('provider not installed');
        }

        externalProvider = window.BinanceChain;
        accounts = await externalProvider.request({
          method: 'eth_requestAccounts'
        });
        break;
      }
      case 'walletconnect': {
        walletConnectProvider = new WalletConnectProvider({
          rpc: {
            [chains[0].chainId]: chains[0].rpc
          },
          chainId: chains[0].chainId
        });
        console.log(walletConnectProvider.enable());
        accounts = await walletConnectProvider.enable();

        if (!walletConnectProvider.request) {
          throw new Error('internal error, please tell us (code 0002)');
        }
        break;
      }
      default:
        throw new Error('invalid connection id');
    }

    if (externalProvider && !externalProvider.request) {
      throw new Error('unsupported provider');
    }

    if (!accounts.length) {
      throw new Error('please, allow at least one account');
    }

    close = () => {
      if (id === 'walletconnect') {
        walletConnectProvider.removeListener?.(
          'accountsChanged',
          onAccountsChanged
        );
        walletConnectProvider.removeListener?.('chainChanged', onChainChanged);
        walletConnectProvider.removeListener?.('disconnect', onDisconnect);
      } else {
        externalProvider.removeListener?.('accountsChanged', onAccountsChanged);
        externalProvider.removeListener?.('chainChanged', onChainChanged);
        externalProvider.removeListener?.('disconnect', onDisconnect);
      }
    };
    let provider: ethers.providers.Web3Provider;

    if (id === 'walletconnect') {
      provider = new ethers.providers.Web3Provider(
        walletConnectProvider,
        'any'
      );
      walletConnectProvider.on('accountsChanged', onAccountsChanged);
      walletConnectProvider.on('chainChanged', onChainChanged);
      walletConnectProvider.on('disconnect', onDisconnect);
    } else {
      provider = new ethers.providers.Web3Provider(externalProvider, 'any');
      externalProvider.on('accountsChanged', onAccountsChanged);
      externalProvider.on('chainChanged', onChainChanged);
      externalProvider.on('disconnect', onDisconnect);
    }

    const signer = await provider.getSigner();
    const chainId = (await provider.getNetwork()).chainId;

    connector.update((ctor) => {
      ctor.connection = {
        account: ethers.utils.getAddress(accounts[0]),
        switchable: Boolean(externalProvider?.isMetaMask),
        signer,
        chainId,
        provider
      };
      return ctor;
    });

    localStorage.setItem(CONNECTOR_KEY, id);
  };

  const switchChain = async (chainName: EvmChainName) => {
    const ctor = get(connector);
    if (!ctor.connection) {
      throw new Error('no connection');
    }
    if (!ctor.connection.switchable) {
      throw new Error('non switchable connection');
    }

    const chain = chains[chainName];

    try {
      await ctor.connection.provider.send('wallet_switchEthereumChain', [
        { chainId: '0x' + chain.chainId.toString(16) }
      ]);
    } catch (e) {
      if ((e as { code: number }).code === 4902 && chain) {
        await ctor.connection.provider.send('wallet_addEthereumChain', [
          {
            chainId: '0x' + chain.chainId.toString(16),
            chainName: chain.chainName,
            nativeCurrency: {
              name: chain.nativeCurrency,
              symbol: chain.nativeCurrency,
              decimals: 18
            },
            rpcUrls: [chain.rpc],
            blockExplorerUrls: [chain.explorer]
          }
        ]);
        return;
      }
      throw e;
    }
  };

  const tryReconnect = async () => {
    const variant = localStorage.getItem(CONNECTOR_KEY);
    if (variant) {
      try {
        connect(variant);
      } catch (_) {
        localStorage.removeItem(CONNECTOR_KEY);
      }
    }
  };

  return {
    subscribe: connector.subscribe,
    connect,
    disconnect,
    switchChain,
    tryReconnect
  };
}

export const evmConnector = createEvmConnector();
