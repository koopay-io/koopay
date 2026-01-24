<p align="center">
  <img src="public/logo.svg" alt="Koopay Logo" width="350">
</p>

<h1 align="center">Koopay: Secure Payments for Freelancers</h1>

<p align="center">
  A decentralized freelancing platform for transparent, automated, and secure milestone-based projects.
</p>

<p align="center">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge&logo=git">
  <img alt="Built on Stellar" src="https://img.shields.io/badge/Built_on-Stellar-blue.svg?style=for-the-badge&logo=stellar">
  <img alt="Powered by Supabase" src="https://img.shields.io/badge/Powered_by-Supabase-green.svg?style=for-the-badge&logo=supabase">
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-Next.js-black.svg?style=for-the-badge&logo=nextdotjs">
</p>

<p align="center">
  <a href="CONTRIBUTING.md">Contributing Guidelines</a> •
  <a href="https://github.com/koopay-io/koopay/issues">Report Bug</a> •
  <a href="https://github.com/koopay-io/koopay/issues">Request Feature</a>
</p>

Koopay is a blockchain-based freelancing platform designed to make work agreements between clients (Requesters) and freelancers (Providers) more transparent and automated. It combines freelance project management, smart contract escrow services, and on-chain reputation tracking into a single, easy-to-use system.

The platform operates around **milestone-based projects**, where funds are held in secure smart contracts until specific parts of the work are completed. Payments are made in **USDC**, a stablecoin pegged to the U.S. dollar, allowing for fast, low-fee, and borderless transfers.

Crucially, Koopay provides an **invisible Web3 experience**. Users sign up with a standard email or Google account, and a secure Stellar wallet is automatically created for them in the background, removing the barrier of crypto wallet management.

## Fixing a Broken System

In traditional freelancing, the biggest risk isn't doing the work—it's getting paid. Koopay is built to solve the core problems of distrust and inefficiency.

| The Problem ❌ | The Koopay Solution ✅ |
| :--- | :--- |
| **Delayed Payments** | **Automatic Payments** <br> Funds are secured upfront in an escrow and released automatically when a milestone is approved. No chasing invoices. |
| **Ghosting & Distrust** | **Secure, Visible Contracts** <br> Both parties see the project terms and secured funds from day one. Everything is recorded and shared. |
| **High Fees & Slow Transfers** | **Global, Fast Payments** <br> Built on Stellar, payments are settled in seconds with near-zero fees, anywhere in the world. |

-----

## ✨ Key Features

  * **🔒 Smart Escrow Contracts:** Project funds are locked in a `multi-release` escrow contract, automatically managed by code, not people.
  * **📍 Milestone-Based Projects:** Break down large projects into smaller, verifiable milestones, each with its own deliverable and payment.
  * **💳 Invisible Wallet Onboarding:** Users sign up with Google or email, and a secure, non-custodial Stellar wallet is generated for them automatically. No "connect wallet" friction.
  * **💸 Global USDC Payments:** Send and receive payments in a stable, dollar-backed currency for true global collaboration.
  * **🧾 PDF Contract Generation:** Automatically generate and store a formal PDF contract for every project.
  * **📈 On-Chain Reputation:** Every completed project contributes to a user’s public, verifiable, and portable on-chain reputation.
  * **🔐 Supabase Powered:** Utilizes Supabase for secure authentication, database management (PostgreSQL), and file storage.

## ⚙️ How It Works: The Core Flow

1.  **Onboard:** A Client or Freelancer signs up with Google or email. A secure Stellar wallet is instantly and invisibly created for them.
2.  **Create Project:** A Client (Requester) creates a new project, defining the title, description, total budget (in USD), and expected delivery date.
3.  **Assign & Define:** The Client assigns a Freelancer (Provider) and breaks the project into clear, verifiable milestones (e.g., "Milestone 1: Wireframes - 20%", "Milestone 2: Final Design - 80%").
4.  **Secure Escrow:** When the project is created, a smart contract escrow is automatically deployed to the Stellar network, and the `contract_id` is saved to the project.
5.  **Fund (WIP):** The Client funds the escrow with the total project amount in USDC.
6.  **Work & Approve:** The Freelancer completes a milestone. The Client reviews the work and approves it in the Koopay app.
7.  **Get Paid (WIP):** Approving the milestone automatically triggers the escrow contract to release the corresponding USDC payment directly to the Freelancer's wallet.
8.  **Build Reputation:** The completed project is recorded, building the on-chain reputation for both parties.

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage) |
| **Blockchain** | [Stellar (Testnet)](https://stellar.org/), [@trustless-work/escrow SDK](https://docs.trustlesswork.com/trustless-work/react-library) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/), [React Context](https://react.dev/learn/passing-data-deeply-with-context) |
| **Utilities** | [Zod](https://zod.dev/) (Validation), [@react-pdf/renderer](https://react-pdf.org/) (PDF Generation) |

## 🚀 Getting Started

### 1\. Clone the Repository

```bash
git clone https://github.com/tomassalina/koopay.git
cd koopay
```

### 2\. Install Dependencies

This project uses `pnpm` for package management.

```bash
pnpm install
```

### 3\. Set Up Environment Variables

Copy the example environment file and fill in your keys.

```bash
cp .env.example .env.local
```

You will need to fill in the following values in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Trustless Work
NEXT_PUBLIC_TRUSTLESS_BASE_URL=
NEXT_PUBLIC_TRUSTLESS_API_KEY=
NEXT_PUBLIC_TRUSTLESS_ADMIN_PK=
NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE=1.5
NEXT_PUBLIC_TRUSTLESS_SKIP_ESCROW=false
```

### 4\. Set Up Supabase Database

1.  Log in to your Supabase account and create a new project.
2.  Go to the **SQL Editor**.
3.  Open the `scripts/002_create_triggers.sql` file from this repo, paste its content into the editor, and run it.
4.  *(Note: Other SQL files appear to be for altering existing tables, `002` is the main setup script).*
5.  **Important:** [Row Level Security (RLS)](https://www.google.com/search?q=https-%3E) is **not yet implemented**. For a production environment, you **must** add RLS policies to all tables.

### 5\. Generate Database Types

To ensure full TypeScript safety, generate types from your new Supabase instance:

```bash
# This will generate types from your remote Supabase DB
pnpm db:types:remote
```

### 6\. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the app.

-----

## 🔧 Development Scripts

  * `pnpm dev`: Starts the Next.js development server (with Turbopack).
  * `pnpm build`: Creates a production-ready build.
  * `pnpm start`: Starts the production server.
  * `pnpm lint`: Runs ESLint to check for code quality issues.
  * `pnpm check`: Runs the TypeScript compiler to check for type errors.
  * `pnpm db:types`: Auto-detects and generates Supabase types (local-first, then remote).
  * `pnpm db:types:local`: Generates types from a local Supabase instance.
  * `pnpm db:types:remote`: Generates types from the remote Supabase DB (production).

## 🛣️ Project Status

This project is a functional MVP with a solid foundation. The core flows for authentication, onboarding, and project creation are complete.

### ✅ What's Working

  * **Authentication:** Full email/password and Google OAuth login.
  * **Invisible Wallet:** Automatic Stellar wallet creation and storage in Supabase `user_metadata` on auth callback.
  * **Onboarding:** A complete 4-step flow for Requesters & Providers to create their organization profile.
  * **Project Creation:** A multi-step form to create a project, define details, assign a collaborator, and set milestones.
  * **Escrow Deployment:** Successfully deploys a `multi-release` escrow smart contract to the Stellar testnet upon project creation.
  * **PDF Contracts:** Generates and saves a PDF contract to Supabase Storage.
  * **Project Viewing:** A detailed project page to view milestones, progress, and contract details.

### ❌ What's Next (Roadmap)

The main pending items involve completing the blockchain interaction loop and implementing security/real-time features.

  * **🔐 Security (Critical):** Implement **Row Level Security (RLS)** in Supabase for all tables.
  * **💸 Escrow Funding & Release:** Implement the UI and logic for:
      * Clients to **fund** the escrow contract with USDC.
      * Clients to **approve** a milestone, triggering the automated payment release from the escrow.
  * **📊 Live Dashboard:** Connect the main dashboard components (`DonutChart`, `ProjectsSection`) to real data from the database instead of mock data.
  * **🔔 Notifications:** Implement a real-time notification system (e.g., project invites, milestone approvals).
  * **🧑‍⚖️ Dispute Resolution:** Build the initial admin-managed dispute resolution system.
