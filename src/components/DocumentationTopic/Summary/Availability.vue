<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="availability" role="complementary" :aria-label="$t('sections.availability')">
    <div
      v-for="technology in technologies"
      class="technology"
      :key="technology"
    >
      <TechnologyIcon class="tech-icon" />
      <span>{{ technology }}</span>
    </div>

    <div
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
      <Badge v-if=badgeFor(platform) :variant="badgeFor(platform)"> </Badge>
    </div>
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
    badgeFor(platform) {
      return platform.deprecatedAt ? 'deprecated' : (platform.beta && 'beta');
    },
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
  margin-top: rem(15px);
  @include font-styles(body-reduced);

  div:not(:last-child) {
    // apply on the span of technology class to ensure same separator height
    &.platform:after, &.technology > span:after {
      content: " ";
      border-right: 1px solid;
      padding-left: 10px;
    }
  }
}

.technology {
  display: inline-flex;
  align-items: center;
}

.tech-icon {
  height: 12px;
  padding-right: 5px;
  fill: var(--badge-color);

  @include prefers-dark {
    fill: var(--badge-dark-color);
  }
}

.beta, .deprecated {
  border-radius: 3px;
  padding: 2px 4px;
  border: none;
  color: var(--colors-button-text, var(--color-button-text));
}

.beta {
  background-color: var(--color-badge-beta);

  @include prefers-dark {
    background-color: var(--color-badge-dark-beta);
  }
}

.deprecated {
  background-color:var(--color-badge-deprecated);

  @include prefers-dark {
    background-color: var(--color-badge-dark-deprecated);
  }
}

.changed {
  $-coin-spacer: 5px;
  padding-left: $icon-size-default + ($-coin-spacer * 2);

  &::after {
    content: none;
  }

  &::before {
    @include coin($modified-rounded-svg, $icon-size-default);
    left: $-coin-spacer;

    @include prefers-dark {
      background-image: $modified-dark-rounded-svg;
    }
  }

  &-added::before {
    background-image: $added-rounded-svg;

    @include prefers-dark {
      background-image: $added-dark-rounded-svg;
    }
  }

  &-deprecated::before {
    background-image: $deprecated-rounded-svg;

    @include prefers-dark {
      background-image: $deprecated-dark-rounded-svg;
    }
  }
}
</style>
