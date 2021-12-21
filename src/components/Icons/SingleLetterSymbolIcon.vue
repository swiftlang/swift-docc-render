<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="reset-circle-icon"
    width="16px" height="16px" viewBox="0 0 16 16"
  >
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(1.000000, 1.000000)">
        <rect :stroke="color" x="0.5" y="0.5" width="13" height="13" rx="3"></rect>
        <text font-family="SFProRounded-Bold, SF Pro Rounded" font-size="11" font-weight="bold" :fill="color">
          <tspan text-anchor="middle" x="7" y="11">{{ word[0] }}</tspan>
        </text>
      </g>
    </g>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'SingleLetterSymbolIcon',
  components: { SVGIcon },
  props: {
    word: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#BF6AF7',
    },
  },
};
</script>
