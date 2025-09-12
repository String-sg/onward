# Onward

A professional development platform that empowers teachers with flexible, personalized, and bite-sized learning resources — delivering practical growth opportunities that fit seamlessly into busy teaching schedules.

## 🚀 Quick Start

Please ensure that you have completed the required [development setup](./CONTRIBUTING.md#development-setup) before proceeding.

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

## Contributing

Contributions to Onward are welcome and highly appreciated. However, before you jump right into it, we would like you to review our [Contribution Guidelines](./CONTRIBUTING.md) to make sure you have a smooth experience contributing to Onward.
