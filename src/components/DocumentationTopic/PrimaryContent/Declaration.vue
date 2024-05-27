<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="declaration">
    <template v-if="hasModifiedChanges && !isExpanded">
      <DeclarationDiff
        :class="[changeClasses, multipleLinesClass]"
        :changes="declarationChanges"
        :changeType="changeType"
      />
    </template>
    <template v-else>
      <DeclarationList
        v-for="(declaration, i) in declarations"
        :class="changeClasses"
        :key="i"
        :declaration="declaration"
        :shouldCaption="hasPlatformVariants"
        :changeType="changeType"
        :declListExpanded.sync="isExpanded"
      />
    </template>
    <DeclarationSourceLink
      v-if="source && !isExpanded"
      :url="source.url"
      :fileName="source.fileName"
    />
    <ConditionalConstraints
      v-if="conformance"
      :constraints="conformance.constraints"
      :prefix="conformance.availabilityPrefix"
    />
  </section>
</template>

<script>
import ConditionalConstraints
  from 'docc-render/components/DocumentationTopic/ConditionalConstraints.vue';

import DeclarationList
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationList.vue';
import DeclarationDiff
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationDiff.vue';
import DeclarationSourceLink
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSourceLink.vue';

import { ChangeTypes } from 'docc-render/constants/Changes';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';

export default {
  name: 'Declaration',
  components: {
    DeclarationDiff,
    DeclarationList,
    DeclarationSourceLink,
    ConditionalConstraints,
  },
  constants: { ChangeTypes, multipleLinesClass },
  inject: ['identifier', 'store'],
  data: ({ store: { state } }) => ({
    state,
    multipleLinesClass,
  }),
  props: {
    conformance: {
      type: Object,
      required: false,
    },
    source: {
      type: Object,
      required: false,
    },
    declarations: {
      type: Array,
      required: true,
    },
    declListExpanded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /**
     * Show the captions of DeclarationGroup without changes
     * when there are more than one declarations
     * @returns {boolean}
     */
    hasPlatformVariants() {
      return this.declarations.length > 1;
    },
    /**
     * Returns whether there are declaration changes.
     * @returns {boolean}
     */
    hasModifiedChanges({ declarationChanges }) {
      if (!declarationChanges || !declarationChanges.declaration) return false;

      const changes = declarationChanges.declaration;
      return !!((changes.new || []).length && (changes.previous || []).length);
    },
    /**
     * Returns the API changes for this page
     * @returns {object}
     */
    declarationChanges:
      ({ state: { apiChanges }, identifier }) => apiChanges && apiChanges[identifier],
    /**
     * Returns the type of code change
     * @returns {"added"|"deprecated"|"modified"}
     */
    changeType: ({ declarationChanges, hasModifiedChanges }) => {
      if (!declarationChanges) return undefined;

      const changedDecl = declarationChanges.declaration;
      // if there are no declarations to diff, its most probably an addition
      if (!changedDecl) {
        return declarationChanges.change === ChangeTypes.added
          ? ChangeTypes.added
          : undefined;
      }

      if (hasModifiedChanges) {
        return ChangeTypes.modified;
      }
      return declarationChanges.change;
    },
    /**
     * Returns the appropriate changes classes
     */
    changeClasses: ({ changeType }) => ({
      [`changed changed-${changeType}`]: changeType,
    }),
    isExpanded: {
      get: ({ declListExpanded }) => declListExpanded,
      set(value) {
        this.$emit('update:declListExpanded', value);
      },
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.conditional-constraints {
  margin-top: var(--declaration-conditional-constraints-margin, 20px);
}
</style>
