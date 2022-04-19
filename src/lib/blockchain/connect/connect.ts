/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable } from 'svelte/store';
import type { ConnectorStore, ConnectionVariant } from '$lib/types/connect';

type ConnectModal =
  | {
      open: true;
      connector: ConnectorStore;
      filter?: (variant: ConnectionVariant) => boolean;
      params?: any;
    }
  | {
      open: false;
    };

const closed: ConnectModal = {
  open: false
};

function createConnectModal() {
  const { subscribe, set } = writable<ConnectModal>(closed);

  return {
    subscribe,
    show: (
      connector: ConnectorStore,
      filter?: (variant: ConnectionVariant) => boolean,
      params?: any
    ) =>
      set({
        open: true,
        connector,
        filter,
        params
      }),
    hide: () => set(closed)
  };
}

export const connectModal = createConnectModal();

export const walletsModal = writable(false);
