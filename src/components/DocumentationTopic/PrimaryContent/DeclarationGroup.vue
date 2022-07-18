<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="declaration-group"
    :class="classes"
    ref="apiChangesDiff"
  >
    <p v-if="shouldCaption" class="platforms">
      <strong>{{ caption }}</strong>
    </p>
    <Source
      :tokens="declaration.tokens"
      :language="interfaceLanguage"
    />
  </div>
</template>

<script>
import DeclarationSource from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';
import Language from 'docc-render/constants/Language';
import { APIChangesMultipleLines } from 'docc-render/mixins/apiChangesHelpers';

/**
 * Renders a code source with an optional caption.
 */
export default {
  name: 'DeclarationGroup',
  components: {
    Source: DeclarationSource,
  },
  mixins: [APIChangesMultipleLines],
  inject: {
    languages: {
      default: () => new Set(),
    },
    interfaceLanguage: {
      default: () => Language.swift.key.api,
    },
    symbolKind: {
      default: () => undefined,
    },
  },
  props: {
    declaration: {
      type: Object,
      required: true,
    },
    /**
     * Whether to show the caption or not.
     * Usually if there is more than Declaration group.
     */
    shouldCaption: {
      type: Boolean,
      default: false,
    },
    /**
     * The type of code change.
     * @type {"added"|"deprecated"|"modified"}
     */
    changeType: {
      type: String,
      required: false,
    },
  },
  computed: {
    classes: ({ changeType, multipleLinesClass, hasMultipleLinesAfterAPIChanges }) => ({
      [`declaration-group--changed declaration-group--${changeType}`]: changeType,
      [multipleLinesClass]: hasMultipleLinesAfterAPIChanges,
    }),
    caption() {
      return this.declaration.platforms.join(', ');
    },
    isSwift: ({ interfaceLanguage }) => interfaceLanguage === Language.swift.key.api,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.platforms {
  @include font-styles(body-reduced);

  margin-bottom: 0.45rem;
  margin-top: $stacked-margin-xlarge;

  .changed & {
    padding-left: $code-source-spacing;
  }

  &:first-of-type {
    margin-top: 1rem;
  }
}

.source {
  margin: $code-listing-with-numbers-padding;

  .platforms + & {
    margin: 0;
  }
}

@include changedStyles {
  &.declaration-group {
    background: var(--background, var(--color-code-background));
  }
  .source {
    background: none;
    border: none;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: $change-icon-occupied-space;
    padding-left: 0;
  }
}
</style>
