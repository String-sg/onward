# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0 (2025-10-06)

### Features ✨

- feat: add S3 proxy endpoint for podcasts ([#255](https://github.com/String-sg/onward/pull/255)) ([3450f78](https://github.com/String-sg/onward/commit/3450f7895f31cc36a87b5d16048fd26705d93fa4))
- feat: create favicon for glow ([#256](https://github.com/String-sg/onward/pull/256)) ([d122686](https://github.com/String-sg/onward/commit/d122686d712c6f0d8def21988079563d092719fd))
- feat: customize the Tailwind typography prose-slate for chat markdown UI ([#243](https://github.com/String-sg/onward/pull/243)) ([d2e8c73](https://github.com/String-sg/onward/commit/d2e8c73597cf7d9c07860c4e86ede1eeb70a77f1))
- feat: add `CLUSTER_HOSTNAME` env to weaviate container ([#252](https://github.com/String-sg/onward/pull/252)) ([7af4cec](https://github.com/String-sg/onward/commit/7af4cec764925021c306361fb2ea9f66940e16cd))
- feat(learner): update empty states and error page ([#250](https://github.com/String-sg/onward/pull/250)) ([28f50c4](https://github.com/String-sg/onward/commit/28f50c44a26bdf974e21fdf0cc04fc6168130c67))
- feat(learner): add dynamic `learning collection page` with content data ([#230](https://github.com/String-sg/onward/pull/230)) ([853dad7](https://github.com/String-sg/onward/commit/853dad75ab25859d86db28465bbe71470433fc4f))
- feat(learner): integrate quiz content with backend ([#238](https://github.com/String-sg/onward/pull/238)) ([18aa067](https://github.com/String-sg/onward/commit/18aa067e05293921d2fe4d7cef290190afdc8c9e))
- feat(learner): sanitize chat assistant message ([#237](https://github.com/String-sg/onward/pull/237)) ([920c626](https://github.com/String-sg/onward/commit/920c626ddc77079bb51f1bc72d324ba0f35e56ad))

### Bug Fixes 🐛

- fix(learner): use `sessionStorage` to store origin path when navigating to learning unit page ([#211](https://github.com/String-sg/onward/pull/211)) ([bba2030](https://github.com/String-sg/onward/commit/bba2030cbb46e950e107c83d31adcf5a7e62735d))

### Chores 🧹

- chore(learner): add ssl cert to docker ([#248](https://github.com/String-sg/onward/pull/248)) ([2fce719](https://github.com/String-sg/onward/commit/2fce719f8cad036deb86180b6d918dfac7698ba8))
- chore: add OpenAI env variables ([#247](https://github.com/String-sg/onward/pull/247)) ([94b9d44](https://github.com/String-sg/onward/commit/94b9d442bcf654be88a32fda1c07484d9da896c8))

## 0.0.2 (2025-09-30)

### CI 🤖

- ci: add missing permission to release workflow ([#245](https://github.com/String-sg/onward/pull/245)) ([b774ef7](https://github.com/String-sg/onward/commit/b774ef7b336ad5c13e13c8a767749aac9b8f57d3))

## 0.0.1 (2025-09-30)

### Experimental 🧪

- Initial release to validate the release workflow
- Test deployment to staging to verify image and rollout
