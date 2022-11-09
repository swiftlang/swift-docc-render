<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div
    class="device-frame"
    :data-device="device"
    :class="classes"
    :style="styles"
  >
    <div class="device-screen" :class="{ 'with-device': currentDeviceAttrs }">
      <slot />
    </div>
    <div class="device" />
  </div>
</template>

<script>
import DeviceFrames from 'theme/constants/DeviceFrames.js';
import { getSetting } from 'docc-render/utils/theme-settings';

const round = (v, dec = 4) => +(`${Math.round(`${v}e+${dec}`)}e-${dec}`);

export default {
  name: 'DeviceFrame',
  props: {
    device: {
      type: String,
      required: true,
    },
  },
  provide: {
    insideDeviceFrame: true,
  },
  computed: {
    currentDeviceAttrs: ({ device }) => getSetting(['theme', 'device-frames', device], DeviceFrames[device]),
    styles: ({
      toPixel, toUrl, toPct, currentDeviceAttrs: attrs = {},
    }) => {
      const {
        screenTop, screenLeft, screenWidth, frameWidth,
        lightUrl, darkUrl, screenHeight, frameHeight,
      } = attrs;

      return {
        '--screen-top': toPct(screenTop / frameHeight),
        '--screen-left': toPct(screenLeft / frameWidth),
        '--screen-width': toPct(screenWidth / frameWidth),
        '--screen-height': toPct(screenHeight / frameHeight),
        '--screen-aspect': round(screenWidth / screenHeight) || null,

        '--frame-width': toPixel(frameWidth),
        '--frame-aspect': round(frameWidth / frameHeight) || null,

        '--device-light-url': toUrl(lightUrl),
        '--device-dark-url': toUrl(darkUrl),
      };
    },
    classes: ({ currentDeviceAttrs }) => ({
      'no-device': !currentDeviceAttrs,
    }),
  },
  methods: {
    toPixel: val => (val ? `${val}px` : null),
    toUrl: val => (val ? `url(${val})` : null),
    toPct: val => (val ? `${round(val * 100)}%` : null),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.device-frame {
  position: relative;
  width: var(--frame-width);
  aspect-ratio: var(--frame-aspect);
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  @include space-out-between-siblings($article-stacked-margin-large);
}

.device {
  background-image: var(--device-light-url);
  background-repeat: no-repeat;
  background-size: 100%;
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: none;

  @include prefers-dark {
    background-image: var(--device-dark-url, var(--device-light-url));
  }

  .no-device & {
    display: none;
  }
}

.device-screen.with-device {
  position: absolute;
  left: var(--screen-left);
  top: var(--screen-top);
  height: var(--screen-height);
  width: var(--screen-width);
  display: flex;

  & > * {
    flex: 1;
  }

  /deep/ img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: top;
    margin: 0;
  }

  /deep/ video {
    object-fit: contain;
    object-position: top;
    width: 100%;
    height: auto;
  }
}
</style>
