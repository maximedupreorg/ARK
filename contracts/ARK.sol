// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ARK is ERC20 {
    mapping(address => uint256) private _accountsLastTotalDividendsMapping;
    uint256 private _totalDividends;

    constructor() ERC20('Arkitects', 'ARK') {
        _mint(msg.sender, 1500000000 * 10**decimals());
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        uint256 transferredAmount = (amount * 95) / 100;
        _totalDividends += (amount * 5) / 100;

        return super.transfer(recipient, transferredAmount);
    }
}
