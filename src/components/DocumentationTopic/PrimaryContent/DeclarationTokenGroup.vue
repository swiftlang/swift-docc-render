<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div v-if="type && type.length">
    <code>
      <DeclarationToken v-for="(token, i) in type" v-bind="token" :key="i" />
    </code>
  </div>
</template>

<script>
import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';

export default {
  name: 'DeclarationTokenGroup',
  components: { DeclarationToken },
  props: {
    type: {
      type: Array,
      default: () => ([]),
      required: false,
    },
  },
};
</script>
