<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon class="spinner-icon" viewBox="0 0 39.0197 39.0197">
    <rect x="7.2258" y="4.0997" width="5.0472" height="11.2995" transform="translate(23.5372 9.7494) rotate(135)"/>
    <rect x="3.135" y="13.8757" width="5.0615" height="11.3314" transform="translate(-13.8757 25.2071) rotate(-90)"/>
    <rect x="7.2258" y="23.6676" width="5.0472" height="11.2995" transform="translate(-4.0871 56.9416) rotate(-135)"/>
    <rect x="17.0098" y="27.7202" width="5.0472" height="11.2995" transform="translate(39.0667 66.7399) rotate(-180)"/>
    <rect x="26.7937" y="23.6676" width="5.0472" height="11.2995" transform="translate(70.7782 29.3173) rotate(135)"/>
    <rect x="30.8463" y="13.8836" width="5.0472" height="11.2995" transform="translate(52.9033 -13.8366) rotate(90)"/>
    <rect x="26.7937" y="4.0997" width="5.0472" height="11.2995" transform="translate(15.4807 -17.8749) rotate(45)"/>
    <rect x="17.0106" width="5.0615" height="11.3314"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'SpinnerIcon',
  components: { SVGIcon },
};
</script>

<style scoped>
@keyframes fadeout {
  from: {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

rect {
  animation-duration: 1000ms;
  animation-name: fadeout;
  animation-iteration-count: infinite;
  fill: currentColor;

}

rect:nth-of-type(1) { animation-delay: 0ms; }
rect:nth-of-type(2) { animation-delay: -125ms; }
rect:nth-of-type(3) { animation-delay: -250ms; }
rect:nth-of-type(4) { animation-delay: -375ms; }
rect:nth-of-type(5) { animation-delay: -500ms; }
rect:nth-of-type(6) { animation-delay: -625ms; }
rect:nth-of-type(7) { animation-delay: -750ms; }
rect:nth-of-type(8) { animation-delay: -875ms; }
</style>
