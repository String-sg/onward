# Onward

## 🛠️ Setup

1. **Install `pnpm`** (if you don't have it already):

```sh
brew install pnpm
```

2. **Install dependencies**:

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

## 🚀 Quick Start

### Creator

```sh
pnpm --filter="@onward/creator" dev
```

### Learner

```sh
pnpm --filter="@onward/learner" dev
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command            | Action                                       |
| :----------------- | :------------------------------------------- |
| `pnpm db:generate` | Generate database client and other artifacts |
| `pnpm db:migrate`  | Create and apply database migrations         |
| `pnpm db:deploy`   | Apply pending database migrations            |
| `pnpm bootstrap`   | Build internal dependencies                  |
| `pnpm format`      | Format codebase                              |
| `pnpm lint`        | Lint codebase                                |
