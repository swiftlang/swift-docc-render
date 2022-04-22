<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component :is="refComponent" :url="urlWithParams" :is-active="isActiveComputed">
    <slot />
  </component>
</template>

<script>
import { buildUrl } from 'docc-render/utils/url-helper';
import { TopicRole } from 'docc-render/constants/roles';

import { notFoundRouteName } from 'docc-render/constants/router';
import ReferenceExternal from './ReferenceExternal.vue';
import ReferenceInternalSymbol from './ReferenceInternalSymbol.vue';
import ReferenceInternal from './ReferenceInternal.vue';

export default {
  name: 'Reference',
  computed: {
    isInternal({ url }) {
      if (!url.startsWith('/') && !url.startsWith('#')) {
        // If the URL has a scheme, it's not an internal link.
        return false;
      }

      // Resolve the URL using the router.
      const {
        resolved: {
          name,
        } = {},
      } = this.$router.resolve(url) || {};

      // Resolved internal URLs don't have the "not found" route.
      return name !== notFoundRouteName;
    },
    isSymbolReference() {
      return this.kind === 'symbol'
        && (this.role === TopicRole.symbol || this.role === TopicRole.dictionarySymbol);
    },
    isDisplaySymbol({ isSymbolReference, titleStyle, ideTitle }) {
      return ideTitle ? (isSymbolReference && titleStyle === 'symbol') : isSymbolReference;
    },
    refComponent() {
      if (!this.isInternal) {
        return ReferenceExternal;
      }
      if (this.isDisplaySymbol) {
        return ReferenceInternalSymbol;
      }
      return ReferenceInternal;
    },
    urlWithParams({ isInternal }) {
      return isInternal ? buildUrl(this.url, this.$route.query) : this.url;
    },
    isActiveComputed({ url, isActive }) {
      return !!(url && isActive);
    },
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    kind: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    ideTitle: {
      type: String,
      required: false,
    },
    titleStyle: {
      type: String,
      required: false,
    },
  },
};
</script>
