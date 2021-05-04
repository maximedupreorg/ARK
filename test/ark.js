const ARK = artifacts.require('ARK');

contract('ARK', accounts => {
    it('should have the ARK symbol', async () => {
        const instance = await ARK.new();

        const symbol = await instance.symbol();

        assert.equal(symbol, 'ARK', 'token symbol');
    });

    it('should have the Ark name', async () => {
        const instance = await ARK.new();

        const name = await instance.name();

        assert.equal(name, 'Ark', 'token name');
    });

    it('should have a 1.5B token supply', async () => {
        const instance = await ARK.new();

        const supply = await instance.totalSupply();

        const nbDecimals = await instance.decimals();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const decimals = 10 ** nbDecimals;

        assert.equal(+supply.toString() / decimals, 1500000000, 'total supply');
        assert.equal(
            +mainAccountBalance.toString() / decimals,
            1500000000,
            'main account balance',
        );
    });

    it('should be able to transfer tokens to a second user and have 3% fee distribution amongst holders', async () => {
        const instance = await ARK.new();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount);

        const mainAccountNewBalance = await instance.balanceOf(accounts[0]);

        const secondAccountNewBalance = await instance.balanceOf(accounts[1]);

        const fee = transferAmount.muln(3).divn(100);
        const mainAccountFeeShare = fee.muln(500).divn(985);
        const secondAccountFeeShare = fee.muln(485).divn(985);
        const expectedNewMainAccountBalance = mainAccountBalance
            .sub(transferAmount)
            .add(mainAccountFeeShare);
        const expectedSecondAccountBalance = transferAmount
            .sub(fee)
            .add(secondAccountFeeShare);

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
    });

    it('should be able to disable the fee distribution mechanism', async () => {
        const instance = await ARK.new();

        await instance.disableReflection();

        const mainAccountBalance = await instance.balanceOf(accounts[0]);

        const transferAmount = mainAccountBalance.divn(2);

        await instance.transfer(accounts[1], transferAmount);

        const mainAccountNewBalance = await instance.balanceOf(accounts[0]);

        const secondAccountNewBalance = await instance.balanceOf(accounts[1]);

        assert.equal(
            mainAccountNewBalance.toString(),
            mainAccountBalance.sub(transferAmount).toString(),
            'main account balance',
        );
        assert.equal(
            secondAccountNewBalance.toString(),
            transferAmount.toString(),
            'second account balance',
        );
    });

    it('should not affect previous holders when disabling the distribution mechanism', async () => {
        const instance = await ARK.new();

        const mainAccountBalance1 = await instance.balanceOf(accounts[0]);

        const transferAmount1 = mainAccountBalance1.divn(2);

        await instance.transfer(accounts[1], transferAmount1);

        const fee = transferAmount1.muln(3).divn(100);
        const mainAccountFeeShare = fee.muln(500).divn(985);
        const secondAccountFeeShare = fee.muln(485).divn(985);
        const expectedNewMainAccountBalance = mainAccountBalance1
            .sub(transferAmount1)
            .add(mainAccountFeeShare);
        const expectedSecondAccountBalance = transferAmount1
            .sub(fee)
            .add(secondAccountFeeShare);

        await instance.disableReflection();

        const newTransferAmount = transferAmount1.divn(2);

        await instance.transfer(accounts[1], newTransferAmount);

        const mainAccountBalance2 = await instance.balanceOf(accounts[0]);

        const secondAccountBalance2 = await instance.balanceOf(accounts[1]);

        assert.equal(
            mainAccountBalance2.toString(),
            expectedNewMainAccountBalance.sub(newTransferAmount).toString(),
            'main account balance',
        );
        assert.equal(
            expectedSecondAccountBalance.add(newTransferAmount).toString(),
            secondAccountBalance2.toString(),
            'second account balance',
        );
    });

    it('should not be able to disable the distribution mechanism if now the owner', async () => {
        let hasFailed = false;

        const instance = await ARK.new();

        try {
            await instance.disableReflection({ from: accounts[1] });
        } catch (e) {
            hasFailed = true;
        }

        assert.isTrue(hasFailed, 'disable reflection failure');
    });
});
