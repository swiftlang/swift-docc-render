<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section :id="anchor"><slot /></section>
</template>

<script>
export default {
  name: 'OnThisPageSection',
  inject: {
    store: {
      default() {
        return {
          addOnThisPageSection() {},
        };
      },
    },
  },
  props: {
    anchor: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  created() {
    this.store.addOnThisPageSection({
      anchor: this.anchor,
      title: this.title,
    });
  },
};
</script>
