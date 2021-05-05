const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const web3 = new Web3();

console.log(process.env.ARK_MNEMONICS_MAINNET);

module.exports = {
    networks: {
        mainnet: {
            provider: () =>
                new HDWalletProvider({
                    mnemonic: process.env.ARK_MNEMONICS_MAINNET,
                    providerOrUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ARK_ALCHEMY_API_KEY_MAINNET}`,
                }),
            network_id: 1,
            gasPrice: web3.utils.toWei('40', 'gwei'),
        },
        rinkeby: {
            provider: () =>
                new HDWalletProvider({
                    mnemonic: process.env.ARK_MNEMONICS,
                    providerOrUrl: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ARK_ALCHEMY_API_KEY}`,
                    chainId: 4,
                }),
            network_id: 4,
            skipDryRun: true,
        },
    },
    compilers: {
        solc: {
            version: '0.8.4',
        },
    },
};
