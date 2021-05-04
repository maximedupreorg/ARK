const GOLD = artifacts.require('GOLD');

contract('GOLD', accounts => {
    it('should be able to deploy an instance', async () => {
        const instance = await GOLD.new();

        return assert.isTrue(true);
    });

    it('should have the GOLD symbol', async () => {
        const instance = await GOLD.new();

        const symbol = await instance.symbol();

        assert.equal('GOLD', symbol);
    });

    it('should have the Gold name', async () => {
        const instance = await GOLD.new();

        const name = await instance.name();

        assert.equal('Gold', name);
    });

    it('should have a 10M token supply', async () => {
        const instance = await GOLD.new();

        const supply = await instance.totalSupply();

        const nbDecimals = await instance.decimals();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const decimals = 10 ** nbDecimals;

        assert.equal(10000000, +supply.toString() / decimals);
        assert.equal(10000000, +mainAccountBalance.toString() / decimals);
    });

    it('should be able to transfer tokens to a second user and have 5% fee distribution, 1% amongst holder and 4% to the non blackhole burn address', async () => {
        const instance = await GOLD.new();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount);

        const mainAccountNewBalance = await instance.balanceOf(accounts[0]);

        const secondAccountNewBalance = await instance.balanceOf(accounts[1]);

        const burnAccountBalance = await instance.balanceOf(
            '0x0000000000000000000000000000000000000000',
        );

        const fee = transferAmount.muln(5).divn(100);
        const holdersFee = fee.divn(5);
        const mainAccountFeeShare = holdersFee.muln(500).divn(995);
        const secondAccountFeeShare = holdersFee.muln(475).divn(995);
        const burnAccountFeeShare = fee.sub(holdersFee);
        const expectedNewMainAccountBalance = mainAccountBalance
            .sub(transferAmount)
            .add(mainAccountFeeShare);
        const expectedSecondAccountBalance = transferAmount
            .sub(fee)
            .add(secondAccountFeeShare);
        const expectedBurnAccountBalance = burnAccountFeeShare;

        assert.equal(
            expectedNewMainAccountBalance.toString(),
            mainAccountNewBalance.toString(),
        );
        assert.equal(
            expectedSecondAccountBalance.toString(),
            secondAccountNewBalance.toString(),
        );
        assert.equal(
            expectedBurnAccountBalance.toString(),
            burnAccountBalance.toString(),
        );
    });

    it('should not have a blackhole burn address', async () => {
        const instance = await GOLD.new();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount1 = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount1);

        const burnedAmount1 = transferAmount1
            .muln(5)
            .divn(100)
            .muln(4)
            .divn(5);

        const transferAmount2 = transferAmount1.divn(2);

        await instance.transfer(accounts[0], transferAmount2, {
            from: accounts[1],
        });

        const burnAccountBalance = await instance.balanceOf(
            '0x0000000000000000000000000000000000000000',
        );

        const burnedAmount2 = transferAmount2
            .muln(5)
            .divn(100)
            .muln(80)
            .divn(100);

        assert.equal(
            burnedAmount1.add(burnedAmount2).toString(),
            burnAccountBalance.toString(),
        );
    });
});
