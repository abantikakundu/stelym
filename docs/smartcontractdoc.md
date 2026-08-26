# Stelym Smart Contract Documentation

This document provides a technical specification of the **Stelym Tipping Smart Contract** (`TippingContract`) built on **Stellar Soroban**.

---

## 1. Overview & Deployment Information

| Parameter | Value |
| --- | --- |
| **Contract Name** | `TippingContract` |
| **Language & Framework** | Rust (`soroban-sdk` v25) |
| **Target Architecture** | `wasm32v1-none` |
| **Network** | Stellar Soroban Testnet |
| **Contract ID** | `CBFKEXJOQ3ZDJZC66PZYSELB36EHFRBPPGUE6ZW22B2AEDYECVJUH2QZ` |
| **Native XLM SAC Address** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Explorer Link** | [Stellar Lab Contract Viewer](https://lab.stellar.org/r/testnet/contract/CBFKEXJOQ3ZDJZC66PZYSELB36EHFRBPPGUE6ZW22B2AEDYECVJUH2QZ) |

---

## 2. Constructor & Initialization

The contract is initialized upon deployment via `__constructor`.

```rust
pub fn __constructor(env: Env, xlm_token: Address, platform: Address)
```

- **`xlm_token`** (`Address`): Address of the Stellar Asset Contract (SAC) managing native XLM token balances.
- **`platform`** (`Address`): Address that receives the 1% platform fee upon project owner withdrawals.
- **Immutability**: Both addresses are stored in **Instance Storage** and cannot be modified after deployment.

---

## 3. Data Structures & Storage Layout

### 3.1 Data Structures

#### Project Struct
Stores project metadata and ownership details:
```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub description: String,
}
```

#### Tip Struct
Stores individual public tipping records:
```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Tip {
    pub id: u64,
    pub project_id: u64,
    pub from: Address,
    pub amount: i128,
    pub message: String,
    pub timestamp: u64,
}
```

> **Note on Amounts**: All currency amounts are denominated in **stroops** (`i128`), the smallest unit of XLM:
> $$\text{1 XLM} = 10{,}000{,}000\text{ stroops } (10^7)$$

---

### 3.2 Storage Keys & Storage Tiers

```rust
#[contracttype]
#[derive(Clone)]
enum DataKey {
    XlmToken,              // Instance: Native SAC token address
    Platform,              // Instance: Platform fee recipient address
    NextProjectId,         // Persistent: u64 counter for project IDs
    Project(u64),          // Persistent: Project struct by ID
    Balance(u64),          // Persistent: i128 escrow balance by project ID
    NextTipId,             // Persistent: u64 counter for tip IDs
    Tip(u64),              // Persistent: Tip struct by tip ID
    ProjectTipIds(u64),    // Persistent: Vec<u64> of tip IDs for a project
}
```

---

## 4. Contract Functions

### 4.1 Write Functions (Transactions)

#### `create_project`
Registers a new project on-chain. The calling account is designated as the project owner.

- **Signature**: `create_project(env: Env, owner: Address, name: String, description: String) -> Result<u64, Error>`
- **Authorization**: `owner.require_auth()`
- **Validation**:
  - `name.len() > 0` (cannot be empty)
  - `name.len() <= 64` characters
  - `description.len() <= 280` characters
- **Return Value**: Unique sequential `u64` project ID.
- **Events Emitted**: `("create", owner: Address)` with payload `project_id: u64`.

---

#### `tip`
Transfers native XLM from the tipper's wallet into contract escrow and logs a public tip record.

- **Signature**: `tip(env: Env, from: Address, project_id: u64, amount: i128, message: String) -> Result<(), Error>`
- **Authorization**: `from.require_auth()`
- **Validation**:
  - `project_id` must exist in storage
  - `amount > 0` (strictly positive stroops)
  - `message.len() <= 280` characters
- **Cross-Contract Transfer**: Calls `token::TokenClient::transfer(&from, &contract_address, &amount)` on the native XLM SAC contract.
- **Escrow Accounting**: Increments `DataKey::Balance(project_id)` by `amount`.
- **Events Emitted**: `("tip", project_id: u64, from: Address)` with payload `(amount: i128, tip_id: u64)`.

---

#### `withdraw`
Withdraws all escrowed funds for a project, sending 99% of the balance to the project owner and 1% to the platform address.

- **Signature**: `withdraw(env: Env, caller: Address, project_id: u64) -> Result<(), Error>`
- **Authorization**: `caller.require_auth()`
- **Validation**:
  - `project_id` must exist
  - `caller == project.owner` (only owner can withdraw)
  - `balance > 0` (cannot withdraw from zero balance)
- **Fee Calculation**:
  $$\text{fee} = \lfloor \frac{\text{balance}}{100} \rfloor$$
  $$\text{net} = \text{balance} - \text{fee}$$
  *(If $\text{balance} < 100\text{ stroops}$, fee evaluates to $0$, and full balance is paid to the owner).*
- **Transfers**:
  - `token.transfer(&contract, &project.owner, &net)`
  - `token.transfer(&contract, &platform, &fee)` (if $\text{fee} > 0$)
- **State Update**: Resets `DataKey::Balance(project_id)` to $0$. Tip history remains permanently preserved.
- **Events Emitted**: `("withdraw", project_id: u64, caller: Address)` with payload `(net: i128, fee: i128)`.

---

### 4.2 Read Functions (Queries)

| Function | Parameters | Return Type | Description |
| --- | --- | --- | --- |
| **`get_projects`** | `env: Env` | `Vec<Project>` | Returns an array of all registered projects. |
| **`get_project`** | `env: Env, id: u64` | `Result<Project, Error>` | Returns project metadata for a given ID. |
| **`get_tips`** | `env: Env, project_id: u64` | `Result<Vec<Tip>, Error>` | Returns complete tip history for a given project. |
| **`get_balance`** | `env: Env, project_id: u64` | `Result<i128, Error>` | Returns current unwithdrawn escrow balance in stroops. |

---

## 5. Error Codes

Custom Soroban error codes returned by the contract:

| Error Name | Code | Description |
| --- | --- | --- |
| `EmptyName` | `1` | Project name was empty. |
| `NameTooLong` | `2` | Project name exceeded 64 characters. |
| `DescriptionTooLong` | `3` | Project description exceeded 280 characters. |
| `MessageTooLong` | `4` | Tip message exceeded 280 characters. |
| `InvalidAmount` | `5` | Tip amount was zero or negative. |
| `ProjectNotFound` | `6` | Project ID does not exist in ledger storage. |
| `NotOwner` | `7` | Caller is not authorized as the project owner. |
| `ZeroBalance` | `8` | Attempted to withdraw when escrow balance is 0. |

---

## 6. On-Chain Events Reference

| Event Topic | Topics Tuple | Data Payload | Triggered When |
| --- | --- | --- | --- |
| `create` | `("create", owner: Address)` | `project_id: u64` | New project is registered |
| `tip` | `("tip", project_id: u64, from: Address)` | `(amount: i128, tip_id: u64)` | Tip is locked in contract escrow |
| `withdraw` | `("withdraw", project_id: u64, caller: Address)` | `(net: i128, fee: i128)` | Owner withdraws escrowed tips |
