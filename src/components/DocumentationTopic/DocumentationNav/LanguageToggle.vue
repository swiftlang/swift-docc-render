<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavMenuItemBase class="nav-menu-setting language-container">
    <div :class="{ 'language-toggle-container': hasLanguages }">
      <!-- Faux element to get width of select, with current element-->
      <select
        class="language-dropdown language-sizer"
        ref="language-sizer"
        aria-hidden="true"
        tabindex="-1"
      >
        <option selected>{{ currentLanguage.name }}</option>
      </select>
      <label
        :for="hasLanguages ? 'language-toggle' : null"
        class="nav-menu-setting-label"
      >Language:</label>
      <select
        v-if="hasLanguages"
        id="language-toggle"
        class="language-dropdown nav-menu-link"
        v-model="languageModel"
        :style="`width: ${adjustedWidth}px`"
        @change="pushRoute(currentLanguage.route)"
      >
        <option
          v-for="language in languages"
          :value="language.api"
          :key="language.api"
        >
          {{ language.name }}
        </option>
      </select>
      <span
        v-else
        class="nav-menu-toggle-none current-language"
        aria-current="page"
      >{{ currentLanguage.name }}</span>
      <InlineChevronDownIcon v-if="hasLanguages" class="toggle-icon icon-inline" />
    </div>
    <div
      v-if="hasLanguages"
      class="language-list-container"
    >
      <span class="nav-menu-setting-label">Language:</span>
      <ul class="language-list">
        <li
          v-for="language in languages"
          class="language-list-item"
          :key="language.api"
        >
          <span
            v-if="language.api === languageModel"
            :data-language="language.api"
            aria-current="page"
            class="current-language"
          >
            {{ language.name }}
          </span>
          <a
            v-else
            href="#"
            class="nav-menu-link"
            @click.prevent="pushRoute(language.route)"
          >
            {{ language.name }}
          </a>
        </li>
      </ul>
    </div>
  </NavMenuItemBase>
</template>

<script>
import { waitFrames } from 'docc-render/utils/loading';
import Language from 'docc-render/constants/Language';
import throttle from 'docc-render/utils/throttle';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';
import InlineChevronDownIcon from 'theme/components/Icons/InlineChevronDownIcon.vue';

export default {
  name: 'LanguageToggle',
  components: { InlineChevronDownIcon, NavMenuItemBase },
  inject: {
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
      required: false,
    },
    swiftPath: {
      type: String,
      required: false,
    },
    closeNav: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      languageModel: null,
      adjustedWidth: 0,
    };
  },
  mounted() {
    // on resize, re-calculate the width of the select.
    const cb = throttle(async () => {
      // we wait for 3 frames, as that is the minimum it takes
      // for the browser orientation-change transitions to finish
      await waitFrames(3);
      this.calculateSelectWidth();
    }, 150);
    window.addEventListener('resize', cb);
    window.addEventListener('orientationchange', cb);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', cb);
      window.removeEventListener('orientationchange', cb);
    });
  },
  watch: {
    interfaceLanguage: {
      immediate: true,
      handler(language) {
        this.languageModel = language;
      },
    },
    currentLanguage: {
      immediate: true,
      handler: 'calculateSelectWidth',
    },
  },
  methods: {
    /**
     * Returns a formatted route object
     * @param {{ query: string, path: string }} route - a config object passed by the render JSON
     * @returns {{ path: (null|string), query: { language: (string|undefined) }}}
     */
    getRoute(route) {
      // pass undefined to remove the query param if its Swift
      const language = route.query === Language.swift.key.url ? undefined : route.query;
      return {
        // make sure we dont loose any extra query params on the way
        query: { ...this.$route.query, language },
        path: this.isCurrentPath(route.path) ? null : this.normalizePath(route.path),
      };
    },
    async pushRoute(route) {
      await this.closeNav();
      // Persist the selected language as a preference in the store (backed by
      // the browser's local storage so that it can be retrieved later for
      // subsequent navigation without the query parameter present)
      this.store.setPreferredLanguage(route.query);

      // Navigate to the language variant page
      this.$router.push(this.getRoute(route));
    },
    isCurrentPath(path) {
      // the `.replace` call is needed since paths vended by the backend do not
      // include a leading slash, while the router provided path does
      return this.$route.path.replace(/^\//, '') === path;
    },
    normalizePath(path) {
      // Sometimes `paths` data from `variants` are prefixed with a leading
      // slash and sometimes they aren't
      return path.startsWith('/') ? path : `/${path}`;
    },
    /**
     * Calculated the width of the select by fetching it from the faux select.
     * @return {Promise<void>}
     */
    async calculateSelectWidth() {
      // await next tick, so we are sure the element is rendered.
      await this.$nextTick();
      this.adjustedWidth = this.$refs['language-sizer'].clientWidth + 6;
    },
  },
  computed: {
    languages() {
      return [
        {
          name: Language.swift.name,
          api: Language.swift.key.api,
          route: {
            path: this.swiftPath,
            query: Language.swift.key.url,
          },
        },
        {
          name: Language.objectiveC.name,
          api: Language.objectiveC.key.api,
          route: {
            path: this.objcPath,
            query: Language.objectiveC.key.url,
          },
        },
      ];
    },
    currentLanguage: ({ languages, languageModel }) => (
      languages.find(lang => lang.api === languageModel)
    ),
    hasLanguages: ({ objcPath, swiftPath }) => swiftPath && objcPath,
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

$dropdown-icon-padding: 11px;
$nav-menu-toggle-label-margin: 6px;

.nav-menu-setting-label {
  margin-right: $nav-menu-label-margin;
  white-space: nowrap;
}

.language {
  &-dropdown {
    -webkit-text-size-adjust: none;
    appearance: none;
    border: none;
    background-color: transparent;
    box-sizing: inherit;
    // add left padding, but then nudge it back, so we have a consistent spacing with the label.
    padding: 0 $dropdown-icon-padding 0 4px;
    margin-left: -4px;
    @include font-styles(nav-toggles);
    cursor: pointer;
    position: relative;
    z-index: 1;

    // remove the default focus styles, and re-add them on keyboard navigation, only.
    &:focus {
      outline: none;
    }

    @include on-keyboard-focus() {
      @include focus-outline();
    }
  }

  &-sizer {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    padding: 0;
  }

  &-toggle {
    &-container {
      display: flex;
      align-items: center;
      padding-right: rem(3px);
      position: relative;

      @include nav-in-breakpoint() {
        display: none;
      }

      .toggle-icon {
        width: 0.6em;
        height: 0.6em;
        position: absolute;
        right: 7px;
      }
    }

    &-label {
      margin-right: 2px;
    }

    &.nav-menu-toggle-label {
      margin-right: $nav-menu-toggle-label-margin;
    }
  }
}

.language-list {
  display: inline-block;
  margin-top: 0;

  &-container {
    display: none;

    @include nav-in-breakpoint() {
      display: inline-block;
    }
  }

  &-item {
    display: inline-block;

    &:not(:first-child) {
      border-left: 1px solid dark-color(fill-gray-tertiary);
      margin-left: $nav-menu-toggle-label-margin;
      padding-left: $nav-menu-toggle-label-margin;
    }
  }
}
</style>
