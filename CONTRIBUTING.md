# Contributing to Onward 👋

First off, thank you for your interest in contributing to Onward! We welcome any form of contribution, including but not limited to:

- Reporting bugs
- Suggesting enhancements
- Contributing code (bug fixes, new features)
- Improving documentation
- Answering questions and helping others in the community

## How Can I Contribute?

### Reporting Bugs

If you encounter a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/string-sg/onward/issues).

If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/string-sg/onward/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample or an executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please ensure it hasn't already been suggested by searching on GitHub under [Issues](https://github.com/string-sg/onward/issues).

If you're unable to find an open issue discussing the enhancement, [open a new one](https://github.com/string-sg/onward/issues/new). Provide a **clear and detailed explanation** of the feature, **why it's needed**, and potential **implementation approaches** if you have them.

### Code Contributions (Pull Requests)

We enthusiastically welcome code contributions via Pull Requests (PRs)! If you're planning to contribute, please follow these guidelines:

1. **Discuss First (for significant changes):** If you're proposing a major change, new feature, or significant refactoring, please [open an issue](https://github.com/string-sg/onward/issues/new) first to discuss the approach and ensure it aligns with the project's goals. For smaller bug fixes, feel free to go straight to a PR.

2. **Fork & Branch:**
   - Fork the repository on GitHub.
   - Clone your fork locally.
   - Create a descriptive branch from the `main` branch. Good branch names include the type of change and a short description (e.g. `fix/login-bug`, `feat/add-user-profile`, `docs/update-readme`).
     ```sh
     git switch main
     git pull origin main
     git switch -c feat/your-feature-name
     ```

3. **Set Up Environment:** Follow the instructions in the [Development Setup](#development-setup) section to prepare your local environment.

4. **Implement Changes:**
   - Write your code, adhering to the guidelines in the [Code Style Guidelines](#code-style-guidelines) section.
   - Ensure your changes address the intended issue or feature.

5. **Write Tests:**
   - Add relevant unit or integration tests for any new functionality or bug fixes. We aim for good test coverage to maintain stability.
   - Ensure all tests pass by running:
     ```sh
     pnpm -r test
     ```

6. **Update Documentation:** If your changes affect user-facing features, internal APIs, or the development process, please update the relevant documentation (e.g. README, specific docs pages).

7. **Commit Changes:**
   - Keep your commits logical and atomic.
   - Write clear and concise commit messages. We recommend following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification (e.g. `fix: correct typo in contribution guide`, `feat: add user authentication`). This helps automate release notes and makes the history easier to understand.
   - Remember that `husky` hooks will run `lint-staged` and potentially other checks (like type checking on push) automatically.

8. **Push and Open Pull Request:**
   - Push your branch to your fork on GitHub.
   - Open a Pull Request (PR) targeting the `main` branch of the `string-sg/onward` repository.
   - Provide a clear title and description for your PR. **The PR title should also follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format.** Explain the "what" and "why" of your changes. Link to any relevant issues (e.g. "Closes #123").
   - Ensure your PR is focused on a single task. If you have multiple unrelated changes, please submit them as separate PRs.

#### Pull Request Process

1. **Review:** Maintainers will review your PR. Automated checks (CI tests, linting, etc.) must pass.
2. **Feedback:** Reviewers may provide feedback or request changes. Please address these comments and push updates to your branch (the PR will update automatically). Engage in discussion if clarification is needed.
3. **Approval & Merge:** Once the PR is approved by the maintainers and all checks have passed, it will be merged into the `main` branch. Congratulations and thank you for your contribution! 🎉

## Development Setup

To contribute code, you'll need to set up your development environment.

**Prerequisites:**

- **Node.js:** Version 22 or 23. You can use a version manager like [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
- **pnpm:** We use `pnpm` for package management. Install it using Homebrew: `brew install pnpm`, or follow the official [pnpm installation guide](https://pnpm.io/installation) for other systems.

**Steps:**

1. **Clone your fork:**
   Replace `YOUR_USERNAME` with your actual GitHub username.

   ```sh
   git clone git@github.com:YOUR_USERNAME/onward.git
   cd onward
   ```

2. **Install dependencies using `pnpm`:**

   ```sh
   pnpm install
   ```

3. **Set up the local environment**:

   ```sh
   ./setup.sh
   ```

4. **Start required local services**:

   ```sh
   docker compose up -d valkey postgres
   ```

   > 💡 You can stop the services later with `docker compose down`.

5. **Run tests:**

   ```sh
   pnpm -r test
   ```

## Code Style Guidelines

We use [Prettier](https://prettier.io/) for code formatting and [ESLint](https://eslint.org/) to enforce consistent coding styles and catch potential errors.

To streamline the development process, we utilize:

- **`lint-staged`**: Automatically formats and lints only the files staged for commit.
- **`husky`**: Manages Git hooks to ensure code quality before commits and pushes.
  - **Pre-commit**: Runs `lint-staged` (which executes `prettier` and `eslint`) on staged files.
  - **Pre-push**: Runs TypeScript type checking (`tsc`) and SvelteKit checks (`svelte-check`) to catch type errors before pushing changes.

While these tools automate checks, you can also run them manually:

- **Format code:**
  ```sh
  pnpm format
  ```
- **Lint code:**
  ```sh
  pnpm lint
  ```
- **Run all checks (type checking and SvelteKit validation):**
  ```sh
  pnpm -r check
  ```

## Code of Conduct

We expect all contributors and participants to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please ensure you are familiar with its contents and follow the guidelines for reporting any violations.
