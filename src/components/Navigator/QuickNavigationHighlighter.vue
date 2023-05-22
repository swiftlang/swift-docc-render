<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
/**
 * Component used to mark plain text.
 */
export default {
  name: 'QuickNavigationHighlighter',
  props: {
    text: {
      type: String,
      required: true,
    },
    matcherText: {
      type: String,
      default: '',
    },
  },
  render(createElement) {
    const { matcherText, text } = this;
    const children = [];
    let lastIndex = 0;
    if (!matcherText) {
      return createElement('span', { class: 'highlight' }, text);
    }
    [...matcherText].forEach((char) => {
      const charIndex = text.toLowerCase().indexOf(char.toLowerCase(), lastIndex);
      if (lastIndex) {
        children.push(createElement('span', text.slice(lastIndex, charIndex)));
      }
      const nextIndex = charIndex + 1;
      children.push(createElement('span', { class: 'match' }, text.slice(charIndex, nextIndex)));
      lastIndex = nextIndex;
    });
    return createElement('p', { class: 'highlight' }, children);
  },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.highlight {
  display: inline;

  /deep/ .match {
    font-weight: $font-weight-semibold;
    background: var(--color-fill-light-blue-secondary);
  }
}
</style>
