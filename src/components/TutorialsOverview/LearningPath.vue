<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="learning-path" :class="classes">
    <div class="main-container">
      <div v-if="!isTargetIDE" class="secondary-content-container">
        <TutorialsNavigation :sections="sections" aria-label="On this page" />
      </div>
      <div class="primary-content-container">
        <div class="content-sections-container">
          <Volume
            v-for="(volume, i) in volumes"
            v-bind="propsFor(volume)"
            :key="`volume_${i}`"
            class="content-section"
          />
          <component
            v-for="(section, i) in otherSections"
            v-bind="propsFor(section)"
            :is="componentFor(section)"
            :key="`resource_${i}`"
            class="content-section"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Resources from './Resources.vue';
import TutorialsNavigation from './TutorialsNavigation.vue';
import Volume from './Volume.vue';

const SectionKind = {
  resources: 'resources',
  volume: 'volume',
};

export default {
  name: 'LearningPath',
  components: {
    Resources,
    TutorialsNavigation,
    Volume,
  },
  constants: { SectionKind },
  inject: {
    isTargetIDE: { default: false },
  },
  props: {
    sections: {
      type: Array,
      required: true,
      validator: sections => sections.every(section => (
        Object.prototype.hasOwnProperty.call(SectionKind, section.kind)
      )),
    },
  },
  computed: {
    classes: ({ isTargetIDE }) => ({ ide: isTargetIDE }),
    partitionedSections: ({ sections }) => sections.reduce(([volumes, others], section) => (
      section.kind === SectionKind.volume ? (
        [volumes.concat(section), others]
      ) : (
        [volumes, others.concat(section)]
      )
    ), [[], []]),
    volumes: ({ partitionedSections }) => partitionedSections[0],
    otherSections: ({ partitionedSections }) => partitionedSections[1],
  },
  methods: {
    componentFor: ({ kind }) => ({
      [SectionKind.resources]: Resources,
      [SectionKind.volume]: Volume,
    }[kind]),
    propsFor: ({
      chapters,
      content,
      image,
      kind,
      name,
      tiles,
    }) => ({
      [SectionKind.resources]: {
        content,
        tiles,
      },
      [SectionKind.volume]: {
        chapters,
        content,
        image,
        name,
      },
    }[kind]),
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.learning-path {
  background: var(--color-tutorials-overview-fill, dark-color(fill));
  padding: rem(80px) 0;
}

.main-container {
  @include breakpoint-content;
  align-items: stretch;
  display: flex;
  justify-content: space-between;

  .ide & {
    justify-content: center;
  }
}

.secondary-content-container {
  $width: 200px;

  flex: 0 0 $width;
  width: $width;
}

.tutorials-navigation {
  $sticky-tutorial-padding: rem(80px);
  position: sticky;
  top: $nav-height + $sticky-tutorial-padding;
}

.primary-content-container {
  flex: 0 1 720px;
  max-width: 100%;
}

.content-sections-container {
  .content-section {
    border-radius: 12px;
    overflow: hidden;
  }

  .content-section + .content-section {
    margin-top: rem(20px);
  }
}

@include breakpoint-between-medium-and-nav-medium {
  .learning-path {
    padding: rem(40px) 0;
  }

  .primary-content-container {
    flex-basis: auto;
    margin-left: rem(22px);
  }

  .secondary-content-container {
    $width: 180px;

    flex: 0 0 $width;
    width: $width;
  }
}

@include breakpoint(small, $scope: nav) {
  .secondary-content-container {
    display: none;
  }
}

@include breakpoint(small) {
  .content-sections-container {
    .content-section {
      border-radius: 0;

      &.volume {
        margin-top: rem(20px);
      }
    }
  }

  .learning-path {
    padding: 0;
  }

  .main-container {
    width: 100%;
  }
}
</style>
