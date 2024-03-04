<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="availability" role="complementary" :aria-label="$t('sections.availability')">
    <span
      v-for="technology in technologies"
      class="technology"
      :key="technology"
    >
      <TechnologyIcon class="tech-icon" />
      <span>{{ technology }}</span>
    </span>

    <span
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
      <Badge v-if="platform.deprecatedAt" variant="deprecated" />
      <Badge v-else-if="platform.beta" variant="beta" />
    </span>
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
$icon-size-default: 20px;
$availability-info-spacing: 10px;

.technology, .platform {
  display: inline-flex;
  align-items: center;
}

.tech-icon {
  height: 12px;
  padding-right: 5px;
  --color-svg-icon: var(--color-figure-gray);
}

.changed {
  $-coin-spacer: 5px;
  padding-left: $icon-size-default - $-coin-spacer + 2;
  border: none;

  &::after {
    // unset the global .changed style
    all: unset;
  }

  &::before {
    @include coin($modified-svg, $icon-size-default);
    margin: 0;
    left: -$-coin-spacer;

    @include prefers-dark {
      background-image: $modified-dark-svg;
    }
  }

  &-added::before {
    background-image: $added-svg;

    @include prefers-dark {
      background-image: $added-dark-svg;
    }
  }

  &-deprecated::before {
    background-image: $deprecated-svg;

    @include prefers-dark {
      background-image: $deprecated-dark-svg;
    }
  }
}

.availability {
  display: flex;
  flex-flow: row wrap;
  gap: $availability-info-spacing;
  margin-top: rem(15px);
  @include font-styles(body-reduced);

  & > * {
    &::after {
      content: '';
      display: inline-block;
      width: 1px;
      height: rem(14px);
      background: currentColor;
      margin-left: $availability-info-spacing;
    }

    &:last-child::after {
      content: none;
    }
  }
}
</style>
