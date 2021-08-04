<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="language" role="complementary" aria-label="Language">
    <Title>Language</Title>
    <LanguageSwitcherLink
      class="language-option swift"
      :class="{ active: swift.active }"
      :url="swift.active ? null : swift.url"
    >{{swift.name}}</LanguageSwitcherLink>
    <LanguageSwitcherLink
      class="language-option objc"
      :class="{ active: objc.active }"
      :url="objc.active ? null : objc.url"
    >{{objc.name}}</LanguageSwitcherLink>
  </Section>
</template>

<script>
import Language from 'docc-render/constants/Language';

import LanguageSwitcherLink from './LanguageSwitcherLink.vue';
import Section from './Section.vue';
import Title from './Title.vue';

export default {
  name: 'LanguageSwitcher',
  components: {
    LanguageSwitcherLink,
    Section,
    Title,
  },
  props: {
    interfaceLanguage: {
      type: String,
      required: true,
    },
    objcPath: {
      type: String,
      required: true,
    },
    swiftPath: {
      type: String,
      required: true,
    },
  },
  computed: {
    // Use `{ path: null }` to link to the same/current path using router-link.
    // Prefix new paths with a leading slash since the data from the backend API
    // returns paths without a leading slash--the router link URL needs the
    // leading slash so that it doesn't try to link to a page relative to the
    // current URL.
    objc: ({
      interfaceLanguage, isCurrentPath, objcPath, $route: { query },
    }) => ({
      ...Language.objectiveC,
      active: Language.objectiveC.key.api === interfaceLanguage,
      url: {
        path: isCurrentPath(objcPath) ? null : `/${objcPath}`,
        query: { language: Language.objectiveC.key.url, context: query.context },
      },
    }),
    swift: ({
      interfaceLanguage, isCurrentPath, swiftPath, $route: { query },
    }) => ({
      ...Language.swift,
      active: Language.swift.key.api === interfaceLanguage,
      url: {
        path: isCurrentPath(swiftPath) ? null : `/${swiftPath}`,
        query: { language: undefined, context: query.context },
      },
    }),
  },
  methods: {
    isCurrentPath(path) {
      // the `.replace` call is needed since paths vended by the backend do not
      // include a leading slash, while the router provided path does
      return this.$route.path.replace(/^\//, '') === path;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.language {
  font-size: 14px;
}

.language-option {
  display: inline;

  @include breakpoint(small) {
    display: block;
    margin-bottom: 0.25rem;
  }

  &.router-link-exact-active,
  &.active {
    color: var(--colors-secondary-label, var(--color-secondary-label));
  }

  @include breakpoints-from(medium) {
    &.swift {
      border-right: 1px solid var(--color-fill-gray-tertiary);
      margin-right: 10px;
      padding-right: 10px;
    }
  }
}
</style>
