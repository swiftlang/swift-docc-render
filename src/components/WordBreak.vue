<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
// Injects a <wbr> ("Word break opportunity") HTML element at safe and readable
// boundaries to hint at positions where web browsers should break apart words
// when they need to wrap to the next line. This is done to prevent words from
// randomly getting cut off at arbitrary characters.
//
// This is especially useful for very long symbol names that may not fit on a
// single line on devices with small breakpoints and even some titles for symbols
// on larger breakpoints.
//
// Examples (using real spaces to show where <wbr> tags will be injected):
//
//     <WordBreak>fooBarBaz</WordBreak>    // 'foo Bar Baz'
//     <WordBreak>foo:bar:baz:</WordBreak> // 'foo: bar: baz:'
//     <WordBreak>Foo.Bar.Baz</WordBreak>  // 'Foo .Bar .Baz'
//     <WordBreak>foo_bar_baz</WordBreak>  // 'foo _bar _baz'
//     <WordBreak>foobarbaz</WordBreak>    // 'foobarbaz'
//
// Note: This component should be used to wrap plaintext content.
export default {
  functional: true,
  name: 'WordBreak',
  render(createElement, { props, slots, data }) {
    const childNodes = (slots().default || []);
    const textNodes = childNodes.filter(node => node.text && !node.tag);

    // Don't attempt word breaking unless this component wraps raw strings
    if (textNodes.length === 0 || textNodes.length !== childNodes.length) {
      return createElement(props.tag, data, childNodes);
    }

    const word = textNodes.map(({ text }) => text).join();
    const childrenWithBreaks = [];

    let match = null;
    let lastIndex = 0;
    // Find each regex match in the wrapped string and create an array of each
    // individual substring along with a corresponding <wbr> element.
    // eslint-disable-next-line no-cond-assign
    while ((match = props.safeBoundaryPattern.exec(word)) !== null) {
      const nextIndex = match.index + 1;

      childrenWithBreaks.push(word.slice(lastIndex, nextIndex));
      childrenWithBreaks.push(createElement('wbr', { key: match.index }));

      lastIndex = nextIndex;
    }
    childrenWithBreaks.push(word.slice(lastIndex, word.length));

    return createElement(props.tag, data, childrenWithBreaks);
  },
  props: {
    safeBoundaryPattern: {
      type: RegExp,
      default: () => /([a-z](?=[A-Z])|(:)\w|\w(?=[._]\w))/g,
    },
    tag: {
      type: String,
      default: () => 'span',
    },
  },
};
</script>
