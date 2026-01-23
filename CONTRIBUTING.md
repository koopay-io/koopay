# Contributing to Koopay

Thank you for your interest in contributing to Koopay! This document provides a step-by-step guide to help you contribute effectively to this open-source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Git Contribution Guidelines](#git-contribution-guidelines)
- [Branch Strategy](#branch-strategy)
- [Atomic Commits](#atomic-commits)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### 1. Fork the Repository

1. Navigate to the [Koopay repository](https://github.com/koopay-io/koopay)
2. Click the "Fork" button in the top-right corner
3. This creates a copy of the repository in your GitHub account

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/koopay.git
cd koopay
```

### 3. Add Upstream Remote

Add the original repository as an upstream remote to keep your fork synchronized:

```bash
git remote add upstream https://github.com/koopay-io/koopay.git
```

Verify your remotes:

```bash
git remote -v
```

You should see:
- `origin` pointing to your fork
- `upstream` pointing to the original repository

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in the required environment variables in `.env.local`:

```env
# Supabase (Required)
# Get these from your Supabase project dashboard: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key

# Stellar Network (Required - Keep as testnet for development)
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Google OAuth (Optional - for Google sign-in)
# Get from Google Cloud Console: https://console.cloud.google.com/
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Trustless Work API (Required for escrow contracts)
# Get from the Trustless Work team or documentation
NEXT_PUBLIC_TRUSTLESS_BASE_URL=https://dev.api.trustlesswork.com
NEXT_PUBLIC_TRUSTLESS_API_KEY=your_trustless_api_key
NEXT_PUBLIC_TRUSTLESS_ADMIN_PK=your_admin_public_key
NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE=1.5

# Development flags
NEXT_PUBLIC_TRUSTLESS_SKIP_ESCROW=false  # Set to "true" to bypass escrow deployment for UI development
```

**Important Links for Setup:**
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/
- **Trustless Work Documentation**: 
  - React Library: https://docs.trustlesswork.com/trustless-work/react-library
  - Wallet Kit: https://docs.trustlesswork.com/trustless-work/developer-resources/stellar-wallet-kit-quick-integration
  - Types: https://docs.trustlesswork.com/trustless-work/developer-resources/types
- **Stellar Documentation**: https://stellar.org/

### 6. Set Up Supabase Database

**Important:** You must set up the database schema before running the application.

1. **Log in to Supabase** and create a new project (or use an existing one):
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Fill in your project details

2. **Run the main schema script:**
   - Go to the **SQL Editor** in your Supabase dashboard
   - Open the `schemas/schema.sql` file from this repository
   - Copy the entire content and paste it into the SQL Editor
   - Click "Run" to execute the script
   
   This script will create:
   - Required extensions (uuid-ossp)
   - All enum types (user_role, project_status, milestone_status, etc.)
   - All database tables (profiles, organizations, projects, milestones, contracts, etc.)
   - Initial data (continents, countries)
   - Database functions (handle_new_user, update_updated_at_column, etc.)
   - Triggers (for automatic profile creation on user signup, updated_at timestamps)
   - Storage buckets (organizations, contracts, evidences) and their policies

3. **Run additional migration scripts (if needed):**
   
   These scripts add columns or features that may have been added after the main schema:
   
   ```sql
   -- Add contract_id column to projects table (for storing Stellar escrow contract IDs)
   -- Run: scripts/003_add_contract_id_to_projects.sql
   ```
   
   **Note:** The `004_create_waitlist_table.sql` script is already included in `schemas/schema.sql`, so you don't need to run it separately. The `002_create_triggers.sql` is also redundant as triggers are included in the main schema.

4. **Verify the setup:**
   - Check that all tables were created successfully in the Supabase Table Editor
   - Verify that the `profiles` table exists (it's created automatically via trigger when users sign up)
   - Check that storage buckets (`organizations`, `contracts`, `evidences`) were created in Storage settings
   - Verify that initial data (continents, countries) was populated

5. **Important Security Note:**
   - [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) is **not yet fully implemented** in all tables
   - For production environments, you **must** add RLS policies to all tables
   - The `waitlist` table has RLS enabled as an example

### 7. Generate Database Types

To ensure full TypeScript safety, generate types from your Supabase instance:

```bash
# This will generate types from your remote Supabase DB
pnpm db:types:remote
```

This creates/updates the types in `lib/supabase/types/database.gen.ts`.

### 8. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development Workflow

### Step 1: Sync with Upstream

Before starting any new work, always sync your local repository with the upstream:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream/main into your main branch
git merge upstream/main

# Push the updated main branch to your fork
git push origin main
```

### Step 2: Create a Feature Branch

**Always create a new branch for each feature, bugfix, or change.** Never commit directly to `main`.

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-description
# or
git checkout -b docs/your-documentation-update
```

**Branch Naming Conventions:**
- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks (dependencies, config, etc.)

Examples:
```bash
git checkout -b feature/add-user-profile-page
git checkout -b fix/resolve-escrow-funding-bug
git checkout -b docs/update-api-documentation
git checkout -b refactor/optimize-database-queries
```

### Step 3: Make Your Changes

1. Write your code following the [Code Standards](#code-standards)
2. Make sure your code passes all checks:
   ```bash
   pnpm lint
   pnpm check
   ```

### Step 4: Commit Your Changes

Follow the [Atomic Commits](#atomic-commits) guidelines below.

### Step 5: Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### Step 6: Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template (if available)
4. Link any related issues
5. Request reviews from maintainers

## Git Contribution Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type** (required):
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, or tooling
- `ci`: Changes to CI configuration files and scripts

**Scope** (optional):
- The area of the codebase affected (e.g., `auth`, `escrow`, `ui`, `db`)

**Subject** (required):
- Short, imperative description (50 chars or less)
- No period at the end
- Use present tense: "add" not "added" or "adds"

**Body** (optional):
- Detailed explanation of what and why
- Wrap at 72 characters
- Can include multiple paragraphs

**Footer** (optional):
- Reference to issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

**Examples:**

```bash
feat(escrow): add automatic payment release on milestone approval

Implement the logic to automatically trigger escrow contract
payment release when a client approves a milestone. This includes
UI updates, API integration, and error handling.

Closes #123
```

```bash
fix(auth): resolve Google OAuth redirect issue

The OAuth callback was failing due to incorrect redirect URI
configuration. Updated the callback handler to properly validate
and process the OAuth response.

Fixes #456
```

```bash
docs(readme): update installation instructions

Add missing steps for Supabase database setup and environment
variable configuration.
```

## Branch Strategy

### Branch Lifecycle

1. **Create** a branch from `main` (synced with upstream)
2. **Work** on your feature/fix in isolation
3. **Keep** your branch up-to-date with upstream `main`:
   ```bash
   # While on your feature branch
   git fetch upstream
   git rebase upstream/main
   ```
4. **Push** your branch to your fork
5. **Create** a Pull Request
6. **Delete** the branch after the PR is merged

### Branch Best Practices

✅ **DO:**
- Create a new branch for each logical change
- Keep branches focused on a single feature or fix
- Keep branches up-to-date with upstream `main`
- Use descriptive branch names
- Delete branches after they're merged

❌ **DON'T:**
- Commit directly to `main`
- Work on multiple unrelated features in one branch
- Use generic branch names like `fix` or `update`
- Let branches become stale (outdated with `main`)

## Atomic Commits

**Atomic commits** are commits that represent a single, logical change. Each commit should be:
- **Focused**: One logical change per commit
- **Complete**: The code should compile and pass tests
- **Independent**: Can be understood on its own
- **Reversible**: Can be reverted without breaking other changes

### Why Atomic Commits?

- Easier code reviews
- Better git history and debugging
- Simpler rollbacks
- Clearer project evolution

### Examples

❌ **Bad - Multiple changes in one commit:**
```bash
git commit -m "Update project page and fix auth bug and add new button"
```

✅ **Good - Separate atomic commits:**
```bash
git commit -m "feat(projects): add milestone progress indicator to project page"

git commit -m "fix(auth): resolve session expiration handling"

git commit -m "feat(ui): add primary CTA button to dashboard"
```

### Commit Workflow

1. **Stage related changes only:**
   ```bash
   # Stage only the files related to one logical change
   git add app/(dashboard)/projects/page.tsx
   git add components/ProjectCard.tsx
   git commit -m "feat(projects): implement project card component"
   ```

2. **Stage the next logical change:**
   ```bash
   git add lib/hooks/useProjectData.ts
   git commit -m "feat(projects): add custom hook for project data fetching"
   ```

3. **Use interactive staging for fine-grained control:**
   ```bash
   git add -p  # Stage parts of files interactively
   ```

### Splitting Large Changes

If you've made many changes and want to split them into atomic commits:

```bash
# Stage only the files you want in the first commit
git add file1.ts file2.ts
git commit -m "feat(feature): implement core functionality"

# Stage the next set of changes
git add file3.ts file4.ts
git commit -m "feat(feature): add error handling"

# Continue for remaining changes
```

## Pull Request Process

### Before Submitting

1. ✅ Sync your branch with upstream `main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. ✅ Ensure all checks pass:
   ```bash
   pnpm lint
   pnpm check
   ```

3. ✅ Test your changes locally:
   ```bash
   pnpm dev
   ```

4. ✅ Write clear commit messages following our guidelines

5. ✅ Update documentation if needed

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123
Fixes #456

## Testing
Describe the tests you ran and how to verify your changes.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Update your branch with new commits (don't force-push after review starts unless asked)
4. Once approved, a maintainer will merge your PR

## Code Standards

### TypeScript

- **No `any` types**: Always use proper TypeScript types
- **Strict typing**: Use the generated Supabase types from `lib/supabase/types/`
- **Type safety**: Leverage TypeScript's type system fully

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Trailing commas**: Yes
- **File length**: Keep files under 300 lines (refactor if needed)

### Styling

- **Use TailwindCSS**: All styling must use Tailwind classes
- **Conditional classes**: Use `clsx` or `cn` helper
- **Colors**: Use CSS variables from `globals.css`, not arbitrary hex codes
- **No inline styles**: Except for dynamic values

### Component Structure

- **Route-specific components**: Place in `_components` folder within the route
- **Reusable components**: Place in root `components/` folder
- **UI primitives**: Place in `components/ui/`

### Naming Conventions

- **Directories**: `kebab-case` (e.g., `app/trustless/`)
- **Components**: `PascalCase` (e.g., `ProjectCard.tsx`)
- **Hooks**: `useThing` (e.g., `useProjectCreation.ts`)
- **Event handlers**: Start with `handle` (e.g., `handleClick`, `handleSubmit`)

## Testing

### Before Submitting

1. **Lint check:**
   ```bash
   pnpm lint
   ```

2. **Type check:**
   ```bash
   pnpm check
   ```

3. **Manual testing:**
   - Test your changes in the development environment
   - Test edge cases and error scenarios
   - Verify responsive design (mobile/tablet/desktop)

### Writing Tests

When adding new features, include tests:
- Unit tests for utility functions
- Integration tests for API routes
- Component tests for UI components

## Getting Help

- **Questions?** Open a discussion in the GitHub Discussions tab
- **Found a bug?** Open an issue with a clear description
- **Need clarification?** Comment on the relevant issue or PR

## Recognition

Contributors will be recognized in:
- The project's README.md
- Release notes
- Project documentation

Thank you for contributing to Koopay! 🚀
