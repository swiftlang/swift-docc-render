<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ReferenceExternal v-bind="$props">
    <CodeVoice>
      <slot />
    </CodeVoice>
  </ReferenceExternal>
</template>

<script>
import ReferenceExternal from './ReferenceExternal.vue';
import CodeVoice from './CodeVoice.vue';

export default {
  name: 'ReferenceExternalSymbol',
  props: ReferenceExternal.props,
  components: { ReferenceExternal, CodeVoice },
};
</script>
