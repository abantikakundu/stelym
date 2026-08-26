# Stelym Quick Setup Guide

This guide walks you through setting up, building, testing, and running the **Stelym** smart contract and Next.js frontend application from scratch.

---

## Table of Contents

1. [Prerequisites & Toolchain Installation](#1-prerequisites--toolchain-installation)
   - [Node.js](#11-nodejs-22)
   - [Rust & Soroban WebAssembly Target](#12-rust--wasm-target)
   - [Stellar CLI](#13-stellar-cli-v25)
   - [Freighter Wallet Extension](#14-freighter-wallet-extension)
2. [Smart Contract Build & Testing](#2-smart-contract-build--testing)
   - [Compiling to WASM](#21-compiling-to-wasm)
   - [Running Contract Unit Tests](#22-running-contract-unit-tests)
3. [Frontend Application Setup](#3-frontend-application-setup)
   - [Installing Dependencies](#31-installing-dependencies)
   - [Running Frontend Unit Tests](#32-running-frontend-unit-tests)
   - [Starting Development Server](#33-starting-development-server)
   - [Building for Production](#34-building-for-production)
4. [Wallet Setup & Testnet Funding](#4-wallet-setup--testnet-funding)
5. [Contract Deployment & Custom Setup (Optional)](#5-contract-deployment--custom-setup-optional)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites & Toolchain Installation

Ensure the following tools are installed on your operating system (macOS, Linux / WSL, or Windows):

### 1.1 Node.js (22+)

Stelym uses Next.js 16 with React 19. Ensure Node.js version 22 or higher is active:

```bash
# Verify Node.js version
node -v
# Output should be v22.x.x or higher

# Verify npm version
npm -v
```

> **Installation Tip**: If you manage multiple Node.js versions, use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm):
> ```bash
> nvm install 22
> nvm use 22
> ```

---

### 1.2 Rust & WASM Target

Install the official Rust toolchain and add the `wasm32v1-none` target used by Soroban:

```bash
# 1. Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Ensure Rust 1.92+ is active
rustup update stable

# 3. Add the Soroban WebAssembly target
rustup target add wasm32v1-none
```

Verify your installed targets:
```bash
rustup target list --installed
# wasm32v1-none should be in the list
```

---

### 1.3 Stellar CLI (v25+)

The **Stellar CLI** is used to compile Soroban smart contracts, generate client bindings, and deploy contracts to Stellar networks.

#### Option A: Binary Install (Recommended)
```bash
# Linux / macOS / WSL
curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
```

#### Option B: Cargo Install
```bash
cargo install --locked stellar-cli --version 25.2.0
```

Verify installation:
```bash
stellar --version
# Output: stellar 25.x.x
```

---

### 1.4 Freighter Wallet Extension

To interact with the smart contract (create projects, send XLM tips, and withdraw funds):

1. Install the **Freighter Wallet Extension** from [https://www.freighter.app/](https://www.freighter.app/) (Chrome, Brave, Edge, Firefox).
2. Create a new wallet or import an existing recovery phrase.
3. Switch the network from **Public** to **Testnet** (Settings ⚙️ → Network → Stellar Testnet).

---

## 2. Smart Contract Build & Testing

### 2.1 Compiling to WASM

From the root directory of the repository, build the optimized contract WASM binary:

```bash
stellar contract build
```

This compiles the contract located in `contracts/notes/` and places the output binary in:
```text
target/wasm32v1-none/release/tipping.wasm
```

---

### 2.2 Running Contract Unit Tests

Run the complete 10-scenario smart contract test suite in the local Soroban test environment:

```bash
cargo test --workspace
```

#### Expected Test Output:
```text
running 10 tests
test test::get_projects_is_empty_initially ... ok
test test::create_project_persists_owner_name_description_and_returns_id_1 ... ok
test test::tip_increases_balance_and_stores_amount_message_from ... ok
test test::tip_to_missing_id_fails_with_project_not_found ... ok
test test::withdraw_by_owner_pays_99_percent_to_owner_and_1_percent_to_platform ... ok
test test::withdraw_by_non_owner_fails_with_not_owner ... ok
test test::tip_does_not_change_platform_wallet_balance ... ok
test test::withdraw_dust_balance_sends_full_amount_to_owner_with_zero_fee ... ok
test test::withdraw_with_zero_balance_fails ... ok
test test::events_are_emitted_on_create_tip_and_withdraw ... ok

test result: ok. 10 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.11s
```

---

## 3. Frontend Application Setup

### 3.1 Installing Dependencies

Install all root and workspace dependencies:

```bash
npm install
```

---

### 3.2 Running Frontend Unit Tests

Run the 17 Vitest component and logic tests:

```bash
npm test
```

#### Expected Test Output:
```text
 RUN  v4.1.11

 Test Files  4 passed (4)
      Tests  17 passed (17)
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

---

### 3.3 Starting Development Server

Start the Next.js local development server with Turbopack:

```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

### 3.4 Building for Production

To create a production-ready build:

```bash
npm run build
```

To start the production server locally:
```bash
npm start
```

---

## 4. Wallet Setup & Testnet Funding

To test project creation, tipping, and owner withdrawals on Testnet:

1. Open your **Freighter Extension**.
2. Copy your Testnet public key (`G...` address).
3. Fund your address with free testnet XLM via **Friendbot**:
   - [Stellar Laboratory Account Creator](https://laboratory.stellar.org/#account-creator?network=test)
   - Or directly in Freighter by clicking **Fund with Friendbot**.
4. Connect your wallet using the **Connect Wallet** button on [http://localhost:3000](http://localhost:3000).

---

## 5. Contract Deployment & Custom Setup (Optional)

If you want to deploy a custom instance of the contract to Testnet:

### 5.1 Generate a Deployer Key
```bash
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet
```

### 5.2 Deploy Contract
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/tipping.wasm \
  --network testnet \
  --source deployer \
  -- \
  --xlm-token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --platform YOUR_PLATFORM_G_ADDRESS
```

### 5.3 Regenerate TypeScript Bindings
```bash
stellar contract bindings typescript \
  --wasm target/wasm32v1-none/release/tipping.wasm \
  --output-dir lib/bindings \
  --overwrite

npm run build:bindings
```

### 5.4 Update Frontend Contract Address
Update `CONTRACT_ID` in `src/lib/stellar.ts` with your newly deployed contract address.

---

## 6. Troubleshooting

- **Target Tuple Error (`channel name ...-windows-gnu`)**: Ensure `rust-toolchain.toml` specifies `channel = "1.92.0"` without host tuple suffix.
- **Freighter Not Connecting**: Verify Freighter is set to **Testnet** under extension settings.
- **Transaction Simulation Error**: Ensure your connected account is funded with at least 10 XLM via Friendbot for network base reserves and fees.
