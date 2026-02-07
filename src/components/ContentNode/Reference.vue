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
import ReferenceExternalSymbol from './ReferenceExternalSymbol.vue';
import ReferenceExternal from './ReferenceExternal.vue';
import ReferenceInternalSymbol from './ReferenceInternalSymbol.vue';
import ReferenceInternal from './ReferenceInternal.vue';

/**
 * Link to internal or external resources.
 *
 * Use this component when you want to link to a page, especially when working
 * with dynamic URLs that may sometimes point to external content and other
 * times point to internal documentation pages.
 *
 * Slotted content will be used as the inline content for the resulting anchor
 * or span tag.
 *
 * - Parameter url: `String` (**required**) — The link destination. Can be an
 *     absolute URL to an external location or a root relative path to a page
 *     rendered with this application.
 * - Parameter kind: `String` — The type of an internal page. See
 *     [DocumentationRenderNode.kind](https://github.com/apple/swift-docc/blob/5ad35a3107ca0443b81ada917b73b950d89bf396/Sources/SwiftDocC/SwiftDocC.docc/Resources/RenderNode.spec.json#L2005C27-L2005C27)
 *     for valid values.
 * - Parameter role: `String` — The purpose an internal page serves.
 * - Parameter isActive: `Boolean` — Whether the content should be linked or not.
 * - Parameter ideTitle: `String` — Content to be used in IDE targets.
 * - Parameter titleStyle: `String` — A display style to be used for plist
 *     symbols. See
 *     [TopicRenderReference.type](https://github.com/apple/swift-docc/blob/5ad35a3107ca0443b81ada917b73b950d89bf396/Sources/SwiftDocC/SwiftDocC.docc/Resources/RenderNode.spec.json#L1761)
 *     for valid values.
 * - Parameter hasInlineFormatting: `Boolean` — Whether the display content has
 *     inline formatting or not.
 */
export default {
  name: 'Reference',
  computed: {
    isInternal({ url, linksToAsset }) {
      if (!url) {
        return false;
      }
      if (!url.startsWith('/') && !url.startsWith('#')) {
        // If the URL has a scheme, it's not an internal link.
        return false;
      }

      if (linksToAsset) return false;

      // Resolve the URL using the router.
      const {
        resolved: {
          name,
        } = {},
      } = this.$router.resolve(url) || {};

      // Resolved internal URLs don't have the "not found" route.
      return !name.startsWith(notFoundRouteName);
    },
    isSymbolReference() {
      return this.kind === 'symbol' && !this.hasInlineFormatting
        && (this.role === TopicRole.symbol || this.role === TopicRole.dictionarySymbol);
    },
    isDisplaySymbol({ isSymbolReference, titleStyle, ideTitle }) {
      return ideTitle ? (isSymbolReference && titleStyle === 'symbol') : isSymbolReference;
    },
    refComponent({ isInternal, isDisplaySymbol }) {
      if (isInternal) {
        return isDisplaySymbol ? ReferenceInternalSymbol : ReferenceInternal;
      }
      return isDisplaySymbol ? ReferenceExternalSymbol : ReferenceExternal;
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
      required: false,
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
    hasInlineFormatting: {
      type: Boolean,
      default: false,
    },
    linksToAsset: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
