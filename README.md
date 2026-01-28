# Swift-DocC-Render

Swift-DocC-Render is a web Single Page Application (SPA) powered by [Vue.js](https://vuejs.org/) for creating rich code documentation websites. Pages and content are generated using render JSON data from DocC. It comes with a well suited design for documentation websites.
SPAs are web apps that render dynamically at runtime entirely in the browser, using JavaScript.

[Swift-DocC](https://github.com/swiftlang/swift-docc) is a tool for building and previewing documentation, aimed at making it easy to generate reference documentation from frameworks and packages, as well as free-form articles and tutorials authored in Markdown. It produces a folder in the Documentation Archive format (extension `.doccarchive`), which contains a machine-readable output of the documentation as JSON data that Swift-DocC-Render uses to produce rendered documentation.

## Getting Started

> Note: requires [Node.js](https://nodejs.org/en/download/) v22.17.0
> and [npm](https://www.npmjs.com/package/npm) v10.9.2. An easy way to set these up is to install
> [nvm](https://github.com/nvm-sh/nvm) and run `nvm install` from within the Swift-DocC-Render
> repository. To use these versions as the default, add `--default` to the installation command.

1. **Download this repository and go to its folder**

    ```shell
    git clone https://github.com/swiftlang/swift-docc-render.git
    cd swift-docc-render
    ```

2. **Install dependencies**

    ```shell
    npm install
    ```

3. **Run a local server with hot reload at [localhost:8080](http://localhost:8080/)**

    You may want to set a proxy to handle data requests while developing locally by setting the VUE_APP_DEV_SERVER_PROXY env variable to a documentation archive (.doccarchive or .docc-build) on your disk or served in a HTTP endpoint:

    ```shell
    VUE_APP_DEV_SERVER_PROXY=[path to documentation archive] npm run serve
    ```

    As an alternative you can just create a `.env.development.local` file on the root of the project to add the `VUE_APP_DEV_SERVER_PROXY` env variable so you don't have to set it in the `npm run serve` script each time.

## Using Swift-DocC-Render to render documentation

Follow [these steps](https://github.com/swiftlang/swift-docc#using-docc-to-build-and-preview-documentation) to generate a documentation archive, set the path to your renderer and render locally your documentation using Swift-DocC-Render.

## Rendering and building docs

You need to have [DocC](https://swift.org/documentation/docc) installed, in order to preview and build documentation. Read [Getting Started with Swift](https://www.swift.org/getting-started/) to learn more.

To preview the docs, run `npm run docs:preview`. This will spawn a preview server on http://localhost:8000/documentation/swiftdoccrender.

To build the docs, run `npm run docs:build`.

## Bug Reports and Feature Requests

### Submitting a Bug Report

Swift-DocC-Render tracks all bug reports with [GitHub](https://github.com/swiftlang/swift-docc-render/issues).
When you submit a bug report we ask that you follow the
Swift [Bug Reporting](https://swift.org/contributing/#reporting-bugs) guidelines
and provide as many details as possible.

If you can confirm that the bug occurs when using the latest commit of Swift-DocC
from the `main` branch (see [Building Swift-DocC-Render](/CONTRIBUTING.md#build-and-run-swift-docc-render)),
that will help us track down the bug faster.

### Submitting a Feature Request

For feature requests, please feel free to create an issue
on [GitHub](https://github.com/swiftlang/swift-docc-render/issues/new?assignees=&labels=New+Feature&projects=&template=FEATURE_REQUEST.yml) with the `New Feature` type
or start a discussion on the [Swift Forums](https://forums.swift.org/c/development/swift-docc).

Don't hesitate to submit a feature request if you see a way
Swift-DocC-Render can be improved to better meet your needs.

All user-facing features must be discussed
in the [Swift Forums](https://forums.swift.org/c/development/swift-docc)
before being enabled by default.

## Contributing to DocC

Please see the [contributing guide](/CONTRIBUTING.md) for more information.

<!-- Copyright (c) 2021 Apple Inc and the Swift Project authors. All Rights Reserved. -->
