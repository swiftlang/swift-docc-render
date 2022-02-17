<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
/**
 * Component used to mark plain text, based on a provided matcher string.
 */
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
  render(createElement) {
    // Return a simple p when no text is being highlighted
    const { matcher, text } = this;
    if (!matcher) {
      return createElement('p', { class: 'highlight' }, text);
    }

    const children = [];
    let lastIndex = 0;
    let match = null;
    // Make sure matcher has a `global` flag, so finds all matches, one after the other.
    const RE = new RegExp(matcher, 'gi');

    // Loop through each match for the highlighted text (case insensitive),
    // adding a span text node for the text leading up
    // to a match, and a `span.match` node for the actual text that
    // should be highlighted (case insensitive)
    // eslint-disable-next-line no-cond-assign
    while ((match = RE.exec(text)) !== null) {
      const matchLength = match[0].length;

      const nextIndex = match.index + matchLength;

      // find text from last match upto current one
      const spanText = text.slice(lastIndex, match.index);
      if (spanText) {
        children.push(createElement('span', spanText));
      }

      // find match text
      const matchText = text.slice(match.index, nextIndex);
      if (matchText) {
        children.push(createElement('span', { class: 'match' }, matchText));
      }

      lastIndex = nextIndex;
    }
    // Add a normal text node for any non-highlighted text
    // after the last highlighted match (if any)
    const spanText = text.slice(lastIndex, text.length);
    if (spanText) {
      children.push(createElement('span', spanText));
    }

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
