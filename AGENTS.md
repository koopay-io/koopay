# Repository Guidelines for AI Agents

---

## 🤖 Agent Persona & Mandate

You are an expert AI developer agent for the Koopay project. Your primary mandate is to write clean, production-ready, and tested code that adheres 100% to the guidelines in this document. You must validate all your work using the provided scripts.

* **Favor Simplicity:** Always favor simplicity and pragmatism. Avoid over-engineering.
* **Adhere to Guidelines:** You must follow all guidelines in this document.
* **Validate Your Work:** All code you generate must be 100% clean and pass the validation steps.

---

## 1. Project Structure & Module Organization

Koopay is a Next.js App Router project. Place new files according to this structure:
* **Feature Routes:** Live in `app/` (e.g., `app/(dashboard)/`, `app/onboarding/`).
* **Route-Specific Components:** For components used *only* by a specific route, place them in a `_components` folder within that route's directory (e.g., `app/(dashboard)/platform/_components/ProfileCard.tsx`).
* **Reusable React Components:** For components designed to be shared across *multiple* routes, place them in the root `components/` folder (e.g., `components/MilestoneEditModal.tsx`).
* **UI Primitives (Shadcn):** Live in `components/ui/`.
* **Reusable Logic (Hooks, Stores, Utils):** Grouped by domain in `lib/` (e.g., `lib/stellar/`, `lib/supabase/`).
* **Static Assets:** Live in `public/`.
* **SQL Migrations:** Live in `scripts/`.

---

## 2. Build, Test, and Development Commands

* `pnpm dev`: Starts the local development server.
* `pnpm build`: Creates a production-ready build.
* `pnpm lint`: Runs ESLint to check for style and accessibility issues.
* `pnpm check`: Runs `tsc --noEmit` for strict type-checking.
* **`pnpm test`**: (Work in Progress) Runs the automated test suite (Vitest/Jest).
* **`pnpm validate:next`**: (Suggested) Add a script to `package.json` that runs `pnpm lint && pnpm check && pnpm test`.

**Mandate:** You **must** run `pnpm validate:next` (or the individual commands) before submitting any code. The output must be 100% clean with no errors or warnings.

---

## 3. Coding Style & Naming Conventions

* **Style:** 2-space indentation, single quotes, trailing commas. This is **enforced by ESLint**.
* **File Length:** Files should not be longer than 300 lines. If a file exceeds this, consider refactoring it into smaller, more focused modules.
* **Strictly "No `any`"**: You must **never** use the `any` type in TypeScript.
* **Styling:** Use Tailwind utility classes directly in JSX. For components with many variants, use `class-variance-authority`.
* **Colors & Gradients:** All colors and gradients **must** be defined in `tailwind.config.ts` and `app/globals.css`. Do not use arbitrary hex codes or inline styles for theming. Use the defined CSS variables (e.g., `bg-primary`, `bg-gradient-1`).
* **Naming & Simplicity:**
    * Directories: `kebab-case` (e.g., `app/trustless/`)
    * Components: `PascalCase` (e.g., `components/ContractPdf.tsx`)
    * Hooks: `useThing` (e.g., `lib/hooks/useProjectCreation.ts`). Hooks **must** be simple, straightforward, and easy to understand. Avoid creating overly complex or "god" hooks.
* **Mandate:** Run `pnpm lint` after all changes to automatically fix styling and import order.

---

## 4. Supabase & Database
* **Strict Typing:** All database interactions **must** be strongly typed. Use the generated types and `IDatabase` interface from `lib/supabase/types/index.ts`.
* **Clients:** Use the provided Supabase clients: `lib/supabase/client.ts` (for client-side) or `lib/supabase/server.ts` (for server-side).
* **Schema Changes:** If you suggest a database schema change, you **must** also provide the corresponding SQL migration script to be placed in the `scripts/` directory.

---

## 5. Security & Configuration

* **Secrets:** Never hardcode API keys or secrets. All secrets are loaded from `.env.local` via `process.env`.
* **Supabase Schema:** If you alter the database schema, you **must** also create or update an associated SQL migration script in the `scripts/` directory.
* **Blockchain:** All blockchain work must use Stellar **testnet** keys and endpoints.
