<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    id="app"
    :class="{ fromkeyboard: fromKeyboard, hascustomheader: hasCustomHeader }"
  >
    <div :id="AppTopID" />
    <a href="#main" id="skip-nav">Skip Navigation</a>
    <InitialLoadingPlaceholder />
    <slot name="header" :isTargetIDE="isTargetIDE">
      <!-- Render the custom header by default, if there is no content in the `header` slot -->
      <custom-header v-if="hasCustomHeader" :data-color-scheme="preferredColorScheme" />
    </slot>
    <!-- The nav sticky anchor has to always be between the Header and the Content -->
    <div :id="baseNavStickyAnchorId" />
    <slot :isTargetIDE="isTargetIDE">
      <router-view class="router-content" />
      <custom-footer v-if="hasCustomFooter" :data-color-scheme="preferredColorScheme" />
      <Footer v-else-if="!isTargetIDE" />
    </slot>
    <slot name="footer" :isTargetIDE="isTargetIDE" />
  </div>
</template>

<script>
import AppStore from 'docc-render/stores/AppStore';
import ColorScheme from 'docc-render/constants/ColorScheme';
import Footer from 'docc-render/components/Footer.vue';
import InitialLoadingPlaceholder from 'docc-render/components/InitialLoadingPlaceholder.vue';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';
import { fetchThemeSettings, themeSettingsState } from 'docc-render/utils/theme-settings';
import { objectToCustomProperties } from 'docc-render/utils/themes';
import { AppTopID } from 'docc-render/constants/AppTopID';

export default {
  name: 'CoreApp',
  components: {
    Footer,
    InitialLoadingPlaceholder,
  },
  provide() {
    return {
      isTargetIDE: this.isTargetIDE,
      performanceMetricsEnabled: process.env.VUE_APP_PERFORMANCE_ENABLED === 'true',
    };
  },
  data() {
    return {
      AppTopID,
      appState: AppStore.state,
      fromKeyboard: false,
      isTargetIDE: process.env.VUE_APP_TARGET === 'ide',
      themeSettings: themeSettingsState,
      baseNavStickyAnchorId,
    };
  },
  computed: {
    currentColorScheme: ({ appState }) => appState.systemColorScheme,
    preferredColorScheme: ({ appState }) => appState.preferredColorScheme,
    CSSCustomProperties: ({
      currentColorScheme,
      preferredColorScheme,
      themeSettings,
    }) => (
      // If the user has selected "Auto", delegate to the system's current
      // preference to determine if "Light" or "Dark" colors should be used.
      // Otherwise, if "Light" or "Dark" has been explicitly chosen, that choice
      // should be used directly.
      objectToCustomProperties(themeSettings.theme, (preferredColorScheme === ColorScheme.auto.value
        ? currentColorScheme
        : preferredColorScheme
      ))
    ),
    hasCustomHeader: () => !!window.customElements.get('custom-header'),
    hasCustomFooter: () => !!window.customElements.get('custom-footer'),
  },
  props: {
    enableThemeSettings: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    CSSCustomProperties: {
      immediate: true,
      handler(CSSCustomProperties) {
        this.detachStylesFromRoot(CSSCustomProperties);
        this.attachStylesToRoot(CSSCustomProperties);
      },
    },
  },
  async created() {
    // AX: Listen for mouseevents
    // Show outline only when tab into; not when click
    // Below: Using mousedown instead of click, because `enter` registers as a click
    // Not using Vue: Vue constantly checks for events.
    // This is a cleaner, more effecient method;
    // only listen for one event or the other, and don't constantly listen
    window.addEventListener('keydown', this.onKeyDown);

    // Listen for the "navigation" event. This indicates that the backend
    // environment is requesting a page navigation outside of the normal web
    // view. When this scenario occurs, we can utilize the Vue router to perform
    // the navigation instead of doing a full HTTP request/response, which
    // results in much improved performance for the end user.
    this.$bridge.on('navigation', this.handleNavigationRequest);

    // fetch the JSON theme settings, if enabled
    if (this.enableThemeSettings) {
      // use Object.assign to persist the reactivity in store
      Object.assign(this.themeSettings, await fetchThemeSettings());
    }

    // Ensure that the preferred color scheme is properly synced between the
    // persisted settings and the application store state, even when the page
    // is loaded through a back/forward page cache
    window.addEventListener('pageshow', this.syncPreferredColorScheme);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('pageshow', this.syncPreferredColorScheme);
    });
  },
  mounted() {
    // update the footer copyright current year
    (document.querySelector('.footer-current-year') || {}).innerText = new Date().getFullYear();
    this.attachColorSchemeListeners();
  },
  beforeDestroy() {
    if (this.fromKeyboard) {
      window.removeEventListener('mousedown', this.onMouseDown);
    } else {
      window.removeEventListener('keydown', this.onKeyDown);
    }

    this.$bridge.off('navigation', this.handleNavigationRequest);
    this.detachStylesFromRoot(this.CSSCustomProperties);
  },
  methods: {
    onKeyDown() {
      this.fromKeyboard = true;
      window.addEventListener('mousedown', this.onMouseDown);
      window.removeEventListener('keydown', this.onKeyDown);
    },
    onMouseDown() {
      this.fromKeyboard = false;
      window.addEventListener('keydown', this.onKeyDown);
      window.removeEventListener('mousedown', this.onMouseDown);
    },
    handleNavigationRequest(path) {
      this.$router.push(path);
    },
    attachColorSchemeListeners() {
      if (!window.matchMedia) return;
      const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
      matchMedia.addListener(this.onColorSchemePreferenceChange);
      this.$once('hook:beforeDestroy', () => {
        matchMedia.removeListener(this.onColorSchemePreferenceChange);
      });

      // Trigger a theme update when the modal is first loaded.
      this.onColorSchemePreferenceChange(matchMedia);
    },
    onColorSchemePreferenceChange({ matches }) {
      const scheme = matches ? ColorScheme.dark : ColorScheme.light;
      AppStore.setSystemColorScheme(scheme.value);
    },
    attachStylesToRoot(CSSCustomProperties) {
      const root = document.body;
      Object.entries(CSSCustomProperties)
        .filter(([, value]) => Boolean(value))
        .forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
    },
    detachStylesFromRoot(CSSCustomProperties) {
      const root = document.body;
      Object.entries(CSSCustomProperties).forEach(([key]) => {
        root.style.removeProperty(key);
      });
    },
    syncPreferredColorScheme() {
      AppStore.syncPreferredColorScheme();
    },
  },
};
</script>

<style lang="scss">
// The following styles are global--purposefully not scoped to this component.
@import './styles/core';
@import './styles/base';
</style>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

/deep/ :focus:not(input):not(textarea):not(select) {
  outline: none;

  .fromkeyboard & {
    @include focus-outline();
  }
}

#app {
  display: flex;
  flex-flow: column;
  min-height: 100%;

  > /deep/ * {
    min-width: 0;
  }

  .router-content {
    flex: 1;
  }
}
</style>
