# CertiChain AI

**CertiChain AI** is a blockchain-based academic certificate verification system with AI-powered career recommendations. The system enables academic institutions to issue digital certificates, allows employers to verify certificate authenticity, and provides students with career recommendations based on their academic qualifications and skills.

The application is built using React, TypeScript, Node.js, Express, MySQL, Sequelize, and Solidity smart contracts.

## Key Features

- **User Authentication and Authorization:** Secure authentication and role-based access control for system administrators, institution administrators, students, and employers.
- **Institution Management:** Registration and management of academic institutions and their authorized administrators.
- **Certificate Management:** Creation, issuance, storage, and management of academic certificates.
- **Blockchain Verification:** Smart contract integration for recording and verifying academic certificate hashes.
- **QR Code Verification:** QR codes that allow employers and other authorized parties to verify certificates.
- **AI-Powered Career Recommendations:** AI-generated career suggestions based on students' academic qualifications, courses, and skills.
- **Employer Portal:** Enables employers to verify academic certificates and access relevant verification information.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Architecture | Monolithic Architecture |
| Database | MySQL |
| ORM | Sequelize |
| Blockchain | Solidity, Hardhat |
| Blockchain Interaction | Ethers.js |
| Wallet Integration | MetaMask |
| AI Integration | OpenAI, Google Gemini |
| Development Blockchain | Hardhat Local Network |
| Testnet | Sepolia |

## Project Architecture

CertiChain AI follows a **Monolithic Architecture**, where the backend functionality is developed and maintained within a single Express application.

The backend is organized into logical modules to separate responsibilities while keeping the application within one deployable backend unit.

### Main Backend Modules

- **Authentication Module:** Handles user registration, login, authentication, and authorization.
- **User Management Module:** Manages user accounts, roles, and profile information.
- **Institution Module:** Handles institution registration and administration.
- **Certificate Module:** Manages academic certificate creation, issuance, and verification.
- **AI Recommendation Module:** Processes academic information and generates career recommendations.
- **Blockchain Module:** Handles smart contract interactions and blockchain-based certificate verification.

### High-Level Architecture

```text
                CERTICHAIN AI
                      |
          +-----------+-----------+
          |                       |
     React Client           Express Server
     (TypeScript)           (Monolithic)
                                  |
                +-----------------+-----------------+
                |                 |                 |
             Auth              User             Institution
             Module            Module             Module
                |                 |                 |
                +-----------------+-----------------+
                                  |
                      +-----------+-----------+
                      |                       |
                  Certificate           AI Recommendation
                    Module                  Module
                      |                       |
                      |                  OpenAI / Gemini
                      |
               Blockchain Module
                      |
                 Ethers.js
                      |
                Solidity Contract
                      |
                Hardhat / Sepolia

                      |
                  Sequelize
                      |
                    MySQL
```

## Project Structure

```text
CertiChain_AI/
│
├── client/                     # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                     # Express monolithic backend
│   ├── src/
│   │   ├── config/             # Application configurations
│   │   ├── controllers/        # Request handling
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Database operations
│   │   ├── models/             # Sequelize models
│   │   ├── routes/             # API routes
│   │   ├── middlewares/        # Authentication and validation
│   │   ├── helpers/            # Reusable helper functions
│   │   ├── utils/              # Shared utilities
│   │   └── app.ts              # Express application setup
│   └── package.json
│
├── blockchain/                 # Smart contracts and Hardhat
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
│
├── DOCUMENT_STRUCTURE.md       # Academic project documentation
└── README.md
```

*The structure above represents the logical organization of the project. Adjust directory names to match the actual implementation.*

## Prerequisites

Before running the application, ensure you have installed:

- Node.js and npm
- MySQL Server 8.0 or later
- Git
- MetaMask browser extension
- Hardhat development environment

## Database Setup (MySQL)

CertiChain AI uses MySQL as its relational database, with Sequelize as the Object Relational Mapping (ORM) tool.

### 1. Create the Database

Log in to MySQL and execute:

```sql
CREATE DATABASE certichain_db;
```

Alternatively, use Docker:

```bash
docker run --name certichain-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=certichain_db \
  -p 3306:3306 \
  -d mysql:8
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=certichain_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here
```

Add other required environment variables for authentication, blockchain connectivity, and AI integrations according to your server configuration.

**Important:** Never commit `.env` files, private keys, API keys, or other sensitive credentials to version control.

## Installation and Setup

Clone the repository:

```bash
git clone <repository-url>
cd CertiChain_AI
```

Install dependencies separately for each project component.

### 1. Blockchain Setup

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

Start the local Hardhat blockchain:

```bash
npx hardhat node
```

Keep this terminal running while testing local blockchain interactions.

### 2. Backend Setup

Open another terminal:

```bash
cd server
npm install
npm run dev
```

The backend connects to MySQL through Sequelize and exposes the API endpoints consumed by the React frontend.

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will start using the development server configuration.

## Blockchain Workflow

CertiChain AI uses Solidity smart contracts to support tamper-resistant academic certificate verification.

The development workflow is:

1. Develop or modify the Solidity smart contracts.
2. Compile contracts using Hardhat.
3. Execute contract tests.
4. Start the local Hardhat blockchain.
5. Deploy contracts to the local development network.
6. Connect the backend to the deployed contracts using Ethers.js.
7. Test certificate issuance and verification.
8. Deploy and test on the Sepolia testnet when local testing is complete.

## AI Integration

The system integrates AI services to generate career recommendations using students' academic information.

Supported AI providers:

- **OpenAI:** Generates career recommendations based on academic qualifications and skills.
- **Google Gemini:** Provides an alternative AI model for generating career-related insights.

The AI Recommendation Module processes relevant student information and communicates with the selected AI provider to generate recommendations.

API credentials and model configurations should be maintained through environment variables.

## Development Guidelines

- Follow the modular organization of the monolithic backend.
- Keep controllers, services, repositories, and models responsible for their respective tasks.
- Use Sequelize for database interactions.
- Keep blockchain interactions within the blockchain-related backend functionality.
- Validate incoming API requests before processing them.
- Apply authentication and role-based authorization to protected endpoints.
- Keep sensitive credentials in environment variables.
- Test smart contracts locally before deploying to Sepolia.
- Maintain consistent error handling and API response structures.

## Future Improvements

Potential improvements include:

- Deployment to a production blockchain network.
- Enhanced certificate verification and audit capabilities.
- Improved AI recommendation accuracy.
- Production deployment and infrastructure optimization.
- Additional security testing and performance optimization.

## License

This project is developed for academic purposes as part of a final-year Business Information Technology project.