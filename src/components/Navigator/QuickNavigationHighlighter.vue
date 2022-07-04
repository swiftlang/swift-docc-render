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
    [...matcherText].forEach((char) => {
      const nextIndex = text.indexOf(char, lastIndex);
      const spanText = text.slice(lastIndex, nextIndex);
      if (spanText) {
        children.push(createElement('span', spanText));
      }
      lastIndex = nextIndex;
      children.push(createElement('span', { class: 'match' }, text.slice(lastIndex, lastIndex + 1)));
      lastIndex += 1;
    });
    children.push(createElement('span', text.slice(lastIndex)));
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
