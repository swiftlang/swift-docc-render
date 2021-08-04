<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BaseCTA
    v-bind="baseProps"
    label="Next"
  />
</template>

<script>
import CallToAction from 'docc-render/components/CallToAction.vue';

export default {
  name: 'CallToAction',
  components: { BaseCTA: CallToAction },
  computed: {
    baseProps() {
      return {
        title: this.title,
        abstract: this.abstract,
        action: this.action,
        media: this.media,
      };
    },
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    abstract: {
      type: Array,
      required: false,
    },
    action: {
      type: Object,
      required: false,
    },
    media: {
      type: String,
      required: false,
    },
  },
};
</script>
