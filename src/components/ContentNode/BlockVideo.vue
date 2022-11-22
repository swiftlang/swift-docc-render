<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Asset
    :identifier="identifier"
    :video-autoplays="false"
    :video-muted="false"
    :showsReplayButton="!isClientMobile"
    :showsVideoControls="isClientMobile"
  />
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import isClientMobile from 'docc-render/mixins/isClientMobile';

export default {
  name: 'BlockVideo',
  mixins: [isClientMobile],
  components: { Asset },
  props: {
    identifier: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.asset {
  margin-left: auto;
  margin-right: auto;

  @include space-out-between-siblings($stacked-margin-xlarge);
}

/deep/ video {
  display: block;
  margin-left: auto;
  margin-right: auto;
  object-fit: contain;
  max-width: 100%;
}
</style>
