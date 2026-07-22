# CertiChain AI

An AI-powered blockchain academic certificate verification system built with React, TypeScript, Express, **MySQL + Sequelize**, and Hardhat.

## Project Structure
- `client/` - React frontend
- `server/` - Express + TypeScript backend with MySQL (Sequelize ORM)
- `blockchain/` - Solidity contracts and Hardhat workspace
- `DOCUMENT_STRUCTURE.md` - proposal and report outline

## Database Setup (MySQL)

1. Install MySQL locally or use Docker:
   ```bash
   # Using Docker
   docker run --name certichain-mysql -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=certichain_db -p 3306:3306 -d mysql:8
   ```

2. Update `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=certichain_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   ```

## How To Start The Project
1. Install dependencies in each workspace.
2. Start MySQL and configure `.env` credentials.
3. Start the blockchain workspace first if you want local contract testing.
4. Run the backend server (auto-syncs MySQL tables).
5. Run the frontend client.
6. Connect the frontend to the backend and blockchain as the project grows.

## Start Commands
### Blockchain
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

To run a local Hardhat node:
```bash
npx hardhat node
```

### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Blockchain Workflow
1. Write or update the Solidity contract.
2. Compile the contract locally.
3. Run the contract tests on Hardhat.
4. Deploy to the local Hardhat node if needed.
5. Move to Sepolia only after the local flow is stable.

## Notes
- Update the relevant README files whenever the code structure or startup process changes.
- Keep Sepolia deployment as the final stage after local testing passes.
