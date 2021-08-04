<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="headline">
    <span v-if="$slots.eyebrow" class="eyebrow">
      <slot name="eyebrow" />
    </span>
    <Heading class="heading" :level="level">
      <slot />
    </Heading>
  </div>
</template>

<script>
const headingLevelMin = 1;
const headingLevelMax = 6;

const HeadingLevel = {
  type: Number,
  required: true,
  validator: value => value >= headingLevelMin && value <= headingLevelMax,
};

// Private component used for headings with a dynamic level in templates
const Heading = {
  name: 'Heading',
  render: function render(createElement) {
    return createElement(`h${this.level}`, this.$slots.default);
  },
  props: {
    level: HeadingLevel,
  },
};

export default {
  name: 'Headline',
  components: { Heading },
  props: {
    level: HeadingLevel,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.headline {
  margin-bottom: $stacked-margin-large;
}

.heading {
  @include font-styles(headline);
  color: var(--color-header-text);

  .dark & {
    color: dark-color(figure-gray);
  }
}

.eyebrow {
  @include font-styles(eyebrow);
  display: block;
  margin-bottom: $stacked-margin-small;
  color: var(--color-eyebrow);
}
</style>
