<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <RenderChanged :changes="changeValues" :value="mimetype">
    <div slot-scope="{ value }" class="response-mimetype">Content-Type: {{ value }}</div>
  </RenderChanged>
</template>

<script>
import { ChangeTypes } from 'docc-render/constants/Changes';
import RenderChanged from 'docc-render/components/DocumentationTopic/PrimaryContent/RenderChanged.vue';

export default {
  name: 'PossiblyChangedMimetype',
  components: { RenderChanged },
  props: {
    mimetype: {
      type: String,
      required: true,
    },
    changes: {
      type: [Object, String],
      required: false,
    },
    change: {
      type: String,
      required: false,
    },
  },
  computed: {
    /**
     * Return the changes object, only if the change type is "modified".
     * @param {String} change
     * @param {Object|String} changes
     * @return {Object|undefined}
     */
    changeValues({ change, changes }) {
      // if the change type is "modified", and there is an actual change provided.
      return change === ChangeTypes.modified && typeof changes !== 'string'
        ? changes
        : undefined;
    },
  },
};
</script>

<style lang='scss' scoped>
@import 'docc-render/styles/_core.scss';

.response-mimetype {
  color: var(--color-figure-gray-secondary);
}
</style>
