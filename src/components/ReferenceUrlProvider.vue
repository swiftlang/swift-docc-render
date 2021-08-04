<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
import { buildUrl } from 'docc-render/utils/url-helper';

export default {
  name: 'ReferenceUrlProvider',
  inject: {
    references: {
      default: () => ({}),
    },
  },
  props: {
    reference: {
      type: String,
      required: true,
    },
  },
  computed: {
    resolvedReference: ({ references, reference }) => (references[reference] || {}),
    url: ({ resolvedReference }) => resolvedReference.url,
    title: ({ resolvedReference }) => resolvedReference.title,
  },
  render() {
    return this.$scopedSlots.default({
      url: this.url,
      urlWithParams: buildUrl(this.url, this.$route.query),
      title: this.title,
      reference: this.resolvedReference,
    });
  },
};
</script>
