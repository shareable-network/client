import Alpine from 'alpinejs';
import {ethers} from 'ethers';
import hashFormatter from './utils/hashFormatter.js';
import M from './libs/materialize/bin/materialize.min.js';

document.addEventListener('DOMContentLoaded', function() {
  const elems = document.querySelectorAll('.sidenav');
  const instances = M.Sidenav.init(elems);
});

window.Alpine = Alpine
 
import './static/scss/index.scss';
import './router';

Alpine.deferMutations();
Alpine.store('app', {
  error: null,
  publisher: null,
  rpc: null,
  signer: null,
  chainId: null,
  core: null,
  provider: null,
  infuraIpfsProjectId: '2AnKHNQq83kUY87ARsQC5BmArQa',
  infuraIpfsProjectSecret: 'd243fc418e27e3d2dd40e4587a502316',

  load: async function () {
    if(!window.ethereum) return;
    await this.setNewChain();
    this.getPublisher().catch();
    window.ethereum.on('accountsChanged', this.getPublisher.bind(this));
    window.ethereum.on('chainChanged', this.setNewChain.bind(this));
  },

  setNewChain: async function () {
    this.rpc = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = Alpine.raw(this.rpc).getSigner();
    const { chainId } = await Alpine.raw(this.rpc).getNetwork();
    this.chainId = chainId;
  },

  getPublisher: async function () {
    const accounts = await this.rpc.send('eth_requestAccounts', []);
    this.publisher = accounts[0];
    return this.publisher;
  },

  getCore: async function () {
    const abi = (await import('./core.json', { assert: { type: 'json' } })).default;
    this.core = new ethers.Contract(
      '0xf5Ab549c213b8FbE9e715f748868A3A3A5A6B3C3',
      abi,
      Alpine.raw(this.signer),
    );
    return this.core;
  },

  getProvider: async function () {
    const abi = (await import('./provider.json', { assert: { type: 'json' } })).default;
    this.provider = new ethers.Contract(
      '0xd3815703681bFe2056476883201FCCB335BC6671',
      abi,
      Alpine.raw(this.signer),
    );
    return this.provider;
  },

  arraysToObject: function (keys, values) {
    return keys.reduce((acc, curr, index) => {
      const key = ethers.utils.parseBytes32String(curr);
      if (key === '') return acc;
      acc[key] = values[index];
      return acc;
    }, {});
  },

  hasWallet: function () {
    return !!window.ethereum;
  },

  chainIsValid: function () {
    return this.chainId === 43113;
  },

  switchChain: async function () {
    console.log('switchChain');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa869' }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xa869',
                chainName: 'Avalanche Fuji Testnet',
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io'],
              },
            ],
          });
          window.location.reload();
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  },

  hashFormatter,
});

Alpine.start();
