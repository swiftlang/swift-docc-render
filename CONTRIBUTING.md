# Contributing to Swift-DocC-Render

## Introduction

### Welcome

Thank you for considering contributing to Swift-DocC-Render.

Please know that everyone is welcome to contribute to Swift-DocC-Render.
Contributing doesn’t just mean submitting pull requests—there
are many different ways for you to get involved,
including answering questions on the 
[Swift Forums](https://forums.swift.org/c/development/swift-docc),
reporting or screening bugs, and writing documentation. 

No matter how you want to get involved,
we ask that you first learn what’s expected of anyone who participates in
the project by reading the [Swift Community Guidelines](https://swift.org/community/)
as well as our [Code of Conduct](/CODE_OF_CONDUCT.md).

This document focuses on how to contribute code and documentation to
this repository.

### Legal

By submitting a pull request, you represent that you have the right to license your
contribution to Apple and the community, and agree by submitting the patch that your 
contributions are licensed under the Apache 2.0 license (see [`LICENSE.txt`](/LICENSE.txt)).

## Contributions Overview

Swift-DocC-Render is an open source project and we encourage contributions
from the community.

### Contributing Code and Documentation

Before contributing code or documentation to Swift-DocC-Render
we encourage you to first create an issue on [GitHub](https://github.com/swiftlang/swift-docc-render/issues/new/choose)
for a bug report or feature request.
This will allow us to provide feedback on the proposed change.
However, this is not a requirement. If your contribution is small in scope,
feel free to open a PR without first creating an issue.

All changes to Swift-DocC-Render source must go through the PR review process before
being merged into the `main` branch.
See the [Code Contribution Guidelines](#code-contribution-guidelines) below for
more details.

## Build and Run Swift-DocC-Render

### Run Steps

> Note: requires [Node.js](https://nodejs.org/en/download/) v18
> and [npm](https://www.npmjs.com/package/npm) v9.5. An easy way to set these up is to install
> [nvm](https://github.com/nvm-sh/nvm) and run `nvm install` from within the Swift-DocC-Render
> repository. To use these versions as the default, add `--default` to the installation command.

1. Checkout this repository using:

    ```shell
    git clone git@github.com:apple/swift-docc-render.git
    ```

2. Navigate to the root of your cloned repository with:

    ```shell
    cd swift-docc-render
    ```

3. Install dependencies:

    ```shell
    npm install
    ```

4. Run a local server with hot reload at [localhost:8080](http://localhost:8080/)

    You may want to set an http endpoint as a proxy to handle data requests while developing locally.

    ```shell
    VUE_APP_DEV_SERVER_PROXY=https://localhost:8000 npm run serve
    ```

    As an alternative you can just create a `.env.development.local` file on the root of the project to add the `VUE_APP_DEV_SERVER_PROXY` env varible so you don't have to set it in the `npm run serve` script each time.
    
### Build Steps

To build Swift-DocC-Render for deployment, run the command below. The output will be generated inside the `dist` folder:

```shell
npm run build
```

## Testing Swift-DocC-Render using data from Swift-DocC

Follow [these steps](https://github.com/apple/swift-docc#using-docc-to-build-and-preview-documentation) to generate a documentation archive, set the path to your renderer and render locally your documentation using Swift-DocC-Render.

## Code Contribution Guidelines

### Overview

- Do your best to keep the git history easy to understand.
  
- Use informative commit titles and descriptions.
  - Include a brief summary of changes as the first line.
  - Describe everything that was added, removed, or changed, and why.

- All changes must go through the pull request review process.

### Pull Request Preparedness Checklist

When you're ready to have your change reviewed, please make sure you've completed the following requirements:

- [x] Add Swift's license header to the new files.

- [x] Add tests to cover any new functionality or to prevent regressions of a bug fix.

- [x] Run the `npm run test` script and confirm that the unit test, lint and license header checks pass.

- [x] Add source code documentation to all added coded that explains
  the new behavior.

### Opening a Pull Request

When opening a pull request, please make sure to fill out the pull request template
and complete all tasks mentioned there.

Your PR should mention the number of the [GitHub issue](https://github.com/swiftlang/swift-docc-render/issues)
issue your work is addressing (#NNN).
  
Most PRs should be against the `main` branch. If your change is intended 
for a specific release, you should also create a separate branch 
that cherry-picks your commit onto the associated release branch.

### Code Review Process

All PRs will need approval from someone on the core team
(someone with write access to the repository) before being merged.

## Testing and Linting

Swift-DocC-Render is committed to maintaining a high level of code quality.
Before opening a pull request, we ask that you:

1. Run the full test suite and confirm that it passes.

2. Write new tests to cover any changes you made.

### Tests and linting

Run the following script to:
- Run unit tests with [Jest](https://jestjs.io/)
- Find syntax errors with [ESLint](https://eslint.org/)
- Check that all files have license headers

```shell
npm run test
```

Run an individual unit test suite:

```shell
npm run test:unit tests/unit/path/to/spec.js
```

Run unit tests and watch for changes:

```shell
npm run test:unit:watch
```

To manually lint your code for style issues, you can run the [ESLint](https://eslint.org/) suite:

```shell
npm run lint
```

If you want the linter to automatically fix the errors it finds, run:

```shell
npm run lint:fix
```

## Your First Contribution

Unsure of where to begin contributing to Swift-DocC-Render? You can start by looking at
the bugs in the `Swift-DocC-Render` issues list with the `good first issue` label on
[GitHub](https://github.com/swiftlang/swift-docc-render/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22).

Once you've found an issue to work on,
follow the above instructions for [Building Swift-DocC-Render](#build-and-run-swift-docc-render).

<!-- Copyright (c) 2025 Apple Inc and the Swift Project authors. All Rights Reserved. -->
