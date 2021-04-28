// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ARKToken is ERC20 {
    constructor() ERC20('Arkitects', 'ARK') {
        _mint(msg.sender, 1500000000);
    }
}
