# Stelym Frontend Documentation

This document outlines the architecture, routing, component hierarchy, state management, and design system of the **Stelym** Next.js frontend application.

---

## 1. Tech Stack Overview

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 (Neobrutalism Design Tokens) |
| **Icons** | `@phosphor-icons/react` |
| **Wallet API** | `@stellar/freighter-api` |
| **Blockchain SDK** | `@stellar/stellar-sdk` & generated TypeScript contract bindings |
| **Testing** | Vitest, React Testing Library, jsdom |

---

## 2. Application Routing & Pages

```text
src/app/
├── layout.tsx            # Global layout with ThemeProvider, Header & Navigation
├── page.tsx              # Homepage: Project creation form and project listing
├── projects/[id]/        # Dynamic project route: detail, tipping form, history & withdrawal
│   └── page.tsx
├── globals.css           # Theme variables, neobrutalist utilities, and color tokens
└── favicon.ico / icon.png# Application icons and assets
```

### 2.1 Homepage (`/`)
- **Project Creation (`CreateProjectForm`)**: Allows creators to register a project with a name (up to 64 chars) and description (up to 280 chars). Requires connected Freighter wallet.
- **Project Directory (`ProjectList`)**: Real-time grid of all on-chain projects displaying project ID, name, creator address, and unwithdrawn escrow balance in XLM.

### 2.2 Project Details (`/projects/[id]`)
- **Project Metadata**: Full project title, description, creator address, and contract escrow status.
- **Tipping Module**: Input for custom XLM amount and optional public message (up to 280 chars). Assembles Soroban transaction and prompts Freighter signature.
- **Tip History Feed**: Chronological list of all on-chain tips showing tipper address, amount in XLM, timestamp, and optional backer message.
- **Owner Withdrawal Module**: Visible to all users, but withdrawal execution is restricted to the authenticated project owner (`require_auth`). Displays estimated 99% payout and 1% platform fee.

### 2.3 Error / Not Found State
- When navigating to an invalid or non-existent `project_id`, a clean neobrutalist **"Project not found"** error screen is displayed with a direct button to return home.

---

## 3. UI Component Architecture

```text
src/components/
├── Button.tsx               # Versatile neobrutalist button with variants
├── CreateProjectForm.tsx    # Validated project registration form
├── FeedbackBanner.tsx       # Interactive dismissible success/error banner
├── ProjectDetail.tsx        # Project view, escrow cards, tipping & withdraw logic
├── ProjectList.tsx          # Dynamic project card grid
├── ThemeToggle.tsx          # Light/Dark mode Sun & Moon switch button
├── TippingApp.tsx           # Master client layout with project query state
├── WalletButton.tsx         # Freighter connection trigger & address indicator
└── WalletRequiredBanner.tsx # Non-intrusive alert for wallet-required write operations
```

### Component Details

| Component | Responsibility |
| --- | --- |
| **`Button`** | Neobrutalist button supporting `primary`, `secondary`, `success`, `danger`, and `ghost` variants with active pressed states and loading spinners. |
| **`CreateProjectForm`** | Handles form state, character counters, validation boundaries, and transaction submission. |
| **`WalletButton`** | Checks extension availability, handles wallet connect/disconnect, displays truncated address (`G...`), and indicates active network. |
| **`ThemeToggle`** | Toggles `.dark` class on root document and persists user preference in `localStorage`. |
| **`FeedbackBanner`** | Displays transaction hashes, success confirmations, and actionable error messages. |
| **`WalletRequiredBanner`**| Displays helpful onboarding guidance when a user tries to create or tip without a connected wallet. |

---

## 4. State Management & Custom Hooks

### 4.1 `useFreighter` (`src/hooks/useFreighter.ts`)
Manages Freighter wallet lifecycle:
- `connected`: Boolean indicating active wallet connection.
- `address`: Public Stellar address (`G...`) of the connected account.
- `network`: Active network (e.g. `TESTNET`).
- `installed`: Boolean detecting if Freighter extension is installed in the browser.
- `connect()` / `disconnect()`: Methods to request connection and clear state.

### 4.2 `useTipping` (`src/hooks/useTipping.ts`)
Encapsulates all smart contract RPC interactions:
- `createProject(name, description)`: Submits `create_project` transaction via Freighter.
- `sendTip(projectId, amountXlm, message)`: Converts XLM to stroops and executes `tip` transaction.
- `withdraw(projectId)`: Executes `withdraw` transaction for project owners.
- `loadProjects()`: Queries all registered projects from on-chain storage.
- `loadProjectDetails(id)`: Fetches project metadata, tip records, and current balance.

### 4.3 `useTheme` (`src/hooks/useTheme.ts`)
Manages theme state (`light` | `dark`):
- Initializes from `localStorage` or system `prefers-color-scheme`.
- Synchronizes with `document.documentElement` `.dark` class and `data-theme` attribute.

---

## 5. Design System & Theme Tokens

Stelym implements a high-contrast **Neobrutalism** design aesthetic:

- **Borders**: Sharp `2.5px` solid ink borders (`border-[2.5px] border-ink`).
- **Drop Shadows**: Crisp, hard-edged offset drop shadows (`shadow-[4px_4px_0_0_#111111]`).
- **Color Palette**:
  - **Punch Indigo** (`#6366f1` / `#4f46e5`): Primary accents and action buttons.
  - **Emerald Mint** (`#10b981`): Success indicators and connection badges.
  - **Coral Red** (`#f43f5e`): Danger and withdrawal actions.
  - **Sunshine Amber** (`#f59e0b`): Warning alerts and highlights.
- **Dark Mode Architecture**:
  - Background Canvas: `#0b0f19` with subtle `rgba(255, 255, 255, 0.025)` ambient grid.
  - Dark Card Surfaces: `#131927`.
  - Dark Borders: `#2b3851` to prevent harsh white glare.
  - Dark Shadows: `#000000`.

---

## 6. Testing Suite

The frontend includes 17 unit and component tests powered by **Vitest** and **React Testing Library**:

```bash
# Run all frontend tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Covered Test Suites:
- `src/lib/__tests__/stellar.test.ts`: Stroop math conversions (`xlmToStroops`), decimal validations, formatters (`formatXlm`), and address truncation (`shortenAddress`).
- `src/components/__tests__/Button.test.tsx`: Variant rendering, click triggers, and disabled states.
- `src/components/__tests__/FeedbackBanner.test.tsx`: Error/success banner rendering and dismiss actions.
- `src/components/__tests__/ThemeToggle.test.tsx`: Light/Dark theme switching state integration.
