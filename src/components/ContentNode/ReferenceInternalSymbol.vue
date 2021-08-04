<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ReferenceInternal v-bind="$props">
    <CodeVoice>
      <slot />
    </CodeVoice>
  </ReferenceInternal>
</template>

<script>
import ReferenceInternal from './ReferenceInternal.vue';
import CodeVoice from './CodeVoice.vue';

export default {
  name: 'ReferenceInternalSymbol',
  props: ReferenceInternal.props,
  components: { ReferenceInternal, CodeVoice },
};
</script>
