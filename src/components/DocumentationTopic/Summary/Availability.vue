<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="availability" role="complementary" aria-label="Availability">
    <Badge
      v-for="technology in technologies"
      class="technology"
      :key="technology"
    >
      <TechnologyIcon class="tech-icon" />
      {{ technology }}
    </Badge>

    <Badge
      v-for="platform in platforms"
      class="platform"
      :class="changesClassesFor(platform.name)"
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
import { ChangeTypes } from 'docc-render/constants/Changes';
import { getAPIChanges } from 'docc-render/mixins/apiChangesHelpers';
import TechnologyIcon from 'theme/components/Icons/TechnologyIcon.vue';
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
    TechnologyIcon,
  },
  props: {
    platforms: {
      type: Array,
      required: true,
    },
    technologies: {
      type: Array,
      required: false,
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

.technology {
  display: inline-flex;
  align-items: center;
}

.tech-icon {
  height: 12px;
  padding-right: 5px;
  fill: var(--badge-color);

  .theme-dark & {
    fill: var(--badge-color);
  }
}

.beta {
  color: var(--color-badge-beta);

  .theme-dark & {
    color: var(--color-badge-dark-beta);
  }
}

.deprecated {
  color: var(--color-badge-deprecated);

  .theme-dark & {
    color: var(--color-badge-dark-deprecated);
  }
}

.changed {
  $-coin-spacer: 5px;
  padding-left: $icon-size-default + ($-coin-spacer * 2);

  &::after {
    content: none;
  }

  &::before {
    @include coin($modified-svg, $icon-size-default);
    left: $-coin-spacer;

    @include prefers-dark {
      background-image: $modified-dark-svg;
    }

    .theme-dark & {
      background-image: $modified-dark-svg;
    }
  }

  &-added {
    border-color: var(--color-changes-added);

    &::before {
      background-image: $added-svg;

      @include prefers-dark {
        background-image: $added-dark-svg;
      }

      .theme-dark & {
        background-image: $added-dark-svg;
      }
    }
  }

  &-deprecated {
    border-color: var(--color-changes-deprecated);

    &::before {
      background-image: $deprecated-svg;

      @include prefers-dark {
        background-image: $deprecated-dark-svg;
      }

      .theme-dark & {
        background-image: $deprecated-dark-svg;
      }
    }
  }

  &-modified {
    border-color: var(--color-changes-modified);
  }
}
</style>
