// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract ARK is Context, IERC20, Ownable {
    uint256 private constant MAX = ~uint256(0);
    uint256 private constant _tTotal = 10 * 10**6 * 10**9;

    string private _name = 'The Arkitects';
    string private _symbol = 'ARK';
    uint8 private _decimals = 9;
    uint256 private _rTotal = (MAX - (MAX % _tTotal));
    mapping(address => uint256) private _rOwned;

    constructor() {
        _rOwned[_msgSender()] = _rTotal;

        emit Transfer(address(0), _msgSender(), _tTotal);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }
}
