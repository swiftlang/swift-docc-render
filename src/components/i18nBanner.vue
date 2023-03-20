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
    View in English
    <a href="/" class="i18n-banner__link">
      <InlineChevronRightIcon class="icon-inline" />
    </a>
    <button
      class="i18n-banner__close-icon"
      aria-label="I do not want to change the language"
      @click="dismissedBanner = true">
      <CloseIcon class="icon-inline" />
    </button>
  </div>
</div>
</template>
<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import CloseIcon from 'theme/components/Icons/CloseIcon.vue';

export default {
  name: 'i18nBanner',
  components: {
    InlineChevronRightIcon,
    CloseIcon,
  },
  data() {
    return {
      dismissedBanner: false,
    };
  },
  computed: {
    displayi18nBanner() {
      return /^en\b/.test(navigator.language) && this.$i18n.locale !== 'en-US' && !this.dismissedBanner;
    },
  },
  props: {
    enableThemeSettings: {
      type: Boolean,
      default: true,
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
