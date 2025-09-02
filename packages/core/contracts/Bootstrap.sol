// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.29;

import {Factory} from "./Factory.sol";

/// @title Permissionless CREATE2 Bootstrap Contract
/// @dev This contract is the EIP-7702 delegation target for the designated
///      deployer account used to bootstrap the deployment of the permissionless
///      CREATE2 factory.
contract Bootstrap {
    bytes32 private immutable _DELEGATION;

    error InvalidDelegation();
    error CreationFailed();

    constructor() {
        bytes32 delegation;
        assembly ("memory-safe") {
            mstore(0x14, address())
            mstore(0x00, 0xef0100)
            delegation := keccak256(0x1d, 0x17)
        }

        _DELEGATION = delegation;
    }

    /// @notice Deploy the CREATE2 factory contract.
    function deploy() external {
        if (Factory.ADDRESS.codehash == Factory.CODEHASH) {
            return;
        }

        require(Factory.DEPLOYER.codehash == _DELEGATION, InvalidDelegation());
        Bootstrap(Factory.DEPLOYER).bootstrap();
    }

    /// @notice Bootstrap the CREATE2 factory contract deployment.
    /// @dev This must be called from {Factory.DEPLOYER} using an EIP-7702
    ///      delegation to this contract.
    function bootstrap() external {
        bytes memory code = Factory.INITCODE;
        bytes32 salt = Factory.SALT;

        address factory;
        assembly ("memory-safe") {
            factory := create2(0, add(code, 0x20), mload(code), salt)
        }

        require(factory == Factory.ADDRESS, CreationFailed());
    }
}
