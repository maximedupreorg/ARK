const ARK = artifacts.require('ARK');

contract('ARK', accounts => {
    it('should be able to deploy an instance', async () => {
        await ARK.deployed();

        return assert.isTrue(true);
    });

    it('should have a 1.5B token supply', async () => {
        const instance = await ARK.deployed();

        const supply = await instance.totalSupply();

        const nbDecimals = await instance.decimals();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const decimals = 10 ** nbDecimals;

        assert.equal(1500000000, +supply.toString() / decimals);
        assert.equal(1500000000, +mainAccountBalance.toString() / decimals);
    });
});
