/*
 * Copyright © 2020 reflect.finance. ALL RIGHTS RESERVED.
 */

pragma solidity 0.8.4;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract REFLECTCustom is Context, IERC20, Ownable {
    using SafeMath for uint256;
    using Address for address;

    mapping(address => uint256) public _reflectionsOwned;
    mapping(address => uint256) public _tokensOwned;
    mapping(address => mapping(address => uint256)) private _allowances;

    mapping(address => bool) private _isExcluded;
    address[] private _excluded;

    uint256 public constant MAX = ~uint256(0);
    uint256 public constant MAXmod = MAX % _totalSupplyOfToken;
    uint256 public constant _totalSupplyOfToken = 10 * 10**6 * 10**9;
    uint256 public _totalReflections = (MAX - (MAX % _totalSupplyOfToken));
    uint256 public _tokensFeeTotal;

    string private _name = 'reflect.finance';
    string private _symbol = 'RFI';
    uint8 private _decimals = 9;

    constructor() public {
        _reflectionsOwned[_msgSender()] = _totalReflections;
        emit Transfer(address(0), _msgSender(), _totalSupplyOfToken);
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
        return _totalSupplyOfToken;
    }

    ////////////////////
    ////////////////////
    ////////////////////
    ////////////////////
    ////////////////////

    function balanceOf(address account) public view override returns (uint256) {
        if (_isExcluded[account]) return _tokensOwned[account];
        return tokenFromReflection(_reflectionsOwned[account]);
    }

    function tokenFromReflection(uint256 reflectionAmount)
        public
        view
        returns (uint256)
    {
        require(
            reflectionAmount <= _totalReflections,
            'Amount must be less than total reflections'
        );

        uint256 currentRate = _getRate();

        return reflectionAmount.div(currentRate);
    }

    function _getRate() public view returns (uint256) {
        (uint256 reflectionSupply, uint256 tokenSupply) = _getCurrentSupply();

        return reflectionSupply.div(tokenSupply);
    }

    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 reflectionSupply = _totalReflections;
        uint256 tokenSupply = _totalSupplyOfToken;

        for (uint256 i = 0; i < _excluded.length; i++) {
            if (
                _reflectionsOwned[_excluded[i]] > reflectionSupply ||
                _tokensOwned[_excluded[i]] > tokenSupply
            ) {
                return (_totalReflections, _totalSupplyOfToken);
            }

            reflectionSupply = reflectionSupply.sub(
                _reflectionsOwned[_excluded[i]]
            );
            tokenSupply = tokenSupply.sub(_tokensOwned[_excluded[i]]);
        }

        if (reflectionSupply < _totalReflections.div(_totalSupplyOfToken)) {
            return (_totalReflections, _totalSupplyOfToken);
        }

        return (reflectionSupply, tokenSupply);
    }

    ////////////////////
    ////////////////////
    ////////////////////
    ////////////////////
    ////////////////////

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) private {
        require(sender != address(0), 'ERC20: transfer from the zero address');
        require(recipient != address(0), 'ERC20: transfer to the zero address');
        require(amount > 0, 'Transfer amount must be greater than zero');
        if (_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferFromExcluded(sender, recipient, amount);
        } else if (!_isExcluded[sender] && _isExcluded[recipient]) {
            _transferToExcluded(sender, recipient, amount);
        } else if (!_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferStandard(sender, recipient, amount);
        } else if (_isExcluded[sender] && _isExcluded[recipient]) {
            _transferBothExcluded(sender, recipient, amount);
        } else {
            _transferStandard(sender, recipient, amount);
        }
    }

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tAmount
    ) private {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tAmount);
        _reflectionsOwned[sender] = _reflectionsOwned[sender].sub(rAmount);
        _reflectionsOwned[recipient] = _reflectionsOwned[recipient].add(
            rTransferAmount
        );
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _getValues(uint256 tAmount)
        private
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        (uint256 tTransferAmount, uint256 tFee) = _getTValues(tAmount);
        uint256 currentRate = _getRate();
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee) =
            _getRValues(tAmount, tFee, currentRate);
        return (rAmount, rTransferAmount, rFee, tTransferAmount, tFee);
    }

    function _getTValues(uint256 tAmount)
        private
        pure
        returns (uint256, uint256)
    {
        uint256 tFee = tAmount.div(100);
        uint256 tTransferAmount = tAmount.sub(tFee);
        return (tTransferAmount, tFee);
    }

    function _getRValues(
        uint256 tAmount,
        uint256 tFee,
        uint256 currentRate
    )
        private
        pure
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 rAmount = tAmount.mul(currentRate);
        uint256 rFee = tFee.mul(currentRate);
        uint256 rTransferAmount = rAmount.sub(rFee);
        return (rAmount, rTransferAmount, rFee);
    }

    function _reflectFee(uint256 rFee, uint256 tFee) private {
        _totalReflections = _totalReflections.sub(rFee);
        _tokensFeeTotal = _tokensFeeTotal.add(tFee);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tAmount
    ) private {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tAmount);
        _reflectionsOwned[sender] = _reflectionsOwned[sender].sub(rAmount);
        _tokensOwned[recipient] = _tokensOwned[recipient].add(tTransferAmount);
        _reflectionsOwned[recipient] = _reflectionsOwned[recipient].add(
            rTransferAmount
        );
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferFromExcluded(
        address sender,
        address recipient,
        uint256 tAmount
    ) private {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tAmount);
        _tokensOwned[sender] = _tokensOwned[sender].sub(tAmount);
        _reflectionsOwned[sender] = _reflectionsOwned[sender].sub(rAmount);
        _reflectionsOwned[recipient] = _reflectionsOwned[recipient].add(
            rTransferAmount
        );
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferBothExcluded(
        address sender,
        address recipient,
        uint256 tAmount
    ) private {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tAmount);
        _tokensOwned[sender] = _tokensOwned[sender].sub(tAmount);
        _reflectionsOwned[sender] = _reflectionsOwned[sender].sub(rAmount);
        _tokensOwned[recipient] = _tokensOwned[recipient].add(tTransferAmount);
        _reflectionsOwned[recipient] = _reflectionsOwned[recipient].add(
            rTransferAmount
        );
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    ////////////////////
    ////////////////////
    ////////////////////
    ////////////////////
    ////////////////////

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(
            sender,
            _msgSender(),
            _allowances[sender][_msgSender()].sub(
                amount,
                'ERC20: transfer amount exceeds allowance'
            )
        );
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].add(addedValue)
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].sub(
                subtractedValue,
                'ERC20: decreased allowance below zero'
            )
        );
        return true;
    }

    function isExcluded(address account) public view returns (bool) {
        return _isExcluded[account];
    }

    function totalFees() public view returns (uint256) {
        return _tokensFeeTotal;
    }

    function reflect(uint256 tAmount) public {
        address sender = _msgSender();
        require(
            !_isExcluded[sender],
            'Excluded addresses cannot call this function'
        );
        (uint256 rAmount, , , , ) = _getValues(tAmount);
        _reflectionsOwned[sender] = _reflectionsOwned[sender].sub(rAmount);
        _totalReflections = _totalReflections.sub(rAmount);
        _tokensFeeTotal = _tokensFeeTotal.add(tAmount);
    }

    function reflectionFromToken(uint256 tAmount, bool deductTransferFee)
        public
        view
        returns (uint256)
    {
        require(
            tAmount <= _totalSupplyOfToken,
            'Amount must be less than supply'
        );
        if (!deductTransferFee) {
            (uint256 rAmount, , , , ) = _getValues(tAmount);
            return rAmount;
        } else {
            (, uint256 rTransferAmount, , , ) = _getValues(tAmount);
            return rTransferAmount;
        }
    }

    function excludeAccount(address account) external onlyOwner() {
        require(!_isExcluded[account], 'Account is already excluded');
        if (_reflectionsOwned[account] > 0) {
            _tokensOwned[account] = tokenFromReflection(
                _reflectionsOwned[account]
            );
        }
        _isExcluded[account] = true;
        _excluded.push(account);
    }

    function includeAccount(address account) external onlyOwner() {
        require(_isExcluded[account], 'Account is already excluded');
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_excluded[i] == account) {
                _excluded[i] = _excluded[_excluded.length - 1];
                _tokensOwned[account] = 0;
                _isExcluded[account] = false;
                _excluded.pop();
                break;
            }
        }
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) private {
        require(owner != address(0), 'ERC20: approve from the zero address');
        require(spender != address(0), 'ERC20: approve to the zero address');

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
