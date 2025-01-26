# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.3](https://github.com/jo3-l/obscenity/compare/v0.4.2...v0.4.3) (2025-01-26)


### Bug Fixes

* **preset/english:** match 'shit' at end of word ([0299b49](https://github.com/jo3-l/obscenity/commit/0299b4978dec6d218a4e004fe20962a79500fe7c)), closes [#47](https://github.com/jo3-l/obscenity/issues/47)

### [0.4.2](https://github.com/jo3-l/obscenity/compare/v0.4.1...v0.4.2) (2025-01-18)


### Features

* add more characters to leet transformer ([#78](https://github.com/jo3-l/obscenity/issues/78)) ([fa673e6](https://github.com/jo3-l/obscenity/commit/fa673e66226e13388401274610e7d1bd0801ade0))


### Bug Fixes

* **censor:** don't generate the same character twice in a row ([#85](https://github.com/jo3-l/obscenity/issues/85)) ([58f2715](https://github.com/jo3-l/obscenity/commit/58f271556aa878e619457054f8a2f423e8b574ca)), closes [#82](https://github.com/jo3-l/obscenity/issues/82)
* **preset/english:** add word boundary to 'shit' pattern ([9554e7c](https://github.com/jo3-l/obscenity/commit/9554e7cc7b796f64a80baa272ed3e49ad03466a3)), closes [#93](https://github.com/jo3-l/obscenity/issues/93)
* **preset/english:** whitelist "fick" ([#88](https://github.com/jo3-l/obscenity/issues/88)) ([40f66fb](https://github.com/jo3-l/obscenity/commit/40f66fb17524f49b1e4be6a2fe1037f3e1b468c2))

### [0.4.1](https://github.com/jo3-l/obscenity/compare/v0.4.0...v0.4.1) (2024-12-03)


### Bug Fixes

* **preset/english:** add "fickle" to whitelist ([#87](https://github.com/jo3-l/obscenity/issues/87)) ([da754da](https://github.com/jo3-l/obscenity/commit/da754da8d42cf4b36534141b2ceafaa4810b99b5))
* **preset/english:** remove erroneous patterns for `dick` ([e43d502](https://github.com/jo3-l/obscenity/commit/e43d50260d8f3c55374bd1da65be0dff33a1fd6d)), closes [#86](https://github.com/jo3-l/obscenity/issues/86)

## [0.4.0](https://github.com/jo3-l/obscenity/compare/v0.3.1...v0.4.0) (2024-08-02)


### ⚠ BREAKING CHANGES

* **regexp-matcher:** Passing an empty whitelisted term to the RegExpMatcher will result in a runtime error.

This was unsupported previously and likely did not work correctly. Make it a real error.

### Bug Fixes

* **regexp-matcher:** advance index correctly in whitelist matcher ([ebf95ad](https://github.com/jo3-l/obscenity/commit/ebf95add62be8297f693ca6d8aafefc10afc1a8b)), closes [#49](https://github.com/jo3-l/obscenity/issues/49)
* **regexp-matcher:** correctly remap to original indices in all cases ([3a49579](https://github.com/jo3-l/obscenity/commit/3a49579f3c242d3e159e88707df090e3f6dc0121)), closes [#71](https://github.com/jo3-l/obscenity/issues/71)
* **regexp-matcher:** reject empty whitelist terms ([9a46113](https://github.com/jo3-l/obscenity/commit/9a461130b98920e22d5acf92650146ae48d2226b))

### [0.3.1](https://github.com/jo3-l/obscenity/compare/v0.3.0...v0.3.1) (2024-07-17)

## [0.3.0](https://github.com/jo3-l/obscenity/compare/v0.2.2...v0.3.0) (2024-07-17)


### ⚠ BREAKING CHANGES

* The library no longer exports a version constant.

* drop version constant ([2810674](https://github.com/jo3-l/obscenity/commit/2810674de20d82d7372c617d2e8ef76e911f27ad))

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
