<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
<div v-if="displayi18nBanner" class="i18n-banner" :lang="preferredLocale">
  <div class="i18n-banner__wrapper">
    <router-link
      :to="link"
      @click.native="setPreferredLocale(preferredLocale)"
      class="i18n-banner__link"
    >
      {{ $i18n.messages[preferredLocale]['view-in'] }}
      <InlineChevronRightIcon class="icon-inline" />
    </router-link>
    <button
      class="i18n-banner__close-icon"
      :aria-label="$t('continue-viewing')"
      @click="setPreferredLocale($i18n.locale)"
    >
      <CloseIcon class="icon-inline" />
    </button>
  </div>
</div>
</template>
<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import CloseIcon from 'theme/components/Icons/CloseIcon.vue';
import locales from 'theme/lang/locales.json';
import { defaultLocale } from 'theme/lang/index.js';
import AppStore from 'docc-render/stores/AppStore';

export default {
  name: 'i18nBanner',
  components: {
    InlineChevronRightIcon,
    CloseIcon,
  },
  computed: {
    preferredLocale: () => {
      const appPreferredLocale = AppStore.state.preferredLocale;
      // if user has save a preferred locale, return it
      if (appPreferredLocale) return appPreferredLocale;
      // find if user's navigator preference is available with the locales we provide
      // in case it is, that will be the preferred locale to display
      return locales.find((locale) => {
        const languageAvailable = locale.code.split('-')[0];
        const navigatorLanguage = window.navigator.language;
        return navigatorLanguage.includes(languageAvailable);
      }).slug;
    },
    displayi18nBanner: ({ preferredLocale, $i18n }) => (
      preferredLocale && $i18n.locale !== preferredLocale
    ),
    link: ({ preferredLocale }) => ({
      params: {
        locale: preferredLocale === defaultLocale ? undefined : preferredLocale,
      },
    }),
  },
  methods: {
    setPreferredLocale: (locale) => {
      AppStore.setPreferredLocale(locale);
    },
  },
};
</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.i18n-banner {
  background: var(--color-fill-blue);

  &__wrapper {
    max-width: var(--wrapper-max-width, 1920px);
    margin: 0 16px;
    position: relative;
    display: flex;

    @include breakpoints-from(xlarge) {
      margin: 0 auto;
    }
  }

  &__link {
    justify-content: center;
    padding: 16px 0;
    margin: 0 auto;
    color: var(--color-text);
    @include font-styles(body-reduced);
  }

  &__close-icon {
    height: 20px;
    padding: 16px 0 16px 16px;
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    z-index: 1;
  }

  .close-icon {
    width: 15px;
  }

  .inline-chevron-right-icon {
    width: 8px;
  }
}
</style>
