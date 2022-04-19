<script lang="ts">
  import Button from '$lib/components/UI/Button/Button.svelte';
  import { evmConnector } from '$lib/blockchain/connect';
  import { ethers } from 'ethers';

  let externalProvider: ethers.providers.ExternalProvider | undefined;
  let ethereum;
  let network: string | undefined;
  let account: string | undefined;
  let accounts: Array<string> = [];
  let message: string | undefined;
  let balance: string | undefined;

  let isMetaMask: boolean = false;
  let isConnected: boolean = false;

  const connect = async (): void => { console.log('connect');

    ethereum   = window.ethereum;
    isMetaMask = ethereum?.isMetaMask;
    message    = undefined;

    if( !isMetaMask ) {
      message = 'Metamax is not available';
      return;
    }

    externalProvider = new ethers.providers.Web3Provider(ethereum, 'any');
    // window.externalProvider = externalProvider;

    externalProvider.provider.on('accountsChanged', onAccountsChanged);
    externalProvider.provider.on('chainChanged', onChainChanged);
    externalProvider.provider.on('disconnect', onDisconnect);
    externalProvider.provider.on('connect', arg => console.log('event:connect', arg));
    // externalProvider.on("network", (newNetwork, oldNetwork) => console.log('network', {newNetwork, oldNetwork}));

    accounts = await externalProvider.listAccounts();

    if( accounts.length ) {
      refresh();
    } else {
      message = "Log in to Metamax plugin please.";
      await ethereum.request({ method: 'eth_requestAccounts' });
    }
  }
  const disconnect = (): void => { console.log('disconnect');

    accounts = [];
    account  = undefined;
    network  = undefined;
    message  = undefined;
    balance  = undefined;
    isConnected = false;

    externalProvider.provider.removeListener('accountsChanged', onAccountsChanged);
    externalProvider.provider.removeListener('chainChanged', onChainChanged);
    externalProvider.provider.removeListener('disconnect', onDisconnect);
  }

  const onAccountsChanged = (_accounts):void => { console.log('onAccountsChanged',_accounts);
    accounts = _accounts;
    refresh();
  }
  const onChainChanged = async (chainId):void => { console.log('onChainChanged',chainId);
    refresh();
  }
  const onDisconnect = (code, reason):void => { console.log('onDisconnect', code, reason);
    disconnect();
  }
  const refresh = async (): void => { console.log('refresh');

    account = accounts[0];
    message = undefined;

    if( account ) {
      isConnected = true;
      network = await externalProvider.getNetwork();
      balance = ethers.utils.formatEther(await externalProvider.getBalance(account));
    } else {
      disconnect();
    }
  }
  const addBnbNetwork = (): void => {
    if( isConnected ) {

      message = undefined;

      ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: {
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-dataseed.binance.org'],
          blockExplorerUrls: ['https://bscscan.com/']
        }]
      })
      .catch(error => {
        if( error.code == -32002 ) {
          message = "The previous request is not complete. Please return to the Metamask popup window.";
        }
        console.error(error);
      });
    }
  }

</script>

<header>
  <a href="/" title="Evodefi Homepage" class="logo">
    Evodefi <img src="/evodefi-logo.svg" alt="Evodefi logo" />
  </a>
  <Button size='md' color='gradient' on:click={ isConnected ? disconnect : connect}>{account ? 'Disconnect' : 'Connect to Metamask'}</Button>
</header>

{#if message}
  <h3><strong>{message}</strong></h3>
{/if}

<ul>
  <li>Account: {account}</li>
  <li>Network: {network?.name}</li>
  <li>Balance: {balance}</li>
</ul>

<br/>

{#if isConnected && network?.name !== 'bnb'}
  <Button size='md' on:click={addBnbNetwork}>Switch to BNB network</Button>
{/if}

<style lang="postcss">
  header {
    @apply 2xl:w-[1440px] w-full mx-auto flex flex-row py-6 px-5 justify-between;
  }
  .logo {
    @apply flex flex-row items-center gap-2 text-2xl font-semibold;
  }
</style>
