import { get } from 'svelte/store';
import { ethers } from 'ethers';
import data, { balances } from '$stores/test';

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

    // const tokenContractAddress = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
    // const tokenContractAddress = '0x55d398326f99059fF775485246999027B3197955';
    // const tokenContractAddress = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c';
    // const genericErc20Abi = [
    //   // Read-Only Functions
    //   "function balanceOf(address owner) view returns (uint256)",
    //   "function decimals() view returns (uint8)",
    //   "function symbol() view returns (string)",
    //   // Authenticated Functions
    //   "function transfer(address to, uint amount) returns (bool)",
    //   // Events
    //   "event Transfer(address indexed from, address indexed to, uint amount)"
    // ];
    // const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, externalProvider);
    // // const val = (await contract.balanceOf((await externalProvider.provider.getSigners())[0].address)).toString();
    // const val = await contract.balanceOf(tokenContractAddress);
    //
    // window._qqq = { externalProvider, contract, balance: ethers.utils.formatEther(val) };
    //
    // console.log(window._qqq);
  }

  return true;
}
const disconnect = () => {
  data.set({});
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
export { data, balances };
