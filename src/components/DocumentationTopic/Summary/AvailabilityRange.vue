<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <span
    role="text"
    :aria-label="ariaLabel"
    :title="description"
  >
    {{text}}
  </span>
</template>

<script>
export default {
  name: 'AvailabilityRange',
  props: {
    deprecatedAt: {
      type: String,
      required: false,
    },
    introducedAt: {
      type: String,
      required: true,
    },
    platformName: {
      type: String,
      required: true,
    },
  },
  computed: {
    ariaLabel() {
      const {
        deprecatedAt,
        description,
        text,
      } = this;
      return [text]
        .concat(deprecatedAt ? 'Deprecated' : [])
        .concat(description)
        .join(', ');
    },
    description() {
      const {
        deprecatedAt,
        introducedAt,
        platformName: name,
      } = this;
      return deprecatedAt ? (
        `Introduced in ${name} ${introducedAt} and deprecated in ${name} ${deprecatedAt}`
      ) : (
        `Available on ${name} ${introducedAt} and later`
      );
    },
    text() {
      const {
        deprecatedAt,
        introducedAt,
        platformName: name,
      } = this;
      return deprecatedAt ? (
        `${name} ${introducedAt}\u2013${deprecatedAt}`
      ) : (
        `${name} ${introducedAt}+`
      );
    },
  },
};
</script>
