const ARK = artifacts.require('ARK');

contract.only('ARK', accounts => {
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

    it('should be able to transfer tokens to a second user and have 5% fee distribution', async () => {
        const instance = await ARK.deployed();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount);

        const mainAccountNewBalance = await instance.balanceOf(accounts[0]);

        const secondAccountNewBalance = await instance.balanceOf(accounts[1]);

        const fee = transferAmount.muln(5).divn(100);
        const mainAccountFeeShare = fee.muln(500).divn(975);
        const secondAccountFeeShare = fee.muln(475).divn(975);
        const expectedNewMainAccountBalance = mainAccountBalance
            .sub(transferAmount)
            .add(mainAccountFeeShare);
        const expectedSecondAccountBalance = transferAmount
            .sub(fee)
            .add(secondAccountFeeShare);

        assert.equal(
            expectedNewMainAccountBalance.toString(),
            mainAccountNewBalance.toString(),
        );
        assert.equal(
            expectedSecondAccountBalance.toString(),
            secondAccountNewBalance.toString(),
        );
    });
});
