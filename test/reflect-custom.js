const REFLECTCustom = artifacts.require('REFLECTCustom');

function numberWithCommas(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

contract('REFLECTCustom', accounts => {
    it('should print out stuff', async () => {
        const instance = await REFLECTCustom.deployed();

        console.log(
            'MAX\n',
            numberWithCommas((await instance.MAX()).toString()),
        );

        console.log(
            'MAXmod\n',
            numberWithCommas((await instance.MAXmod()).toString()),
        );

        console.log(
            '\n_totalSupplyOfToken\n',
            numberWithCommas((await instance._totalSupplyOfToken()).toString()),
        );

        console.log(
            '\n_getRate\n',
            numberWithCommas((await instance._getRate()).toString()),
        );

        await logging();

        console.log('---------------------TRANSFER 1-----------------------');

        let transferAmount = (await instance.balanceOf(accounts[0]))
            .divn(2)
            .toString();

        console.log('\ntransfer amount\n', numberWithCommas(transferAmount));

        await instance.transfer(accounts[1], transferAmount);

        await logging();

        console.log('---------------------TRANSFER 2-----------------------');

        transferAmount = (await instance.balanceOf(accounts[0]))
            .divn(2)
            .toString();

        console.log('\ntransfer amount\n', numberWithCommas(transferAmount));

        await instance.transfer(accounts[1], transferAmount);

        await logging();

        console.log('---------------------TRANSFER 3-----------------------');
        console.log('\ntransfer amount\n', numberWithCommas('1000000'));

        await instance.transfer(accounts[2], 1000000, { from: accounts[1] });

        await logging();

        async function logging() {
            console.log(
                '\n_totalReflections\n',
                numberWithCommas(
                    (await instance._totalReflections()).toString(),
                ),
            );

            console.log(
                '\n_tokensFeeTotal\n',
                numberWithCommas((await instance._tokensFeeTotal()).toString()),
            );

            for (let i = 0; i < 3; i++) {
                console.log(' --> NEW ACCOUNT INFO <--');
                console.log(
                    `\n account #${i + 1} balanceOf\n`,
                    numberWithCommas(
                        (await instance.balanceOf(accounts[i])).toString(),
                    ),
                );

                console.log(
                    `\n account #${i + 1} _reflectionsOwned\n`,
                    numberWithCommas(
                        (
                            await instance._reflectionsOwned(accounts[i])
                        ).toString(),
                    ),
                );

                console.log(
                    `\n account #${i + 1} _tokensOwned\n`,
                    numberWithCommas(
                        (await instance._tokensOwned(accounts[i])).toString(),
                    ),
                );

                // console.log(
                //     `\n account #${i + 1} reflectionFromToken\n`,
                //     numberWithCommas(
                //         (
                //             await instance.reflectionFromToken(
                //                 await instance.balanceOf(accounts[i]),
                //                 true,
                //             )
                //         ).toString(),
                //     ),
                // );
            }
        }
    });
});
