<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
const ChangedClasses = {
  added: 'change-added',
  removed: 'change-removed',
};

/**
 * Wrapper that renders the default slot,
 * with provided `value` or
 * with `changes` if any
 */
export default {
  name: 'RenderChanged',
  constants: { ChangedClasses },
  props: {
    /**
     * `diff` data to render with.
     * Uses the default scoped slot.
     */
    changes: {
      type: Object,
      default: () => ({ new: null, previous: null }),
    },
    /**
     * The default `value` to pass to the default slot.
     * Used when there is no `changes`.
     */
    value: {
      type: [Object, Array, String, Boolean],
      default: null,
    },
    /**
     * Whether it should wrap the content in a special class.
     * Useful when the slot content shows diffs.
     * @example - DeclarationTokens can show `changed` tokens.
     */
    wrapChanges: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether it should just render the latest change
     */
    renderSingleChange: {
      type: Boolean,
      default: false,
    },
  },
  render(h) {
    const {
      value, changes = {}, wrapChanges, renderSingleChange,
    } = this;

    const {
      new: newData,
      previous: previousData,
    } = changes;

    // renders the default scoped slot, providing a `value`,
    // conditionally wrapping it in a changed div
    const generateContent = (renderData, className) => {
      const content = this.$scopedSlots.default({ value: renderData });

      if (className && wrapChanges) return h('div', { class: className }, [content]);
      return content ? content[0] : null;
    };

    // render changes if available
    if (newData || previousData) {
      // pre-render the changes data
      const newContent = generateContent(newData, ChangedClasses.added);
      const previousContent = generateContent(previousData, ChangedClasses.removed);

      // render just a single item
      if (renderSingleChange) {
        return (newData && !previousData)
          ? newContent
          : previousContent;
      }
      // render both `new` and `previous` content
      return h('div', { class: 'property-changegroup' }, [
        newData ? newContent : '',
        previousData ? previousContent : '',
      ]);
    }

    // default back to just rendering as normal, without `changes`
    return generateContent(value);
  },
};
</script>
