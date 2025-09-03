// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.29;

contract Delegate {
    function deploy() external pure {}

    function echo(string memory message) external pure returns (string memory) {
        return message;
    }
}
