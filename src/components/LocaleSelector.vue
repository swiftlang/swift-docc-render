<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="locale-selector">
    <select v-model="$i18n.locale">
      <option
        v-for="(lang, i) in langs"
        :key="`lang-${i}`"
        :value="lang"
      >
        {{ getLanguageName(lang) }}
      </option>
    </select>
    <ChevronRoundedIcon class="icon-inline" />
  </div>
</template>

<script>
import ChevronRoundedIcon from 'theme/components/Icons/ChevronRoundedIcon.vue';
import locales from '@/lang/locales.json';

export default {
  name: 'LocaleSelector',
  components: {
    ChevronRoundedIcon,
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
  },
};

</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

select {
  color: var(--color-fill-blue);
  font-weight: $font-weight-semibold;
  padding-right: 15px;
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

.locale-selector {
  position: relative;
}

.svg-icon.icon-inline {
  position: absolute;
  fill: var(--color-fill-blue);
  right: 2px;
  bottom: 7px;
  height: .5rem;
  transform: rotate(90deg);
}
</style>
