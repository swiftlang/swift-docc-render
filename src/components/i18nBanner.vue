<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
<div v-if="displayi18nBanner" class="i18n-banner">
  <div class="i18n-banner__wrapper">
    <router-link
      :to="to"
      class="i18n-banner__link"
      replace
    >
      {{ $i18n.messages[`${preferredLocale}`]['view-in'] }}
      <InlineChevronRightIcon class="icon-inline" />
    </router-link>
    <button
      class="i18n-banner__close-icon"
      aria-label="I do not want to change the language"
      @click="dismissedBanner = true"
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

const navigatorLocale = window.navigator.language;

export default {
  name: 'i18nBanner',
  components: {
    InlineChevronRightIcon,
    CloseIcon,
  },
  inject: {
    store: {
      default() {
        return {
          setPreferredLocale() {},
        };
      },
    },
  },
  data() {
    return {
      dismissedBanner: false,
      preferredLocale: '',
    };
  },
  computed: {
    displayi18nBanner() {
      return locales.some((locale) => {
        const language = locale.code.split('-')[0];
        const preferredLocaleExists = navigatorLocale.includes(language);
        if (!preferredLocaleExists
          || this.$i18n.locale === locale.slug
          || this.dismissedBanner) return false;
        this.preferredLocale = locale.slug;
        return true;
      });
    },
    to() {
      const slug = this.preferredLocale;
      this.store.setPreferredLocale(this.preferredLocale);
      return {
        params: {
          locale: slug === defaultLocale ? null : slug,
        },
      };
    },
  },
};
</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.i18n-banner {
  background: var(--color-fill-blue);

  &__wrapper {
    max-width: 1920px;
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
