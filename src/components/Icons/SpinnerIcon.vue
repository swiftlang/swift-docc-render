<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon class="spinner-icon" viewBox="0 0 39.02 39.02" themeId="spinner">
    <path d="m15.529 11.96-3.57 3.569-7.99-7.99 3.57-3.57z"/>
    <path d="M0 22.072v-5.06h11.331v5.06z"/>
    <path d="m7.54 35.096-3.57-3.569 7.99-7.99 3.57 3.569z"/>
    <path d="M22.057 39.02H17.01v-11.3h5.047z"/>
    <path d="m35.096 31.528-3.569 3.568-7.99-7.99 3.569-3.569z"/>
    <path d="M39.02 17.01v5.046h-11.3V17.01z"/>
    <path d="m31.528 3.97 3.569 3.57-7.99 7.99-3.57-3.57z"/>
    <path d="M17.011 0h5.061v11.331h-5.061z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'SpinnerIcon',
  components: { SVGIcon },
};
</script>

<style scoped lang="scss">
@keyframes fadeout {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

path {
  $num-rects: 8;
  $animation-duration-full: 1000ms;
  $animation-duration-per-rect: $animation-duration-full / $num-rects;

  animation-duration: $animation-duration-full;
  animation-iteration-count: infinite;
  animation-name: fadeout;
  fill: currentColor;

  @for $i from 1 through $num-rects {
    &:nth-of-type(#{$i}) {
      $animation-delay: ($i - 1) * $animation-duration-per-rect * -1;
      animation-delay: $animation-delay;
    }
  }
}
</style>
