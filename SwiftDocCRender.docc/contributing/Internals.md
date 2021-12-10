# Learn about DocC-Render's internals

Learn how DocC-Render is built internally, the principles behind its structure, and how the components interact.

## Overview

DocC-Render supports rendering reference pages, tutorials, and articles to document your project in a structured manner.

Each page fetches its required render JSON asynchronously, from the `/data` directory. To learn more about the types of pages DocC-Render supports, visit the [DocC Docs](https://www.swift.org/documentation/docc).

### Modular Architecture

Even though `swift-docc-render` is a Vue.js application, it defines a variety of components and utilities, that could also be used in a modular fashion by some other Vue application. All components are packaged as raw Vue files, so Vue applications can utilize them as needed.

### Vue Page Structure

Routing in DocC-Render is handled by [Vue Router](https://router.vuejs.org), with routes defined in `src/routes.js`. Pages can be dynamic, meaning a single page can match many urls, but still be rendered by the same Vue Page Component. For example the `/tutorials/:id` route is rendered by the **TutorialOverview** page.

For each page type we have:

* A **view** component inside the `views` folder. It is used to fetch and provide the data down to its children.
* A **page** component, responsible for rendering the atomic components, based on the available JSON. This is generally a direct child component of the **view** component.

### Sub Components

Each page is made out of isolated sub components, rendered depending on the data coming from DocC. These components are the building blocks of all pages.

Some of the more generic ones like `ContentNode` or `GridColumn` are in almost every page, whereas others belong to only certain page types. Those belonging to a certain page type, are usually scoped to a folder named after their page type.

`ContentNode` is the backbone of the DocC-Render application, responsible for deeply walking through the Render JSON and rendering each of the smaller building blocks related to markdown content.

### Internal Links and Routes

Routes in DocC-Render are very flexible and define a very relaxed matching pattern.

For example, the `/documentation/*` route for documentation pages will try to fetch data and render a page using the `*` part of the URL as the path of the data to fetch. The same idea applies to the `/tutorials/*` route.

**Example:** 
For the route `/documentation/path/to/something` DocC-Render will try to fetch DocC generated JSON, using the same nested path `/data/documentation/path/to/something.json`. 

Links to pages in DocC-Render are generated using references coming from the render JSON. You can use `ReferenceUrlProvider` to get the URL and title from a reference.

```html
<ReferenceUrlProvider :reference="someFooReference">
    <router-link 
        slot-scope="{ url, title }"
        :to="url"
    >
        {{ title }}
    </router-link>
</ReferenceUrlProvider>
```

### Stores

A DocC-Render store module extracts commonly used data that needs to be reactive and be accessible to multiple components. 
A store is just an ES Module that exposes a `state` object and some methods. This follows the [Simple State Management](https://vuejs.org/v2/guide/state-management.html#Simple-State-Management-from-Scratch) section from the Vue docs.

```js
// src/stores/FooStore.js
export default {
  state: {},
  setFoo(foo){
    this.state.foo = foo;  
  },
}
```

In order to make the state reactive, a Vue component imports the module and attaches its `state` to a `data` property.

```js
// src/views/FooView.vue

import FooStore from '@/stores/FooStore'

export default {
  computed: {
    store: FooStore
  },
  provide() {
    return { store: this.store };
  },
}
```

```js
// src/components/FooView/FooComponent.vue
 
export default {
  inject: ['store'],
  data() {
    return {
      state: this.store.state,
    }
  }
}
```

### Constants

Files inside the `constants` folder are meant to share different constant value across many components. They are preferably kept simple, scoping common constants to a single file.

### Icons

Icons in DocC-Render are Vue components that utilize the `SVGIcon` component. Inside the `SVGIcon` element, you can copy the body of an SVG file with the `svg` tag removed. This is done so we can load vector icons inline, and be able to change properties like colors and fills easily with css.

```html
<template>
  <SVGIcon class="diagonal-arrow" viewBox="0 0 14 14">
    <path d="M0.010 12.881l10.429-10.477-3.764 0.824-0.339-1.549 7.653-1.679-1.717 7.622-1.546-0.349 0.847-3.759-10.442 10.487z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from '@/components/SVGIcon.vue';

export default {
  name: 'DiagonalArrowIcon',
  components: { SVGIcon },
};
</script>
``` 

### Styles

Styles in DocC-Render are separated between `core` and `base` styles, with the majority of styling being defined as scoped inside the corresponding Vue file.

> Define styles inside Vue files as **scoped**, so style collisions are reduced to a minimum. 

* The `base` styles represent global styles, like resetting styles, styling links and headings across the app. These styles are imported once, purposefully not scoped, inside `App.vue`.
* The `core` styles are used to define Sass variables, mixins and functions, that are to be used to generate reusable and complex styles inside Vue files. 

> Important: SCSS files inside **core** should never output css directly! These style files are imported in almost every vue file, and making them output styles, will lead to duplication of styles across the entire app. 

If you need access to a global mixin or var, from `_core.scss` you have to import it first.

```html
<style scoped lang="scss">
  @import '@/styles/_core.scss';
  .some-class {
    margin-left: $varfrom-core-folder;
  }
</style>
```

### Local Development

#### Unit tests

DocC-Render is unit tested, using the [Jest](https://jestjs.io/) testing framework. All components and utilities strive to have a corresponding test file inside the  `tests` folder, mirroring the file's location.

Unit tests can be run via:

* `npm run test:unit`  - run all unittests
* `npm run test:unit:watch`  - run only the modified files and watch for changes
* `npx run test:unit tests/unit/path/to/spec.js`  - run an individual test file

#### Code style

DocC-Render uses [ESLint](https://eslint.org/) to format the code and avoid syntax errors. It is following [Airbnb](https://github.com/airbnb/javascript) code styling along with [Vue Style Guide](https://vuejs.org/v2/style-guide/)’s essential configuration.

To run the linter run:

`npm run lint`

To automatically fix any error, run:

`npm run lint:fix`

If you use the development server via `npm run serve`, files are linted on each change. Read more about configuring your linter [here](https://cli.vuejs.org/core-plugins/eslint.html#configuration).

#### Environment flags

DocC-Render has a few build-time environment flags, that allow you to set configuration parameters before building. Read [How to set Environment Variables in Vue CLI](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables).

**List of env variables:**

* **VUE_APP_DEV_SERVER_PROXY** - The HTTP endpoint or  local filepath to read render JSON from when using the development server
* **VUE_APP_TITLE** - An optional default page title to apply to pages

#### Available Scripts

These are the most commonly used npm scripts you would need to develop DocC-Render:

* **serve** - used while developing DocC-Render or a theme. Starts up a custom live-reloading server, which serves a local DocC-Render instance.
* **build** - builds DocC-Render, in a state ready for `docc`.
* **test** - run the entire DocC-Render test suite.
* **lint** - run the linter, to check for code styling errors.

#### Configuring the server

DocC-Render uses browser APIs to simulate nested file structures, which means we need to tell the server to redirect those nested paths properly. To see examples for popular server configs, check: [Vue Router Server Configs](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations) 

<!-- Copyright (c) 2021 Apple Inc and the Swift Project authors. All Rights Reserved. -->
