import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("CertificateRegistry", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();
    const certificateRegistry = await ethers.deployContract("CertificateRegistry");
    await certificateRegistry.waitForDeployment();

    return { certificateRegistry, owner };
  }

  it("stores and verifies a certificate hash", async function () {
    const { certificateRegistry, owner } = await networkHelpers.loadFixture(deployFixture);
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("cert-001"));

    await expect(certificateRegistry.issueCertificate(certificateHash))
      .to.emit(certificateRegistry, "CertificateIssued")
      .withArgs(certificateHash, 1n, owner.address);

    const [valid, record] = await certificateRegistry.verifyCertificate(certificateHash);
    expect(valid).to.equal(true);
    expect(record.certificateHash).to.equal(certificateHash);
    expect(record.issuer).to.equal(owner.address);
    expect(record.revoked).to.equal(false);
  });

  it("prevents duplicate certificate issuance", async function () {
    const { certificateRegistry } = await networkHelpers.loadFixture(deployFixture);
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("cert-duplicate"));

    await certificateRegistry.issueCertificate(certificateHash);

    await expect(certificateRegistry.issueCertificate(certificateHash)).to.be.revertedWithCustomError(
      certificateRegistry,
      "CertificateAlreadyExists"
    );
  });

  it("allows the owner to revoke a certificate", async function () {
    const { certificateRegistry, owner } = await networkHelpers.loadFixture(deployFixture);
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("cert-revoke"));

    await certificateRegistry.issueCertificate(certificateHash);
    await expect(certificateRegistry.revokeCertificate(certificateHash))
      .to.emit(certificateRegistry, "CertificateRevoked")
      .withArgs(certificateHash, 1n, owner.address);

    const [valid, record] = await certificateRegistry.verifyCertificate(certificateHash);
    expect(valid).to.equal(false);
    expect(record.revoked).to.equal(true);
  });

  it("rejects empty hashes", async function () {
    const { certificateRegistry } = await networkHelpers.loadFixture(deployFixture);

    await expect(certificateRegistry.issueCertificate(ethers.ZeroHash)).to.be.revertedWithCustomError(
      certificateRegistry,
      "InvalidCertificateHash"
    );
  });
});
