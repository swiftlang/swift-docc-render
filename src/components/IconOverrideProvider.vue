<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
export default {
  name: 'IconOverrideProvider',
  props: {
    imageOverride: {
      type: Object,
      default: null,
    },
  },
  computed: {
    imageOverrideVariant: ({ imageOverride }) => (imageOverride ? imageOverride.variants[0] : null),
    iconUrl: ({ imageOverrideVariant }) => imageOverrideVariant && imageOverrideVariant.url,
    themeId: ({ imageOverrideVariant }) => imageOverrideVariant && imageOverrideVariant.svgID,
    shouldUseOverride: ({ iconUrl, themeId }) => !!(iconUrl && themeId),
  },
  render() {
    const { shouldUseOverride, iconUrl, themeId } = this;
    return this.$scopedSlots.default({
      shouldUseOverride,
      iconUrl,
      themeId,
    });
  },
};
</script>
