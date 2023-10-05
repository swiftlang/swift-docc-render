<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
/**
 * Indicate safe places to break apart words across multiple lines when necessary.
 *
 * This component can be used to inject `<wbr>` ("word break opportunity") HTML
 * elements at safe and readable boundaries within a word, which indicate to web
 * browsers where they can break a given word onto the next line. This is done
 * to prevent long words from randomly getting cut off at arbitrary characters
 * when they won't fit on a single line on a width constrainted viewport.
 *
 * > Warning:
 * > Only raw text nodes may be provided as slotted content.
 * >
 * > ```xml
 * > <WordBreak>fooBar</WordBreak>              <!-- ✅ Good -->
 * > <WordBreak><span>fooBar</span></WordBreak> <!-- ❌ Bad  -->
 * > ```
 *
 * Word break functionality is especially useful for very long symbol names that
 * may not fit on a single line on smaller devices and even the page title for
 * long symbols on larger devices.
 *
 * By _default_, the following patterns will be used to determine where to add
 * word-break hints:
 *
 * * between lower/uppercase character pairs — **aA**
 * * after colon characters — **a:b**
 * * before dot characters — **a.b**
 * * before underscore characters — **a_b**
 *
 * You can also provide a `RegExp` object that defines an alternate pattern if
 * the default one doesn't fit your needs.
 *
 * ## Examples
 *
 * In the following examples, real space characters represent where the `<wbr>`
 * tags would be injected in the resulting HTML.
 *
 * ```xml
 * <WordBreak>fooBarBaz</WordBreak>    <!-- 'foo Bar Baz'    -->
 * <WordBreak>foo:bar:baz:</WordBreak> <!-- 'foo: bar: baz:' -->
 * <WordBreak>Foo.Bar.Baz</WordBreak>  <!-- 'Foo .Bar .Baz'  -->
 * <WordBreak>foo_bar_baz</WordBreak>  <!-- 'foo _bar _baz'  -->
 * <WordBreak>foobarbaz</WordBreak>    <!-- 'foobarbaz'      -->
 * ```
 *
 * ```xml
 * <WordBreak :safeBoundaryPattern="/(\w(?=/.\w)|\w(?=\/))/g">
 * https://foo.bar/baz/qux
 * </WordBreak>
 *
 * <!-- https://foo .bar /baz /qux -->
 * ```
 */
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
