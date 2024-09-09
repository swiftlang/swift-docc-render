<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <span
    role="text"
    :aria-label="ariaLabel"
    :title="description"
  >{{text}}</span>
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
      required: false,
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
        .concat(deprecatedAt ? this.$t('change-type.deprecated') : [])
        .concat(description)
        .join(', ');
    },
    description() {
      const {
        deprecatedAt,
        introducedAt,
        platformName: name,
      } = this;
      if (introducedAt && deprecatedAt) {
        return this.$t('availability.introduced-and-deprecated', {
          name,
          introducedAt,
          deprecatedAt,
        });
      }

      if (introducedAt) {
        return this.$t('availability.available-on-platform-version', {
          name,
          introducedAt,
        });
      }

      return this.$t('availability.available-on-platform', { name });
    },
    text() {
      const {
        deprecatedAt,
        introducedAt,
        platformName: name,
      } = this;
      if (introducedAt && deprecatedAt) {
        return `${name} ${introducedAt}\u2013${deprecatedAt}`;
      }

      if (introducedAt) {
        return `${name} ${introducedAt}+`;
      }

      return name;
    },
  },
};
</script>
