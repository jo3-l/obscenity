# Contributing

If you wish to contribute to Obscenity, feel free to fork the repository and submit a pull request. We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to enforce a consistent code style and catch possible issues; setting up relevant plugins for your editor of choice is highly recommended.

If you are planning on contributing to the pattern matcher, the [internals document](./INTERNALS.md) may be of interest to you.

## Setup

**Prerequisites:** Node.js (preferably latest version, but any version >= 12 will work), and [pnpm](https://pnpm.io/) for managing packages.

1. Fork & clone the main repository.
2. Create a new branch for your changes: `git checkout -b feat/my-feature`.
3. Run `pnpm install` to install all dependencies.
4. Make your changes.
5. Run `pnpm lint` and `pnpm style` to lint and format the code. Then, run `pnpm test` to make sure all the tests are still passing after your change.
6. Commit your changes (make sure you follow our commit convention, which is based off [Angular's commit message guidelines](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular)).
7. Submit a [pull request](https://github.com/jo3-l/obscenity/pulls).
