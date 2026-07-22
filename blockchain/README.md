# Blockchain Layer

This folder contains the Solidity smart contracts and related blockchain assets for CertiChain AI.

## Proposed Layout
- `contracts/CertificateRegistry.sol` - core certificate issuance, verification and revocation contract
- `contracts/interfaces/ICertificateRegistry.sol` - optional interface for backend integration
- `scripts/deploy.ts` - deployment script for local and test networks
- `test/CertificateRegistry.test.ts` - contract tests
- `hardhat.config.ts` - blockchain development configuration
- `package.json` - Hardhat workspace scripts and tooling
- `.env.example` - sample environment variables for Sepolia deployment
- `.gitigonre` - ignored files eg node_modules
- `tsconfig.json` - types config files

## Current Contract Goals
- Store certificate hashes immutably on-chain
- Prevent duplicate issuance of the same certificate hash
- Allow verification of issued certificates
- Support certificate revocation by the authorized issuer
- Emit events for auditability

## Getting Started
1. Open a terminal in this folder.
2. Install dependencies with `npm install`.
3. Compile the contracts with `npx hardhat compile`.
4. Run tests with `npx hardhat test`.
5. Start a local blockchain node with `npx hardhat node`.
6. Deploy locally with `npx hardhat run scripts/deploy.ts --network localhost`.

## Required Test Packages
Install the Hardhat 3 Mocha/Ethers test stack before running TypeScript tests:
```bash
npm install --save-dev @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-ethers-chai-matchers @nomicfoundation/hardhat-mocha @nomicfoundation/hardhat-network-helpers chai @types/chai mocha @types/mocha
```

## Hardhat Version Note
- This workspace is aligned to Hardhat 3.
- The config uses the Hardhat 3 network format, including `edr-simulated` for `hardhat` and `http` for `localhost` and `sepolia`.
- Sepolia deployment stays at the end of the project after local compilation and tests are stable.

## Test File Setup
- TypeScript tests use `network.create()` at the top of the file.
- Contract deployment in tests uses `ethers.deployContract(...)`.
- Reusable setup should live inside a named fixture function and be reused with `networkHelpers.loadFixture(...)`.
- The Mocha runner is provided by `@nomicfoundation/hardhat-mocha`.

## Sepolia Setup
1. Add your `SEPOLIA_RPC_URL` as a Hardhat configuration variable.
2. Add your `PRIVATE_KEY` as a Hardhat configuration variable.
3. Confirm the contract compiles locally before deploying.
4. Deploy with `npx hardhat run scripts/deploy.ts --network sepolia`.

Example setup commands:
```bash
npx hardhat vars set SEPOLIA_RPC_URL
npx hardhat vars set PRIVATE_KEY
```

## Keep This File Updated
- Update this README whenever contract structure, test flow, deployment steps, or package requirements change.
