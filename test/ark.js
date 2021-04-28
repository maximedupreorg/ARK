const ARK = artifacts.require('ARK');

contract('ARK', accounts => {
    let instance;

    it('should be able to deploy an instance', async () => {
        await ARK.deployed();

        return assert.isTrue(true);
    });
});
