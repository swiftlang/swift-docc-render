<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="declaration-list"
  >
    <transition-expand
      v-for="declaration in declarationTokens"
      :key="declaration.identifier"
    >
      <div
        v-if="!hasOtherDeclarations || declaration.identifier === selectedIdentifier || isExpanded"
        class="declaration-pill"
        :class="{
          'declaration-pill--expanded': hasOtherDeclarations && isExpanded,
          [changeClasses]: changeType && declaration.identifier === selectedIdentifier,
          'selected-declaration': isSelectedDeclaration(declaration.identifier),
        }"
      >
        <component
          :is="getWrapperComponent(declaration)"
          @click="selectDeclaration(declaration.identifier)"
          class="declaration-group-wrapper"
        >
          <DeclarationGroup
            v-bind="getDeclProp(declaration)"
          />
        </component>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import DeclarationGroup from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationGroup.vue';
import TransitionExpand from 'docc-render/components/TransitionExpand.vue';
import { waitFor } from 'docc-render/utils/loading';
import { buildUrl } from 'docc-render/utils/url-helper';

/**
 * Renders a code source with an optional caption.
 */
export default {
  name: 'DeclarationList',
  components: {
    DeclarationGroup,
    TransitionExpand,
  },
  data() {
    return {
      selectedIdentifier: this.identifier,
    };
  },
  inject: {
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
    declListExpanded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    changeClasses: ({ changeType }) => `changed changed-${changeType}`,
    hasOtherDeclarations: ({ declaration }) => declaration.otherDeclarations || null,
    declarationTokens: ({
      declaration,
      hasOtherDeclarations,
      identifier,
    }) => {
      if (!hasOtherDeclarations) return [{ ...declaration, identifier }];
      const {
        otherDeclarations: {
          declarations,
          displayIndex,
        },
        tokens,
      } = declaration;

      // insert declaration into the correct position
      return [
        ...declarations.slice(0, displayIndex),
        { tokens, identifier },
        ...declarations.slice(displayIndex),
      ];
    },
    references: ({ store }) => store.state.references,
    isExpanded: {
      get: ({ declListExpanded }) => declListExpanded,
      set(value) {
        this.$emit('update:declListExpanded', value);
      },
    },
  },
  methods: {
    async selectDeclaration(identifier) {
      if (identifier === this.identifier || !this.isExpanded) return;
      this.selectedIdentifier = identifier;
      await this.$nextTick(); // wait for identifier to update
      this.isExpanded = false; // collapse the list
      await waitFor(500); // wait for animation to finish
      const url = buildUrl(this.references[identifier].url, this.$route.query);
      this.$router.push(url);
    },
    getWrapperComponent(decl) {
      return (!this.isExpanded || decl.identifier === this.identifier)
        ? 'div' : 'button';
    },
    getDeclProp(decl) {
      return !this.hasOtherDeclarations || decl.identifier === this.identifier
        ? {
          declaration: decl,
          shouldCaption: this.shouldCaption,
          changeType: this.changeType,
        } : {
          declaration: decl,
        };
    },
    isSelectedDeclaration(identifier) {
      return identifier === this.selectedIdentifier;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.declaration-pill--expanded {
  transition-timing-function: linear;
  transition-property: opacity, height;
  margin: var(--declaration-code-listing-margin);

  > button {
    display: block;
    width: 100%;
  }

  &.expand-enter, &.expand-leave-to {
    opacity: 0;

    .source {
      margin: 0;
    }
  }

  :deep(.highlighted) {
    background: var(--color-syntax-highlighted, mark);
    font-weight: $font-weight-semibold;
  }
}

@include changedStyles {
  &.selected-declaration {
    // add back unset background for pills with changes
    background: var(--background, var(--color-code-background));
  }
}
</style>
