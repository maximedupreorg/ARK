const GOLD = artifacts.require('GOLD');

contract('GOLD', accounts => {
    it('should have the GOLD symbol', async () => {
        const instance = await GOLD.new();

        const symbol = await instance.symbol();

        assert.equal(symbol, 'GOLD', 'token symbol');
    });

    it('should have the Gold name', async () => {
        const instance = await GOLD.new();

        const name = await instance.name();

        assert.equal(name, 'Gold', 'token name');
    });

    it('should have a 10M token supply', async () => {
        const instance = await GOLD.new();

        const supply = await instance.totalSupply();

        const nbDecimals = await instance.decimals();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const decimals = 10 ** nbDecimals;

        assert.equal(+supply.toString() / decimals, 10000000, 'token supply');
        assert.equal(
            +mainAccountBalance.toString() / decimals,
            10000000,
            'main account balance',
        );
    });

    it('should be able to transfer tokens to a second user and have 4% fee distribution, 1% amongst holder and 3% to the non blackhole burn address', async () => {
        const instance = await GOLD.new();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount);

        const mainAccountNewBalance = await instance.balanceOf(accounts[0]);

        const secondAccountNewBalance = await instance.balanceOf(accounts[1]);

        const burnAccountBalance = await instance.balanceOf(
            '0x0000000000000000000000000000000000000000',
        );

        const fee = transferAmount.muln(4).divn(100);
        const holdersFee = fee.divn(4);
        const mainAccountFeeShare = holdersFee.muln(500).divn(980);
        const secondAccountFeeShare = holdersFee.muln(480).divn(980);
        const burnAccountFeeShare = fee.sub(holdersFee);
        const expectedNewMainAccountBalance = mainAccountBalance
            .sub(transferAmount)
            .add(mainAccountFeeShare);
        const expectedSecondAccountBalance = transferAmount
            .sub(fee)
            .add(secondAccountFeeShare);
        const expectedBurnAccountBalance = burnAccountFeeShare;

        assert.equal(
            mainAccountNewBalance.toString(),
            expectedNewMainAccountBalance.toString(),
            'main account balance',
        );
        assert.equal(
            secondAccountNewBalance.toString(),
            expectedSecondAccountBalance.toString(),
            'second account balance',
        );
        assert.equal(
            burnAccountBalance.toString(),
            expectedBurnAccountBalance.toString(),
            'burn account balance',
        );
    });

    it('should not have a blackhole burn address', async () => {
        const instance = await GOLD.new();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount1 = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount1);

        const burnedAmount1 = transferAmount1
            .muln(4)
            .divn(100)
            .muln(3)
            .divn(4);

        const transferAmount2 = transferAmount1.divn(2);

        await instance.transfer(accounts[0], transferAmount2, {
            from: accounts[1],
        });

        const burnAccountBalance = await instance.balanceOf(
            '0x0000000000000000000000000000000000000000',
        );

        const burnedAmount2 = transferAmount2
            .muln(4)
            .divn(100)
            .muln(3)
            .divn(4);

        assert.equal(
            burnAccountBalance.toString(),
            burnedAmount1.add(burnedAmount2).toString(),
            'burn account balance',
        );
    });
});
