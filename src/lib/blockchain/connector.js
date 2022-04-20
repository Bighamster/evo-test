import { get } from 'svelte/store';
import { ethers } from 'ethers';
import { data, balances, tick } from '$stores/test';

let ethereum;
let externalProvider;

const connect = async () => {

  if( !isMetaMask() ) {
    setMessage('Metamax is not available');
    return;
  } else if( isConnected() ) {
    setMessage('Already connected.');
    return;
  } else {
    setMessage('Log in to Metamax plugin please.');
  }

  externalProvider.provider.on('accountsChanged', onAccountsChanged);
  externalProvider.provider.on('chainChanged', onChainChanged);
  externalProvider.provider.on('disconnect', onDisconnect);
  // externalProvider.provider.on('connect', arg => console.log('event:connect', arg));
  // externalProvider.on("network", (newNetwork, oldNetwork) => console.log('network', {newNetwork, oldNetwork}));

  const accounts = await externalProvider.listAccounts();

  if( accounts.length == 0 ) {
    await ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    const network = await externalProvider.getNetwork();
    const balance = await externalProvider.getBalance(accounts[0]);

    data.update(d => ({
      ...d,
      externalProvider,
      network: network.name,
      account: accounts[0],
      message: undefined,
      isConnected: true,
      balance: ethers.utils.formatEther(balance)
    }));
  }

  return true;
}
const disconnect = () => {
  data.set({});
  tick.set(1);
  externalProvider.provider.removeListener('accountsChanged', onAccountsChanged);
  externalProvider.provider.removeListener('chainChanged', onChainChanged);
  externalProvider.provider.removeListener('disconnect', onDisconnect);
}
const onAccountsChanged = async accounts => {
  const balance = await externalProvider.getBalance(accounts[0]);
  data.update(d => ({
    ...d,
    account: accounts[0],
    message: undefined,
    balance: ethers.utils.formatEther(balance)
  }));
}
const onChainChanged = async chainId => {
  const network = await externalProvider.getNetwork();
  const balance = await externalProvider.getBalance(get(data).account);
  data.update(d => ({
    ...d,
    network: network.name,
    message: undefined,
    balance: ethers.utils.formatEther(balance)
  }));
}
const onDisconnect = (code, reason) => disconnect();
const addBnbNetwork = () => {
  if( isConnected() ) {
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
    .then(() => setMessage())
    .catch(error => {
      if( error.code == -32002 ) {
        setMessage('The previous request is not complete. Please return to the Metamask popup window.');
        console.error(error);
      }
    });
  } else {
    setMessage('Not connected.');
  }
}
const isMetaMask  = () => ethereum?.isMetaMask
const isConnected = () => !!get(data).account
const setMessage  = (text = undefined) => data.update(d => ({...d, message: text}));

export default instance => {

  ethereum = instance;
  externalProvider = new ethers.providers.Web3Provider(ethereum, 'any');

  return {
    connect,
    disconnect,
    addBnbNetwork,
    isConnected,
    isMetaMask
  }
}
export { data, balances, tick };
