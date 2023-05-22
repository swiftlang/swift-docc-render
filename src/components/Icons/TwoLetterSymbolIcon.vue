<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="two-letter-icon"
    width="16px" height="16px" viewBox="0 0 16 16"
    themeId="two-letter"
  >
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(1.000000, 1.000000)">
        <rect stroke="currentColor" x="0.5" y="0.5" width="13" height="13"></rect>
        <text font-size="8" font-weight="bold" fill="currentColor">
          <tspan x="8.2" y="11">{{ second }}</tspan>
        </text>
        <text font-size="11" font-weight="bold" fill="currentColor">
          <tspan x="1.7" y="11">{{ first }}</tspan>
        </text>
      </g>
    </g>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'TwoLetterSymbolIcon',
  components: { SVGIcon },
  props: {
    first: {
      type: String,
      required: true,
    },
    second: {
      type: String,
      required: true,
    },
  },
};
</script>
