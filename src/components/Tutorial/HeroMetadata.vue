<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="metadata">
    <div
      class="item"
      v-if="estimatedTimeInMinutes"
      :aria-label="`${estimatedTimeInMinutes} minutes estimated time`"
    >
      <!-- Accessibility warning: if you remove the label above,
      also remove the aria-hidden="true" values below. -->
      <div class="content" aria-hidden="true">
        <div class="duration">
          {{ estimatedTimeInMinutes }}
          <div class="minutes">min</div>
        </div>
      </div>
      <div class="bottom" aria-hidden="true">Estimated Time</div>
    </div>
    <div class="item" v-if="projectFilesUrl">
      <DownloadIcon class="item-large-icon icon-inline" />
      <div class="content bottom">
        <a
          class="content-link project-download"
          :href="projectFilesUrl"
        >
          Project files
          <InlineDownloadIcon class="small-icon icon-inline" />
        </a>
      </div>
    </div>
    <div class="item" v-if="xcodeRequirement">
      <XcodeIcon class="item-large-icon icon-inline" />
      <div class="content bottom">
        <span v-if="isTargetIDE">{{ xcodeRequirement.title }}</span>
        <a v-else :href="xcodeRequirement.url" class="content-link">
          {{ xcodeRequirement.title }}
          <InlineChevronRightIcon class="icon-inline small-icon xcode-icon" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import DownloadIcon from 'theme/components/Icons/DownloadIcon.vue';
import XcodeIcon from 'theme/components/Icons/XcodeIcon.vue';
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import InlineDownloadIcon from 'theme/components/Icons/InlineDownloadIcon.vue';

export default {
  name: 'HeroMetadata',
  components: {
    InlineDownloadIcon,
    InlineChevronRightIcon,
    DownloadIcon,
    XcodeIcon,
  },
  inject: ['isTargetIDE'],
  props: {
    projectFilesUrl: {
      type: String,
    },
    estimatedTimeInMinutes: {
      type: Number,
    },
    xcodeRequirement: {
      type: Object,
      required: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.metadata {
  display: flex;
}

.item {
  @include font-styles(metadata-item);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border-right: 1px solid dark-color(figure-gray);
  padding: 0 27.5px;
  @include breakpoint(small) {
    padding: 0 8px;
  }
}

.item:first-of-type {
  padding-left: 0;
}

.item:last-of-type {
  border: none;
  @include breakpoint(small) {
    padding-right: 0;
  }
}

.content {
  color: dark-color(figure-gray);
}

.icon {
  @include font-styles(headline);
}

.small-icon {
  width: 1em;
  height: 1em;
  margin-left: .2rem;

  &.xcode-icon {
    width: 0.8em;
    height: 0.8em;
  }
}

.content-link {
  display: flex;
  align-items: center;
}

a {
  color: var(--colors-link, var(--color-tutorials-overview-link));
}

.duration {
  display: flex;
  align-items: baseline;
  @include font-styles(metadata-item-duration);
  @include breakpoint(small) {
    line-height: 1.3rem;
  }
  line-height: 1.8rem;
}

.minutes {
  display: inline-block;
  @include font-styles(metadata-item-duration-minutes);
  @include breakpoint(small) {
    line-height: .8rem;
  }
  line-height: 1.3rem;
}

.item-large-icon {
  height: 2.3rem;
  max-width: 100%;

  @include breakpoint(small) {
    height: 1.5rem;
    max-width: 100%;
  }
}

.bottom {
  margin-top: 13px;
  @include breakpoint(small) {
    margin-top: 8px;
  }
}

</style>
