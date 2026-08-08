// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Multi-tenant Certificate Registry interface.
 * Each institution has its own authorized issuer wallets registered via institutionId.
 */
interface ICertificateRegistry {
    struct CertificateRecord {
        bytes32 certificateHash;
        bytes32 institutionId;   // institution this cert belongs to
        address issuer;          // wallet that signed the on-chain transaction
        uint64 issuedAt;
        uint64 revokedAt;
        bool revoked;
        bool exists;
    }

    /**
     * @param certificateHash SHA-256 hash of the certificate fingerprint
     * @param institutionId   bytes32 identifier of the issuing institution
     */
    function issueCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        returns (uint256 certificateId);

    /**
     * @param certificateHash SHA-256 hash of the certificate fingerprint
     * @param institutionId   bytes32 identifier of the issuing institution
     */
    function revokeCertificate(bytes32 certificateHash, bytes32 institutionId) external;

    /**
     * @param certificateHash SHA-256 hash of the certificate fingerprint
     * @param institutionId   bytes32 identifier of the issuing institution
     */
    function getCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        view
        returns (CertificateRecord memory record);

    /**
     * @param certificateHash SHA-256 hash of the certificate fingerprint
     * @param institutionId   bytes32 identifier of the issuing institution
     */
    function verifyCertificate(bytes32 certificateHash, bytes32 institutionId)
        external
        view
        returns (bool valid, CertificateRecord memory record);

    /**
     * Registers an institution and its authorized issuer wallet.
     * Only the contract owner can call this.
     */
    function registerInstitution(bytes32 institutionId, address issuerWallet) external;

    /**
     * Returns whether a wallet is authorized to issue/revoke for an institution.
     */
    function isAuthorizedIssuer(bytes32 institutionId, address issuer)
        external
        view
        returns (bool);

    /**
     * Returns the numeric certificateId for a given hash + institution.
     */
    function getCertificateId(bytes32 certificateHash, bytes32 institutionId)
        external
        view
        returns (uint256 certificateId);
}
