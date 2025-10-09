# Changelog

All notable changes to this project will be documented in this file.

## 0.2.2 (2025-10-09)

### Bug Fixes 🐛

- fix: remove unnecessary slash in the key when getting podcast object ([#271](https://github.com/String-sg/onward/pull/271))([f428eef](https://github.com/String-sg/onward/commit/f428eeff))

### Chores 🧹

- chore(learner): center text in empty state ([#270](https://github.com/String-sg/onward/pull/270))([f682481](https://github.com/String-sg/onward/commit/f682481))
- chore(learner): add anchor tag to home when logo and text are clicked ([#269](https://github.com/String-sg/onward/pull/269))([746ab9c](https://github.com/String-sg/onward/commit/746ab9c))
- chore(learner): fix typo on empty state ([#268](https://github.com/String-sg/onward/pull/268))([69ad2b2](https://github.com/String-sg/onward/commit/69ad2b2))

## 0.2.1 (2025-10-09)

### Bug Fixes 🐛

- fix: update dockerfile path ([#266](https://github.com/String-sg/onward/pull/266))([53d2e3a](https://github.com/String-sg/onward/commit/53d2e3a554aaeac0c0ae7c9d6a495346c8838c7f))

## 0.2.0 (2025-10-09)

### Features ✨

- feat(learner): add playback support for player ([#262](https://github.com/String-sg/onward/pull/262))([d9ffba3](https://github.com/String-sg/onward/commit/d9ffba30f22ae2ffb7ce4b25f10f649c041ae9c7))
- feat(learner): Add Podcast Completion Modal ([#258](https://github.com/String-sg/onward/pull/258))([fdb16dc](https://github.com/String-sg/onward/commit/fdb16dc73e17973624f7e1b2dc2d49bd08996195))
- feat(learner): add dynamic data for home page and update empty state ([#263](https://github.com/String-sg/onward/pull/263))([678175e](https://github.com/String-sg/onward/commit/678175e4042cbcfb8d751aac7f69e7581fe92225))
- feat(learner): Create learning journey record ([#254](https://github.com/String-sg/onward/pull/254))([e5801bd](https://github.com/String-sg/onward/commit/e5801bd75505607af82b931749b788999b97bc69))
- feat(learner): add avatarURL in layout and profile page ([#260](https://github.com/String-sg/onward/pull/260))([a192c1b](https://github.com/String-sg/onward/commit/a192c1b837d257de8afa22728e521c6a2d951fc6))
- feat(learner): update quiz completion status after finishing quiz ([#251](https://github.com/String-sg/onward/pull/251))([96d9099](https://github.com/String-sg/onward/commit/96d9099c2402e34d88c8f1ff9d252ed1d6bb709f))

### Chores 🧹

- chore(learner): update support email ([#264](https://github.com/String-sg/onward/pull/264))([a75b846](https://github.com/String-sg/onward/commit/a75b84698a74828d36c0e89623f2811ab07430d8))
- chore(learner): rename app to glow ([#261](https://github.com/String-sg/onward/pull/261))([79586b7](https://github.com/String-sg/onward/commit/79586b7da1cd224934288660d3986dcfee57ef83))
- refactor: revert to single-repo structure ([#259](https://github.com/String-sg/onward/pull/259))([fc9bab4](https://github.com/String-sg/onward/commit/fc9bab480d0107c5851f0a9acf28fa51f2e8f757))

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
