<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="language" role="complementary" aria-label="Language">
    <Title>Language: </Title>
    <div class="language-list">
      <LanguageSwitcherLink
        class="language-option swift"
        :class="{ active: swift.active }"
        :url="swift.active ? null : swift.url"
        @click="chooseLanguage(swift)"
      >
        {{swift.name}}
      </LanguageSwitcherLink>
      <LanguageSwitcherLink
        class="language-option objc"
        :class="{ active: objc.active }"
        :url="objc.active ? null : objc.url"
        @click="chooseLanguage(objc)"
      >
        {{objc.name}}
      </LanguageSwitcherLink>
    </div>
  </Section>
</template>

<script>
import { buildUrl } from 'docc-render/utils/url-helper';
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
  inject: {
    isTargetIDE: {
      default: () => false,
    },
    store: {
      default() {
        return {
          setPreferredLanguage() {},
        };
      },
    },
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
      interfaceLanguage,
      normalizePath,
      objcPath,
      $route: { query },
    }) => ({
      ...Language.objectiveC,
      active: Language.objectiveC.key.api === interfaceLanguage,
      url: buildUrl(normalizePath(objcPath), {
        ...query,
        language: Language.objectiveC.key.url,
      }),
    }),
    swift: ({
      interfaceLanguage,
      normalizePath,
      swiftPath,
      $route: { query },
    }) => ({
      ...Language.swift,
      active: Language.swift.key.api === interfaceLanguage,
      url: buildUrl(normalizePath(swiftPath), {
        ...query,
        language: undefined,
      }),
    }),
  },
  methods: {
    chooseLanguage(language) {
      if (!this.isTargetIDE) {
        this.store.setPreferredLanguage(language.key.url);
      }

      this.$router.push(language.url);
    },
    normalizePath(path) {
      // Sometimes `paths` data from `variants` are prefixed with a leading
      // slash and sometimes they aren't
      return path.startsWith('/') ? path : `/${path}`;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.language {
  padding-bottom: 10px;
  justify-content: flex-end;
}

.language, .language-list {
  @include font-styles(body-reduced);
  margin-top: 0;
  display: flex;
  align-items: center;
}

.language-option {
  &.swift {
    padding-right: 10px;
    border-right: 1px solid var(--color-fill-gray-tertiary);
  }

  &.objc {
    padding-left: 10px;
  }

  &.router-link-exact-active,
  &.active {
    color: dark-color(figure-gray-secondary);

    .documentation-hero--disabled & {
      color: var(--colors-secondary-label, var(--color-secondary-label));
    }
  }
}
</style>
