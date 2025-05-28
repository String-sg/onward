# Onward

## 🛠️ Setup

1. Install `pnpm` if you don't have it already.

```sh
brew install pnpm
```

2. Install dependencies.

```sh
pnpm install
```

3. Run the bootstrap script.

```sh
./bootstrap.sh
```

## 🚀 Quick Start

### Learner

```sh
pnpm learner:dev
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command              | Action                            |
| :------------------- | :-------------------------------- |
| `pnpm learner:dev`   | Starts the `learner` dev server   |
| `pnpm learner:build` | Builds the `learner` application  |
| `pnpm auth:build`    | Builds the `@onward/auth` library |
| `pnpm format`        | Format the entrie codebase        |
| `pnpm lint`          | Lint the entire codebase          |
