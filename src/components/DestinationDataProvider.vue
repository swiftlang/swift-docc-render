<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
const DestinationType = {
  link: 'link',
  reference: 'reference',
  text: 'text',
};

/**
 * Transparent Data provider for `destination` type.
 * Returns a single default scoped slot
 * with `url` and `title`
 */
export default {
  name: 'DestinationDataProvider',
  props: {
    destination: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  inject: {
    references: {
      default: () => ({}),
    },
    isTargetIDE: {
      default: () => false,
    },
  },
  constants: {
    DestinationType,
  },
  computed: {
    /**
     * Whether the link is an external type or not.
     * Backwards compatible with deprecated Destination.link
     * @returns {boolean}
     */
    isExternal: ({ reference, destination }) => (
      // current
      reference.type === DestinationType.link
      // deprecated fallback
      || destination.type === DestinationType.link
    ),

    /**
     * Whether `(opens in browser)` should be appended to the aria-label
     * @returns {boolean}
     */
    shouldAppendOpensInBrowser: ({ isExternal, isTargetIDE }) => isExternal && isTargetIDE,

    reference: ({ references, destination }) => (references[destination.identifier] || {}),

    linkUrl: ({
      destination,
      reference,
    }) => ({
      [DestinationType.link]: destination.destination,
      [DestinationType.reference]: reference.url,
      [DestinationType.text]: destination.text,
    }[destination.type]),

    linkTitle: ({ reference, destination }) => ({
      [DestinationType.link]: destination.title,
      [DestinationType.reference]: destination.overridingTitle || reference.title,
      [DestinationType.text]: '',
    }[destination.type]),
  },
  methods: {
    /**
     * Format the passed label
     * Passed via `scope-slot`
     * @param {string} title
     * @returns {string}
     */
    formatAriaLabel(title) {
      return this.shouldAppendOpensInBrowser ? `${title} (opens in browser)` : title;
    },
  },
  render() {
    return this.$scopedSlots.default({
      url: this.linkUrl || '',
      title: this.linkTitle || '',
      formatAriaLabel: this.formatAriaLabel,
      isExternal: this.isExternal,
    });
  },
};
</script>
