<template>
  <span
    class="highlight"
    v-html="parsedText"
  />
</template>
<script>
/**
 * Component used to mark plain text, based on a provided matcher string.
 */

import { escapeHtml } from 'docc-render/utils/strings';

export default {
  name: 'HighlightMatch',
  props: {
    text: {
      type: String,
      required: true,
    },
    matcher: {
      type: RegExp,
      default: undefined,
    },
  },
  computed: {
    /**
     * Find a matching string in the text, and highlight it by wrapping with a `.match` element.
     * @param {string} matcher
     * @param {string} text
     * @return {string}
     */
    parsedText: ({ matcher, text }) => (matcher
      ? text.replace(matcher, match => `<span class="match">${escapeHtml(match)}</span>`)
      : escapeHtml(text)),
  },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.highlight /deep/ .match {
  font-weight: $font-weight-semibold;
  background: var(--color-fill-light-blue);
}
</style>
