
<div align="center">
<h1 align="center">
<img src="https://raw.githubusercontent.com/agencyenterprise/zkRamp/main/frontend/public/vectors/logo.svg" width="200" />
<h3>◦ Don't waste your time with KYC, use ZKRamp.</h3>
</div>


## 📖 Table of Contents
- [📍 Overview](#-overview)
- [🛣 Roadmap](#-roadmap)
- [🚀 Getting started](#-getting-started)
- [ Contract Deployment](#contract-deployment)


## 📍 Overview

The goal is to create a liquidity marketplace where users can directly transfer funds without the requirement of KYC, based on ZK-Email technology. This eliminates the need for the ramp to function as an intermediary.

**The steps are simple:**
- The seller escrows funds to the smart contract, sets a price, and adds their payment key (Wise). A collateral is collected to ensure the token transfer to the buyer.
- The buyer selects a liquidity pool to make a purchase. An intermediate state is established, and the buyer has 1 hour to make the off-chain payment.
- Upon receiving the email notification, the buyer creates a ZK proof and submits it on-chain.
- The seller creates a ZK proof with the funds received an email notification and submits it on-chain.
- The funds are transferred to the buyer.

### Architecture
ZKRamp uses Zero-Knowledge (ZK) proofs to verify DKIM signatures in payment confirmation emails. Therefore, users must have notification emails enabled in their payment providers. This technology is powered by ZK-Email, a new technology that utilizes regex and other email features to create ZK proofs.

**Tech Stack:**
- Circuits: Circuits are essential for verifying transaction details while maintaining the privacy of sensitive information.
- Smart Contracts: Smart contracts facilitate trustless transactions and manage the protocol's logic.
- User Interface (UI): The UI is the front-end through which users interact with the protocol.




## 🛣 Roadmap

> - [X] `ℹ️  Implement ZKEmail circuit`
> - [X] `ℹ️  Implement AlephZero smart contract`
> - [X] `ℹ️  Implement front-end UI`
> - []  `ℹ️  Implement support to Brazil PIX`
> - []  `ℹ️  Implement support to Vemno`
> - []  `ℹ️  Implement support to Canada Interac`


## 🚀 Getting started 

### 1. Run the frontend

The frontend works out of the box, without a local node running, as the sample contract is pre-deployed on certain live testnets (i.e. `alephzero-testnet` and `shibuya`). Necessary deployment metadata and addresses are provided under `contracts/deployments/`.

> **Pre-requisites:**
>
> - Setup Node.js v18+ (recommended via [nvm](https://github.com/nvm-sh/nvm) with `nvm install 18`)
> - Install [pnpm](https://pnpm.io/installation) (recommended via [Node.js Corepack](https://nodejs.org/api/corepack.html) or `npm i -g pnpm`)
> - Clone this repository

<details>
<summary><strong>Special Instructions for Windows Users</strong></summary>

> [!IMPORTANT]  
> Windows users must either use [WSL](https://learn.microsoft.com/windows/wsl/install) (recommended) or a custom shell like [Git Bash](https://git-scm.com/downloads). PowerShell is not supported.

> **Pre-requisites when using WSL for Linux:**
>
> - Install [WSL](https://learn.microsoft.com/windows/wsl/install) and execute _all_ commands in the WSL terminal
> - Setup Node.js v18+ (recommended via [nvm](https://github.com/nvm-sh/nvm) with `nvm install 18`)
> - Install the following npm packages globally:
> - `npm i -g npm`
> - `npm i -g pnpm node-gyp make`
> - Clone this repository into the WSL file system (e.g. `/home/<user>/inkathon`).
>
> **Tip:** You can enter `\\wsl$\` in the top bar of the Windows Explorer to access the WSL file system visually.

</details>

```bash
# Install dependencies (once)
# NOTE: This automatically creates an `.env.local` file
pnpm install

# Start Next.js frontend
pnpm run dev
```

Optionally, to enable [`simple-git-hooks`](https://github.com/toplenboren/simple-git-hooks) (for automatic linting & formatting when committing), you can run the following command once: `pnpm simple-git-hooks`.

### 2. Build & deploy contracts on a local node

The `contracts/package.json` file contains shorthand scripts for building, testing, and deploying your contracts. To run these scripts, you need to set `contracts/` as the active working directory in your terminal.

> **Pre-requisites:**
>
> - Install Rust via the [Substrate Docs](https://docs.substrate.io/install/) (skip the "Compile a Substrate node" section)
> - Install [`cargo contract`](https://github.com/paritytech/cargo-contract)
> - Install [`substrate-contracts-node`](https://github.com/paritytech/substrate-contracts-node)

```bash
# Build contracts and move artifacts to `contracts/deployments/{contract}/` folders
pnpm run build

# Start local node with persistence (contracts stay deployed after restart)
# NOTE: When using Brave, shields have to be taken down for the UIs
pnpm run node

## IMPORTANT: Open a separate terminal window and keep the node running

# Deploy the contracts on the local node
pnpm run deploy
```

## Contract Deployment

In the [Getting Started](#getting-started) section above, we've already deployed the sample `Greeter` contract on a local node. To target a live network, we can use the `CHAIN` environment variable when running the `deploy` script.

```bash
CHAIN=alephzero-testnet pnpm run deploy
```

Further, dynamically loaded environment files with the `.env.{chain}` naming convention can be used to add additional configuration about the deployer account.

```bash
# .env.alephzero-testnet
ACCOUNT_URI=bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice
```

When running the same script again, this deployer account defined there will be used to sign the extrinsic.

> [!WARNING]  
> These files are gitignored by default, but you should still be extra cautious when adding sensitive information to them.

