<template>
  <div>
    <select v-model="$i18n.locale">
      <option
        v-for="(lang, i) in langs"
        :key="`lang-${i}`"
        :value="lang"
      >
        {{ lang }}
      </option>
    </select>
  </div>
</template>

<script>
import * as messages from '@/lang';

export default {
  name: 'LocaleSelector',
  data() {
    return { langs: Object.keys(messages) };
  },
};

</script>
