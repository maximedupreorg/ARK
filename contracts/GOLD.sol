// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import './Base.sol';

contract GOLD is Base('Gold', 'GOLD', 10 * 10**6 * 10**9) {
    using SafeMath for uint256;

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tAmount
    ) internal override {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tAmount);
        (uint256 rFeeRedistributed, uint256 tFeeRedistributed) =
            _getFeeRedistributed(rFee, tFee);
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rTransferAmount);
        _rOwned[address(0)] = _rOwned[address(0)].add(
            rFee.sub(rFeeRedistributed)
        );
        _tOwned[address(0)] = _tOwned[address(0)].add(
            tFee.sub(tFeeRedistributed)
        );

        _reflectFee(rFeeRedistributed, tFeeRedistributed);

        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tAmount
    ) internal override {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tAmount);
        (uint256 rFeeRedistributed, uint256 tFeeRedistributed) =
            _getFeeRedistributed(rFee, tFee);
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rTransferAmount);
        _rOwned[address(0)] = _rOwned[address(0)].add(
            rFee.sub(rFeeRedistributed)
        );
        _tOwned[address(0)] = _tOwned[address(0)].add(
            tFee.sub(tFeeRedistributed)
        );

        _reflectFee(rFeeRedistributed, tFeeRedistributed);

        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _getFeeRedistributed(uint256 rFee, uint256 tFee)
        private
        pure
        returns (uint256, uint256)
    {
        uint256 rFeeRedistributed = rFee.div(5);
        uint256 tFeeRedistributed = tFee.div(5);

        return (rFeeRedistributed, tFeeRedistributed);
    }
}
