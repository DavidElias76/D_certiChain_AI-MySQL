// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ICertificateRegistry.sol";

/**
 * Multi-tenant Certificate Registry.

 * Architecture:
 * - The contract owner registers institutions and their authorized issuer wallets -The system admin will be incharge of registering the institutions.
 * - Only a registered issuer wallet may issue or revoke certificates for its institution.
 * - certificateHash + institutionId together form a globally unique key.
 * - Any caller (employer, student, etc.) can verify any certificate by hash + institutionId.
 */
contract CertificateRegistry is ICertificateRegistry {

    address public owner;

    /// institutionId → authorized issuer wallet address
    mapping(bytes32 => address) public institutionIssuers;

    /// (certificateHash, institutionId) → CertificateRecord
    mapping(bytes32 => mapping(bytes32 => CertificateRecord)) private certificates;

    /// institutionId → sequential counter
    mapping(bytes32 => uint256) private institutionCertCount;

    /// (certificateHash, institutionId) → numeric certificateId
    mapping(bytes32 => mapping(bytes32 => uint256)) private certificateIds;

    uint256 public totalIssued; // overall platform counter

    // ── Events
    event CertificateIssued(
        bytes32 indexed certificateHash,
        bytes32 indexed institutionId,
        uint256 indexed certificateId,
        address issuer
    );
    event CertificateRevoked(
        bytes32 indexed certificateHash,
        bytes32 indexed institutionId,
        uint256 indexed certificateId,
        address issuer
    );
    event InstitutionRegistered(
        bytes32 indexed institutionId,
        address indexed issuerWallet
    );

    error NotOwner();
    error NotAuthorizedIssuer(bytes32 institutionId, address issuer);
    error InstitutionNotRegistered(bytes32 institutionId);
    error CertificateAlreadyExists(bytes32 certificateHash, bytes32 institutionId);
    error CertificateNotFound(bytes32 certificateHash, bytes32 institutionId);
    error CertificateAlreadyRevoked(bytes32 certificateHash, bytes32 institutionId);
    error InvalidCertificateHash();
    error InvalidInstitutionId();

    // Modifiers - for the owner of the contract
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /**
     * Ensures the caller is the registered issuer for the given institution
     - This checks if the institution is registred in blockchain .
     */
    modifier onlyAuthorizedIssuer(bytes32 institutionId) {
        if (institutionIssuers[institutionId] == address(0)) {
            revert InstitutionNotRegistered(institutionId); // if 0 not registered
        }
        if (institutionIssuers[institutionId] != msg.sender) {
            revert NotAuthorizedIssuer(institutionId, msg.sender);
        }
        _;
    }

    // ── Constructor
    constructor() {
        owner = msg.sender;
    }

    //  Owner: Institution Management 
    /**
     * Registers an institution with its authorized issuer wallet.
     * Can only be called by the contract owner (you, the CertiChain platform).
     */
    function registerInstitution(bytes32 institutionId, address issuerWallet)
        external
        onlyOwner
    {
        if (institutionId == bytes32(0)) revert InvalidInstitutionId();
        if (issuerWallet == address(0)) revert NotAuthorizedIssuer(institutionId, issuerWallet);

        institutionIssuers[institutionId] = issuerWallet;

        emit InstitutionRegistered(institutionId, issuerWallet);
    }

    // Authorized Issuer: Certificate Operations 

    /**
     * Issues a certificate on-chain.
     * Rejects empty hashes and prevents duplicate issuance.
     */
    function issueCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        onlyAuthorizedIssuer(institutionId)
        returns (uint256 certificateId)
    {
        if (certificateHash == bytes32(0)) revert InvalidCertificateHash();
        if (institutionId == bytes32(0)) revert InvalidInstitutionId();

        CertificateRecord storage existing = certificates[certificateHash][institutionId];
        if (existing.exists) {
            revert CertificateAlreadyExists(certificateHash, institutionId);
        }

        institutionCertCount[institutionId] += 1;
        certificateId = institutionCertCount[institutionId];
        totalIssued += 1;

        certificates[certificateHash][institutionId] = CertificateRecord({
            certificateHash: certificateHash,
            institutionId: institutionId,
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            revokedAt: 0,
            revoked: false,
            exists: true
        });

        certificateIds[certificateHash][institutionId] = certificateId;

        emit CertificateIssued(certificateHash, institutionId, certificateId, msg.sender);
    }

    /**
     * Revokes a certificate. Cannot be revoked twice.
     */
    function revokeCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        onlyAuthorizedIssuer(institutionId)
    {
        CertificateRecord storage record = certificates[certificateHash][institutionId];
        if (!record.exists) {
            revert CertificateNotFound(certificateHash, institutionId);
        }
        if (record.revoked) {
            revert CertificateAlreadyRevoked(certificateHash, institutionId);
        }

        record.revoked = true;
        record.revokedAt = uint64(block.timestamp);

        emit CertificateRevoked(
            certificateHash,
            institutionId,
            certificateIds[certificateHash][institutionId],
            msg.sender
        );
    }

    // Public Read-Only 

    /**
     * Returns the full certificate record. Reverts if not found.
     * Open to anyone — verification is permissionless.
     */
    function getCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        view
        returns (CertificateRecord memory record)
    {
        record = certificates[certificateHash][institutionId];
        if (!record.exists) {
            revert CertificateNotFound(certificateHash, institutionId);
        }
    }

    /**
     * Verifies if a certificate is valid (exists and not revoked).
     * Open to anyone — the core verification entrypoint for employers/students.
     */
    function verifyCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        view
        returns (bool valid, CertificateRecord memory record)
    {
        record = certificates[certificateHash][institutionId];
        valid = record.exists && !record.revoked;
    }

    /**
     * Checks if a wallet is authorized to issue/revoke for an institution.
     */
    function isAuthorizedIssuer(bytes32 institutionId, address issuer)
        external
        view
        returns (bool)
    {
        return institutionIssuers[institutionId] == issuer;
    }

    /**
     * Returns the numeric certificateId for a given hash + institution.
     */
    function getCertificateId(bytes32 certificateHash, bytes32 institutionId)
        external
        view
        returns (uint256 certificateId)
    {
        certificateId = certificateIds[certificateHash][institutionId];
        if (certificateId == 0) {
            revert CertificateNotFound(certificateHash, institutionId);
        }
    }
}
