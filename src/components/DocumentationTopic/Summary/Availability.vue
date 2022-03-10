<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="availability" role="complementary" aria-label="Availability">
    <Badge
      v-for="platform in platforms"
      class="platform"
      :key="platform.name"
    >
      <AvailabilityRange
        :deprecatedAt="platform.deprecatedAt"
        :introducedAt="platform.introducedAt"
        :platformName="platform.name"
      />
        <span v-if="platform.deprecatedAt" class="deprecated">Deprecated</span>
        <span v-else-if="platform.beta" class="beta">Beta</span>
    </Badge>
  </Section>
</template>

<script>
import Badge from 'docc-render/components/Badge.vue';
import { getAPIChanges } from 'docc-render/mixins/apiChangesHelpers';
import { ChangeTypes } from 'docc-render/constants/Changes';
import AvailabilityRange from './AvailabilityRange.vue';
import Section from './Section.vue';

export default {
  name: 'Availability',
  mixins: [getAPIChanges],
  inject: ['identifier', 'store'],
  components: {
    Badge,
    AvailabilityRange,
    Section,
  },
  props: {
    platforms: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      state: this.store.state,
    };
  },
  methods: {
    changeFor(platform) {
      const { identifier, state: { apiChanges } } = this;
      const { availability = {} } = (apiChanges || {})[identifier] || {};
      const changeData = availability[platform];

      if (!changeData) {
        return undefined;
      }

      if (changeData.deprecated) {
        return ChangeTypes.deprecated;
      }

      if (changeData.introduced) {
        if (!changeData.introduced.previous) {
          return ChangeTypes.added;
        }
      }

      return ChangeTypes.modified;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.availability {
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
  margin-top: 20px;
}

.badge {
  margin: 0;
}

.beta {
  color: var(--color-badge-text-beta);
}
.deprecated {
  color: var(--color-badge-text-deprecated);
}
</style>
