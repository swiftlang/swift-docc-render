<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
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

    <transition-expand
      v-for="declaration in declarationTokens"
      :key="declaration.identifier"
    >
      <div
        v-if="!hasOtherDeclarations || declaration.identifier === selectedIdentifier || isExpanded"
        :class="{
          'declaration-overload': hasOtherDeclarations && isExpanded,
        }"
      >
        <component
          :is="getWrapperComponent(declaration)"
          @click="handleSelectOverload(declaration.identifier)"
        >
          <Source
            :tokens="declaration.tokens"
            :language="interfaceLanguage"
            :class="{
              'selected-overload': isSelectedOverload(declaration.identifier),
            }"
          />
        </component>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import DeclarationSource from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';
import Language from 'docc-render/constants/Language';
import TransitionExpand from 'docc-render/components/TransitionExpand.vue';
import { APIChangesMultipleLines } from 'docc-render/mixins/apiChangesHelpers';
import { waitFor } from 'docc-render/utils/loading';

/**
 * Renders a code source with an optional caption.
 */
export default {
  name: 'DeclarationGroup',
  components: {
    Source: DeclarationSource,
    TransitionExpand,
  },
  data() {
    return {
      selectedIdentifier: this.identifier,
    };
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
    store: {
      default: () => ({
        state: {
          references: {},
        },
      }),
    },
    identifier: {
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
    expandOverloads: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    hasOtherDeclarations: ({ declaration }) => declaration.otherDeclarations || null,
    declarationTokens: ({
      declaration,
      hasOtherDeclarations,
      identifier,
    }) => {
      if (!hasOtherDeclarations) return [declaration];
      const {
        otherDeclarations,
        indexInOtherDeclarations,
        tokens,
      } = declaration;

      // insert declaration into the correct position if has overloaded symbols
      return [
        ...otherDeclarations.slice(0, indexInOtherDeclarations),
        { tokens, identifier },
        ...otherDeclarations.slice(indexInOtherDeclarations),
      ];
    },
    classes: ({ changeType, multipleLinesClass, displaysMultipleLinesAfterAPIChanges }) => ({
      [`declaration-group--changed declaration-group--${changeType}`]: changeType,
      [multipleLinesClass]: displaysMultipleLinesAfterAPIChanges,
    }),
    caption() {
      return this.declaration.platforms.join(', ');
    },
    isSwift: ({ interfaceLanguage }) => interfaceLanguage === Language.swift.key.api,
    references: ({ store }) => store.state.references,
    isExpanded: {
      get: ({ expandOverloads }) => expandOverloads,
      set(value) {
        this.$emit('update:expandOverloads', value);
      },
    },
  },
  methods: {
    async handleSelectOverload(identifier) {
      this.selectedIdentifier = identifier;
      // enough time to update the just selected item
      await waitFor(100);
      this.isExpanded = false; // collapse the overloads
      if (identifier === this.identifier) return;
      // await animation finishes
      setTimeout(() => {
        this.$router.push(this.references[identifier].url);
      }, 500);
    },
    getWrapperComponent(decl) {
      return (!this.isExpanded || decl.identifier === this.identifier)
        ? 'div' : 'button';
    },
    isSelectedOverload(identifier) {
      return identifier === this.selectedIdentifier;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.platforms {
  @include font-styles(body-reduced);

  margin-bottom: 0.45rem;
  margin-top: var(--spacing-stacked-margin-xlarge);

  .changed & {
    padding-left: $code-source-spacing;
  }

  &:first-of-type {
    margin-top: 1rem;
  }
}

.declaration-overload {
  transition-timing-function: linear;
  transition-property: opacity, height;

  > button {
    display: block;
    width: 100%;
  }

  .selected-overload {
    border-color: var(--color-focus-border-color, var(--color-focus-border-color));
  }

  :not(.selected-overload) {
    background: unset;
  }

  + .declaration-overload .source {
    margin: var(--declaration-code-listing-margin);
  }

  &.expand-enter, &.expand-leave-to {
    opacity: 0;

    .source {
      margin: 0;
    }
  }
}

.source {
  transition: margin 0.3s linear;

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
