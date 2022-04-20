import { writable, derived } from 'svelte/store';
import { ethers } from 'ethers';

const tick = writable(1);
const data = writable({});

const genericErc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)"
];

// BNB only
const multiCallAddress = '0x41263cBA59EB80dC200F3E2544eda4ed6A90E76C';

const multiCall = async (provider, calls = []) => {

  const callTuples = calls.map(call => ({
    callData: call.contract.interface.encodeFunctionData(call.function, call.params),
      target: call.contract.resolvedAddress
  }));
  const multiCallContract = new ethers.Contract(
    multiCallAddress,
    [
      'function aggregate(tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] memory returnData)'
      // {
      //   type: 'function',
      //   name: 'aggregate',
      //   payable: false,
      //   stateMutability: 'view',
      //   constant: true,
      //   inputs: [
      //     {
      //       components: [
      //         {
      //           internalType: 'address',
      //           name: 'target',
      //           type: 'address',
      //         },
      //         {
      //           internalType: 'bytes',
      //           name: 'callData',
      //           type: 'bytes',
      //         },
      //       ],
      //       internalType: 'struct Multicall.Call[]',
      //       name: 'calls',
      //       type: 'tuple[]',
      //     },
      //   ],
      //   outputs: [
      //     {
      //       internalType: 'uint256',
      //       name: 'blockNumber',
      //       type: 'uint256',
      //     },
      //     {
      //       internalType: 'bytes[]',
      //       name: 'returnData',
      //       type: 'bytes[]',
      //     },
      //   ]
      // }
    ],
    provider
  );
  const multiReturn = await multiCallContract.aggregate(callTuples);

  return calls.map((call, idx) => ({
    ...call,
        raw: multiReturn.returnData[idx],
    decoded: call.contract.interface.decodeFunctionResult(call.function, multiReturn.returnData[idx])
  }));
}

export const balances = derived([data, tick], ([$data, $tick], set) => {

  if( $data.network !== 'bnb' ) {
    return [];
  }

  const provider = $data.externalProvider;
  const signer   = provider.getSigner();

  const calls = [];

  [
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0x55d398326f99059fF775485246999027B3197955',
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'
  ].forEach(address => calls.push(
    {
      contract: new ethers.Contract(address, genericErc20Abi, provider),
      function: 'symbol() view returns (string)',
        params: []
    },
    {
      contract: new ethers.Contract(address, genericErc20Abi, provider),
      function: 'balanceOf(address owner) view returns (uint256)',
        params: [address]
    }
  ));

  multiCall(signer, calls)
  .then(result => {

    const h = {};

    result.forEach(r => {

      const key = r.contract.address;

      h[key] = h[key] || {};

      if( r.function.startsWith('symbol') ) {
        h[key].name = r.decoded[0];
      } else if( r.function.startsWith('balance') ) {
        h[key].value = ethers.utils.formatUnits(r.decoded[0], 18);
      }
    });

    set(Object.keys(h).map(k => ({name: h[k].name, value: h[k].value})));
  });

  return [];

}, []);

const doUpdateBalances = () => tick.update(val => val + 1);

setInterval(doUpdateBalances, 10000);

export { data, tick, doUpdateBalances };
