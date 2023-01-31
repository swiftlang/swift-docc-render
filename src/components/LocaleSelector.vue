<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="locale-selector">
    <select
      v-model="$i18n.locale"
      @change="updateRouter"
      :aria-label="$t('select-language')"
    >
      <option
        v-for="(lang, i) in langs"
        :key="`lang-${i}`"
        :value="lang"
      >
        {{ getLanguageName(lang) }}
      </option>
    </select>
    <ChevronThickIcon class="icon-inline" />
  </div>
</template>

<script>
import ChevronThickIcon from 'theme/components/Icons/ChevronThickIcon.vue';
import locales from 'docc-render/lang/locales.json';
import { defaultLocale } from 'docc-render/lang';
import { updateLangTag } from 'docc-render/utils/metadata';

export default {
  name: 'LocaleSelector',
  components: {
    ChevronThickIcon,
  },
  data() {
    return {
      langs: Object.keys(locales),
    };
  },
  methods: {
    getLanguageName(lang) {
      return locales[lang];
    },
    updateRouter() {
      const currentLocale = this.$i18n.locale;
      this.$router.push({
        params: {
          locale: currentLocale === defaultLocale ? null : currentLocale,
        },
      });
      updateLangTag(currentLocale || defaultLocale);
    },
  },
};

</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

select {
  @include font-styles(locale-selector);
  color: var(--color-fill-blue);
  padding-right: 15px;
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.locale-selector {
  position: relative;
}

.svg-icon.icon-inline {
  position: absolute;
  fill: var(--color-fill-blue);
  right: 2px;
  bottom: 7px;
  height: 5px;
}
</style>
