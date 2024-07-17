# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.2](https://github.com/jo3-l/obscenity/compare/v0.2.1...v0.2.2) (2024-07-17)


### Features

* **english-preset:** add more blacklisted terms ([#50](https://github.com/jo3-l/obscenity/issues/50)) ([4653de5](https://github.com/jo3-l/obscenity/commit/4653de51e63bd3457daca57316c2b2c851752072))


### Bug Fixes

* **english-preset:** whitelist 'kung-fu' ([d60b4f4](https://github.com/jo3-l/obscenity/commit/d60b4f4b766592785ba7c9c51d6d0607c5f26c57)), closes [#67](https://github.com/jo3-l/obscenity/issues/67)

### [0.2.1](https://github.com/jo3-l/obscenity/compare/v0.2.0...v0.2.1) (2024-03-03)


### Features

* **english-preset:** add more blacklisted terms ([#50](https://github.com/jo3-l/obscenity/issues/50)) ([c189595](https://github.com/jo3-l/obscenity/commit/c189595b09554899aeead3dd070d36f8f3269150))

## [0.2.0](https://github.com/jo3-l/obscenity/compare/v0.1.4...v0.2.0) (2024-01-05)


### ⚠ BREAKING CHANGES

* **english-preset:** Using the default English preset, Obscenity will no longer strip non-alphabetic characters from the input text before matching.

This addresses a class of egregious false negatives in previous versions (see #23), but introduces a regression where cases such as 'f u c k' (with the space) will no longer be detected by default. We expect to provide a more comprehensive fix in the next minor release.

If desired, it remains possible to revert to the previous behavior by providing a custom set of transformers to the matcher.
* **matchers:** The NfaMatcher class has been removed. Use the RegExpMatcher instead.

### Features

* **english-preset:** blacklist 'shit' by default ([b0d90aa](https://github.com/jo3-l/obscenity/commit/b0d90aa4b7dd6d15a2105490f1d2b0c87e58bdcf)), closes [#47](https://github.com/jo3-l/obscenity/issues/47)


### Bug Fixes

* **english-preset:** don't include skip-non-alphabetic transformer ([620c721](https://github.com/jo3-l/obscenity/commit/620c721662c3ddd8d8ca8838861b9c4ba3ea66e7)), closes [#23](https://github.com/jo3-l/obscenity/issues/23) [#46](https://github.com/jo3-l/obscenity/issues/46)
* **english-preset:** remove extraneous patterns for n-word ([e135be5](https://github.com/jo3-l/obscenity/commit/e135be58510149db9b678801a2e6e3468b3bd4bb)), closes [#48](https://github.com/jo3-l/obscenity/issues/48)
* **pkg:** ensure types resolve in ESM ([718da8a](https://github.com/jo3-l/obscenity/commit/718da8a7399c0dcf948fbe8041714ad6d61c9f73)), closes [#44](https://github.com/jo3-l/obscenity/issues/44)


* **matchers:** remove NfaMatcher ([b69c21d](https://github.com/jo3-l/obscenity/commit/b69c21d178ac5e3270fd35d2b876263045a67d81))

### [0.1.4](https://github.com/jo3-l/obscenity/compare/v0.1.1...v0.1.4) (2023-06-06)

### Bug Fixes

- **matchers:** gracefully handle empty patterns ([#31](https://github.com/jo3-l/obscenity/issues/31)) ([79cfa63](https://github.com/jo3-l/obscenity/commit/79cfa630c964be79d1dc16eb0e5d65af4d68e7ab))

### 0.1.1, 0.1.2, 0.1.3

Versions skipped due to temporary issue with release workflow.

## 0.1.0 (2021-08-27)

Initial release.
