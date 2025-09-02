// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.29;

contract Revert {
    constructor() {
        revert("all your base are belong to us");
    }
}
