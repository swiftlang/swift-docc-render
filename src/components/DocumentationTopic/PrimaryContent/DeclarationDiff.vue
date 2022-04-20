<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="declaration-diff">
    <div class="declaration-diff-current">
      <div class="declaration-diff-version">Current</div>
      <DeclarationGroup
        v-for="(declaration, i) in currentDeclarations"
        :key="i"
        :declaration="declaration"
        :should-caption="currentDeclarations.length > 1"
        :changeType="changeType"
      />
    </div>
    <div class="declaration-diff-previous">
      <div class="declaration-diff-version">Previous</div>
      <DeclarationGroup
        v-for="(declaration, i) in previousDeclarations"
        :key="i"
        :declaration="declaration"
        :should-caption="previousDeclarations.length > 1"
        :changeType="changeType"
      />
    </div>
  </div>
</template>

<script>
import DeclarationGroup from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationGroup.vue';

/**
 * Renders a diff container around two DeclarationGroup components.
 */
export default {
  name: 'DeclarationDiff',
  components: { DeclarationGroup },
  props: {
    /**
     * The apiChanges object from the store.
     */
    changes: {
      type: Object,
      required: true,
    },
    /**
     * The applied change type to the diff.
     * @type {"added"|"deprecated"|"modified"}
     */
    changeType: {
      type: String,
      required: true,
    },
  },
  computed: {
    previousDeclarations: ({ changes }) => changes.declaration.previous || [],
    currentDeclarations: ({ changes }) => changes.declaration.new || [],
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.declaration-diff {
  background: var(--background, var(--color-code-background));

  &-version {
    padding-left: $code-source-spacing;
    @include change-highlight-end-spacing();
    @include font-styles(documentation-aside-name);

    color: var(--color-figure-gray-secondary);
    margin: 0;
  }

  &-current {
    padding-top: $change-highlight-vertical-space-total;
    padding-bottom: 5px;
  }

  &-previous {
    padding-top: 5px;
    padding-bottom: $change-highlight-vertical-space-total;
    background-color: var(--color-changes-modified-previous-background);
    border-radius: 0 0 $border-radius $border-radius;
    position: relative;
  }
}

</style>
