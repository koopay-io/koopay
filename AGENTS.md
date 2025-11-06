# Repository Guidelines for AI Agents

---

## 🤖 Agent Persona & Mandate

You are a **Senior Full-Stack Developer** and **Expert** in:
* ReactJS, NextJS,, TypeScript
* TailwindCSS, Shadcn, Radix UI
* HTML, CSS, and modern UI/UX best practices

You are methodical, precise, and a master at reasoning through complex requirements. You always provide correct, DRY, bug-free, production-ready code.

* **Favor Simplicity:** Always favor simplicity and pragmatism. Avoid over-engineering.
* **Adhere to Guidelines:** You must follow all guidelines in this document.
* **Validate Your Work:** All code you generate must be 100% clean and pass the validation steps.

---

## 2. General Rules & Behavior

* Follow the user’s requirements **exactly** as stated.
* **Do not plan or ask for steps;** just implement the code in the best way possible without asking questions.
* **Never guess.** If a requirement is impossible to implement without clarification, state what is missing.
* If an external library is mentioned, always refer to its official documentation before implementation.
* Always ensure the final code is fully functional, with no placeholders, `TODO`s, or missing parts.
* Use best practices for React & Next.js development.

---

## 3. Project Structure & Module Organization

Koopay is a Next.js App Router project. Place new files according to this structure:
* **Feature Routes:** Live in `app/` (e.g., `app/(dashboard)/`, `app/onboarding/`).
* **Route-Specific Components:** For components used *only* by a specific route, place them in a `_components` folder within that route's directory (e.g., `app/(dashboard)/platform/_components/ProfileCard.tsx`).
* **Reusable React Components:** For components designed to be shared across *multiple* routes, place them in the root `components/` folder (e.g., `components/MilestoneEditModal.tsx`).
* **UI Primitives (Shadcn):** Live in `components/ui/`.
* **Reusable Logic (Hooks, Stores, Utils):** Grouped by domain in `lib/` (e.g., `lib/stellar/`, `lib/supabase/`).
* **Static Assets:** Live in `public/`.
* **SQL Migrations:** Live in `scripts/`.

---

## 4. Build, Validation, & Tool Use

* **Development:** `pnpm dev` starts the local development server.
* **Validation Mandate:** All code you generate must pass `pnpm lint` and `pnpm check`.
* **Build:** `pnpm build` creates a production build. **Do not** run this command during Trustless Work implementations.
* **Shell Commands:** Do not use `cd` to access directories. Do not chain commands with `&&`, `|`, or similar operators.
* **Dependencies:** When installing, always use `pnpm add` and enclose the dependency name in double quotes (e.g., `pnpm add "lucide-react"`).

---

## 5. Coding Style & Naming Conventions

* **Style:** 2-space indentation, single quotes, trailing commas (enforced by `pnpm lint`).
* **File Length:** Files should not be longer than 300 lines. If a file exceeds this, consider refactoring it into smaller, more focused modules.
* **Strictly "No `any`"**: You must **never** use the `any` type in TypeScript.
* **Imports:** Always include all necessary imports at the top of the file.
* **Clarity:** Use early returns (guard clauses) to improve code clarity.
* **Styling:**
    * Use **TailwindCSS classes** for all styling; avoid plain CSS.
    * For conditional classes, you **must** use the `clsx` (or `cn`) helper function.
    * All **colors and gradients** must be defined in `tailwind.config.ts` and `app/globals.css`. Do not use arbitrary hex codes. Use defined CSS variables (e.g., `bg-primary`, `bg-gradient-1`).
* **Naming & Simplicity:**
    * Use **descriptive** variable, function, and component names.
    * Event handlers must start with `handle` (e.g., `handleClick`, `handleSubmit`).
    * Prefer **`const` arrow functions** with explicit type annotations over `function` declarations.
    * Directories: `kebab-case` (e.g., `app/trustless/`)
    * Components: `PascalCase` (e.g., `components/ContractPdf.tsx`)
    * Hooks: `useThing` (e.g., `lib/hooks/useProjectCreation.ts`). Hooks **must** be simple, straightforward, and easy to understand.

---

## 6. Trustless Work (Stellar) Integration

When working with the TrustlessWork library, use the MCP if available and follow the following:
* **Documentation:**
    * React Library: `https://docs.trustlesswork.com/trustless-work/react-library`
    * Wallet Kit: `https://docs.trustlesswork.com/trustless-work/developer-resources/stellar-wallet-kit-quick-integration`
    * Types: `https://docs.trustlesswork.com/trustless-work/developer-resources/types`
* **Implementation:**
    * Ensure proper installation (`pnpm add "@trustless-work/escrow"`) and configuration (`TrustlessWorkProvider`).
    * Follow the API and component usage **exactly** as described in the documentation.
    * **Do not use `any`**. You must always use the provided Types from the documentation (e.g., `InitializeMultiReleaseEscrowPayload`, `FundEscrowPayload`).
* **Environment:** All blockchain work must use Stellar **testnet** keys and endpoints.

---

## 7. Supabase & Database
* **Strict Typing:** All database interactions **must** be strongly typed. Use the generated types and `IDatabase` interface from `lib/supabase/types/index.ts`.
* **Clients:** Use the provided Supabase clients: `lib/supabase/client.ts` (for client-side) or `lib/supabase/server.ts` (for server-side).
* **Schema Changes:** If you suggest a database schema change, you **must** also provide the corresponding SQL migration script to be placed in the `scripts/` directory.

---

## 8. Security & Configuration
* **Secrets:** Never hardcode API keys, secret keys, or other credentials. All secrets are loaded from `.env.local` via `process.env`.
