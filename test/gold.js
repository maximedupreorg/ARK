const GOLD = artifacts.require('GOLD');

contract.only('GOLD', accounts => {
    it('should be able to deploy an instance', async () => {
        await GOLD.deployed();

        return assert.isTrue(true);
    });

    it('should have the GOLD symbol', async () => {
        const instance = await GOLD.deployed();

        const symbol = await instance.symbol();

        assert.equal('GOLD', symbol);
    });

    it('should have the Gold name', async () => {
        const instance = await GOLD.deployed();

        const name = await instance.name();

        assert.equal('Gold', name);
    });

    it('should have a 10M token supply', async () => {
        const instance = await GOLD.deployed();

        const supply = await instance.totalSupply();

        const nbDecimals = await instance.decimals();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const decimals = 10 ** nbDecimals;

        assert.equal(10000000, +supply.toString() / decimals);
        assert.equal(10000000, +mainAccountBalance.toString() / decimals);
    });
});
