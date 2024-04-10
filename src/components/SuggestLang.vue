<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
<div v-if="displaySuggestLang" class="suggest-lang">
  <div class="suggest-lang__wrapper">
    <router-link
      :to="getLocaleParam(preferredLocale)"
      @click.native="setPreferredLocale(preferredLocale)"
      class="suggest-lang__link"
      :lang="getCodeForSlug(preferredLocale)"
    >{{ $i18n.messages[preferredLocale]['view-in'] }}<InlineChevronRightIcon class="icon-inline" />
    </router-link>
    <div class="suggest-lang__close-icon-wrapper">
      <button
        class="suggest-lang__close-icon-button"
        :aria-label="$t('continue-viewing')"
        @click="setPreferredLocale($i18n.locale)"
      >
        <CloseIcon class="icon-inline" />
      </button>
    </div>
  </div>
</div>
</template>
<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import CloseIcon from 'theme/components/Icons/CloseIcon.vue';
import locales from 'theme/lang/locales.json';
import AppStore from 'docc-render/stores/AppStore';
import { getCodeForSlug, getLocaleParam } from 'docc-render/utils/i18n-utils';

export default {
  name: 'SuggestLang',
  components: {
    InlineChevronRightIcon,
    CloseIcon,
  },
  computed: {
    preferredLocale: () => {
      const appPreferredLocale = AppStore.state.preferredLocale;
      // if user has a storaged preferred locale, return it
      if (appPreferredLocale) return appPreferredLocale;
      // find if user's navigator language preference matches any of the locales we provide
      const matchingLocale = locales.find((locale) => {
        const languageAvailable = locale.code.split('-')[0];
        const navigatorLanguage = window.navigator.language.split('-')[0];
        return navigatorLanguage === languageAvailable;
      });
      // if matching locale is found, display it, if not, there is not preferred locale
      return matchingLocale ? matchingLocale.slug : null;
    },
    displaySuggestLang: ({ preferredLocale, $i18n }) => (
      // don't display banner if we don't have the preferred locale or
      // if user is already on that locale
      preferredLocale && $i18n.locale !== preferredLocale
    ),
  },
  methods: {
    setPreferredLocale: (locale) => {
      AppStore.setPreferredLocale(locale);
    },
    getCodeForSlug,
    getLocaleParam,
  },
};
</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$banner-icon-padding: $nav-padding-small * 0.25;

.suggest-lang {
  background: dark-color(fill);
  color: light-color(fill);
  display: flex;
  justify-content: center;
  border-bottom: $generic-border-style;

  &__wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: var(
      --wrapper-max-width,
      map-deep-get($breakpoint-attributes, (default, xlarge, min-width))
    );
    margin: 0 $nav-padding-small;
    position: relative;
    height: $suggest-lang-height;
  }

  &__link {
    @include font-styles(body-reduced);
    margin: 0 auto;
    color: dark-color(figure-blue);
  }

  &__close-icon-wrapper {
    position: absolute;
    right: - $banner-icon-padding;
    top: 0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 1;
  }

  &__close-icon-button {
    padding: $banner-icon-padding;

    .close-icon {
      width: $tiny-icon-size;
      display: block;
    }
  }

  .inline-chevron-right-icon {
    padding-left: $banner-icon-padding;
    width: $tiny-icon-size;
  }
}
</style>
