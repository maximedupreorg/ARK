const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {},
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
