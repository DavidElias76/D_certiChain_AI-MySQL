
// NOTE: The test function needs to be written again and make sure that they are working by running the npm run hardhat test


// import { expect } from "chai";
// import { network } from "hardhat";

// /**
//  * Test suite for the multi-tenant CertificateRegistry.
//  *
//  * Contract API (must match contracts/CertificateRegistry.sol):
//  *   registerInstitution(bytes32 institutionId, address issuerWallet)   — owner only
//  *   issueCertificate(bytes32 certificateHash, bytes32 institutionId)   — authorized issuer only
//  *   revokeCertificate(bytes32 certificateHash, bytes32 institutionId)  — authorized issuer only
//  *   verifyCertificate(bytes32 certificateHash, bytes32 institutionId)  — view -> (bool, record)
//  *   getCertificate(bytes32 certificateHash, bytes32 institutionId)     — view -> record
//  *   getCertificateId(bytes32 certificateHash, bytes32 institutionId)   — view -> uint256
//  *   isAuthorizedIssuer(bytes32 institutionId, address issuer)          — view -> bool
//  *
//  * NOTE: certificateHash + institutionId together form the unique key. Each institution
//  * keeps its own sequential certificateId counter starting at 1.
//  */
// const { ethers, networkHelpers } = await network.create();

// // ─── Helpers ────────────────────────────────────────────────────────────────

// /** Derive a deterministic bytes32 id from a human-readable string. */
// function id(text: string): string {
//   return ethers.id(text); // keccak256 of the UTF-8 bytes, returns a 0x-prefixed bytes32
// }

// /** Derive a certificate hash from a label (simulates a SHA-256 fingerprint). */
// function certHash(label: string): string {
//   return ethers.id(label);
// }

// // ─── Shared fixture ─────────────────────────────────────────────────────────
// //
// // Sets up the most common state used across tests:
// //   - owner:            the deployer (the only account that can register institutions)
// //   - issuer:           the wallet authorised to issue/revoke for "KCA University"
// //   - attacker:         an unrelated account that must NOT be able to act
// //   - registry:         the deployed CertificateRegistry
// //   - institutionId:    bytes32 id for "KCA University"
// //   - The institution is ALREADY REGISTERED and bound to `issuer`.
// async function deployAndRegisterFixture() {
//   const [owner, issuer, attacker] = await ethers.getSigners();

//   const registry = await ethers.deployContract("CertificateRegistry");
//   await registry.waitForDeployment();

//   const institutionId = id("KCA-UNIVERSITY");

//   // Owner registers the institution and binds it to the issuer wallet.
//   await expect(registry.registerInstitution(institutionId, issuer.address))
//     .to.emit(registry, "InstitutionRegistered")
//     .withArgs(institutionId, issuer.address);

//   return { registry, owner, issuer, attacker, institutionId };
// }

// // ─── Tests ──────────────────────────────────────────────────────────────────

// describe("CertificateRegistry", function () {
//   describe("registerInstitution", function () {
//     it("lets the owner register an institution and emits InstitutionRegistered", async function () {
//       const { registry, issuer } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       // Already registered in the fixture — sanity check the binding instead.
//       expect(await registry.isAuthorizedIssuer(id("KCA-UNIVERSITY"), issuer.address)).to.equal(true);
//     });

//     it("reverts when a non-owner tries to register an institution", async function () {
//       const { registry, issuer, attacker } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.connect(attacker).registerInstitution(id("ATTACKER-INST"), attacker.address)
//       ).to.be.revertedWithCustomError(registry, "NotOwner");
//     });

//     it("reverts when the institutionId is zero", async function () {
//       const { registry, issuer } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.registerInstitution(ethers.ZeroHash, issuer.address)
//       ).to.be.revertedWithCustomError(registry, "InvalidInstitutionId");
//     });

//     it("reverts when the issuer wallet is the zero address", async function () {
//       const { registry } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.registerInstitution(id("BAD-WALLET"), ethers.ZeroAddress)
//       ).to.be.revertedWithCustomError(registry, "NotAuthorizedIssuer");
//     });
//   });

//   describe("issueCertificate", function () {
//     it("stores and verifies a certificate hash for the authorised issuer", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("cert-001");

//       await expect(registry.connect(issuer).issueCertificate(hash, institutionId))
//         .to.emit(registry, "CertificateIssued")
//         .withArgs(hash, institutionId, 1n, issuer.address);

//       const [valid, record] = await registry.verifyCertificate(hash, institutionId);
//       expect(valid).to.equal(true);
//       expect(record.certificateHash).to.equal(hash);
//       expect(record.institutionId).to.equal(institutionId);
//       expect(record.issuer).to.equal(issuer.address);
//       expect(record.revoked).to.equal(false);
//       expect(record.exists).to.equal(true);

//       // The first certificate for an institution gets id 1.
//       expect(await registry.getCertificateId(hash, institutionId)).to.equal(1n);
//       // The platform-wide counter reflects the issuance.
//       expect(await registry.totalIssued()).to.equal(1n);
//     });

//     it("assigns sequential certificateIds per institution", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       const h1 = certHash("seq-1");
//       const h2 = certHash("seq-2");
//       const h3 = certHash("seq-3");

//       await expect(registry.connect(issuer).issueCertificate(h1, institutionId))
//         .to.emit(registry, "CertificateIssued").withArgs(h1, institutionId, 1n, issuer.address);
//       await expect(registry.connect(issuer).issueCertificate(h2, institutionId))
//         .to.emit(registry, "CertificateIssued").withArgs(h2, institutionId, 2n, issuer.address);
//       await expect(registry.connect(issuer).issueCertificate(h3, institutionId))
//         .to.emit(registry, "CertificateIssued").withArgs(h3, institutionId, 3n, issuer.address);

//       expect(await registry.getCertificateId(h3, institutionId)).to.equal(3n);
//       expect(await registry.totalIssued()).to.equal(3n);
//     });

//     it("prevents duplicate certificate issuance for the same institution", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("cert-duplicate");

//       await registry.connect(issuer).issueCertificate(hash, institutionId);

//       await expect(
//         registry.connect(issuer).issueCertificate(hash, institutionId)
//       ).to.be.revertedWithCustomError(registry, "CertificateAlreadyExists");
//     });

//     it("allows the same hash under a DIFFERENT institution (multi-tenant isolation)", async function () {
//       const { registry, owner, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("shared-cert");

//       // Issue under the first institution.
//       await registry.connect(issuer).issueCertificate(hash, institutionId);

//       // Register a second institution with the owner as its issuer, then issue the same hash.
//       const secondInst = id("UON-UNIVERSITY");
//       await registry.connect(owner).registerInstitution(secondInst, owner.address);
//       await expect(registry.connect(owner).issueCertificate(hash, secondInst))
//         .to.emit(registry, "CertificateIssued").withArgs(hash, secondInst, 1n, owner.address);

//       // Both records exist independently.
//       const [, rec1] = await registry.verifyCertificate(hash, institutionId);
//       const [, rec2] = await registry.verifyCertificate(hash, secondInst);
//       expect(rec1.institutionId).to.equal(institutionId);
//       expect(rec2.institutionId).to.equal(secondInst);
//     });

//     it("rejects issuance from a wallet that is not the registered issuer", async function () {
//       const { registry, attacker, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.connect(attacker).issueCertificate(certHash("attacker-cert"), institutionId)
//       ).to.be.revertedWithCustomError(registry, "NotAuthorizedIssuer");
//     });

//     it("reverts when issuing for an unregistered institution", async function () {
//       const { registry, issuer } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.connect(issuer).issueCertificate(certHash("ghost-cert"), id("UNREGISTERED"))
//       ).to.be.revertedWithCustomError(registry, "InstitutionNotRegistered");
//     });

//     it("rejects empty (zero) certificate hashes", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.connect(issuer).issueCertificate(ethers.ZeroHash, institutionId)
//       ).to.be.revertedWithCustomError(registry, "InvalidCertificateHash");
//     });

//     it("rejects a zero institutionId even for the owner", async function () {
//       const { registry, issuer } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       // The institution is not registered at bytes32(0), so the modifier reverts first.
//       await expect(
//         registry.connect(issuer).issueCertificate(certHash("zero-inst"), ethers.ZeroHash)
//       ).to.be.revertedWithCustomError(registry, "InstitutionNotRegistered");
//     });
//   });

//   describe("revokeCertificate", function () {
//     it("allows the authorised issuer to revoke a certificate", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("cert-revoke");

//       await registry.connect(issuer).issueCertificate(hash, institutionId);

//       await expect(registry.connect(issuer).revokeCertificate(hash, institutionId))
//         .to.emit(registry, "CertificateRevoked")
//         .withArgs(hash, institutionId, 1n, issuer.address);

//       const [valid, record] = await registry.verifyCertificate(hash, institutionId);
//       expect(valid).to.equal(false);
//       expect(record.revoked).to.equal(true);
//       expect(record.exists).to.equal(true);
//       expect(record.revokedAt).to.not.equal(0);
//     });

//     it("cannot revoke a certificate twice", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("cert-revoke-twice");

//       await registry.connect(issuer).issueCertificate(hash, institutionId);
//       await registry.connect(issuer).revokeCertificate(hash, institutionId);

//       await expect(
//         registry.connect(issuer).revokeCertificate(hash, institutionId)
//       ).to.be.revertedWithCustomError(registry, "CertificateAlreadyRevoked");
//     });

//     it("reverts when revoking a non-existent certificate", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.connect(issuer).revokeCertificate(certHash("missing-cert"), institutionId)
//       ).to.be.revertedWithCustomError(registry, "CertificateNotFound");
//     });

//     it("prevents a non-issuer from revoking", async function () {
//       const { registry, issuer, attacker, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("attacker-revoke");

//       await registry.connect(issuer).issueCertificate(hash, institutionId);

//       await expect(
//         registry.connect(attacker).revokeCertificate(hash, institutionId)
//       ).to.be.revertedWithCustomError(registry, "NotAuthorizedIssuer");
//     });
//   });

//   describe("read helpers", function () {
//     it("getCertificate returns the full record for an issued certificate", async function () {
//       const { registry, issuer, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);
//       const hash = certHash("read-cert");

//       await registry.connect(issuer).issueCertificate(hash, institutionId);

//       const record = await registry.getCertificate(hash, institutionId);
//       expect(record.certificateHash).to.equal(hash);
//       expect(record.institutionId).to.equal(institutionId);
//       expect(record.issuer).to.equal(issuer.address);
//       expect(record.revoked).to.equal(false);
//       expect(record.exists).to.equal(true);
//     });

//     it("getCertificate reverts for a missing certificate", async function () {
//       const { registry, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.getCertificate(certHash("nope"), institutionId)
//       ).to.be.revertedWithCustomError(registry, "CertificateNotFound");
//     });

//     it("getCertificateId reverts when the certificateId is 0 (not found)", async function () {
//       const { registry, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       await expect(
//         registry.getCertificateId(certHash("never-issued"), institutionId)
//       ).to.be.revertedWithCustomError(registry, "CertificateNotFound");
//     });

//     it("verifyCertificate returns (false, empty record) for an unknown hash", async function () {
//       const { registry, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       const [valid, record] = await registry.verifyCertificate(certHash("unknown"), institutionId);
//       expect(valid).to.equal(false);
//       expect(record.exists).to.equal(false);
//     });

//     it("isAuthorizedIssuer distinguishes the bound wallet from others", async function () {
//       const { registry, issuer, attacker, institutionId } = await networkHelpers.loadFixture(deployAndRegisterFixture);

//       expect(await registry.isAuthorizedIssuer(institutionId, issuer.address)).to.equal(true);
//       expect(await registry.isAuthorizedIssuer(institutionId, attacker.address)).to.equal(false);
//     });
//   });
// });
