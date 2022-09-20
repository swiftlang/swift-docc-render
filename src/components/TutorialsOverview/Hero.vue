<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="hero">
    <div class="copy-container">
      <h1 class="title">{{title}}</h1>
      <ContentNode v-if="content" :content="content" />
      <p v-if="estimatedTime" class="meta">
        <TimerIcon />
        <span class="meta-content">
          <strong class="time">{{estimatedTime}}</strong>
          <span> Estimated Time</span>
        </span>
      </p>
      <CallToActionButton
        v-if="action"
        :action="action"
        :aria-label="`${action.overridingTitle} with ${title}`"
        isDark
      />
    </div>
    <Asset v-if="image" :identifier="image" />
  </section>
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import CallToActionButton from 'docc-render/components/CallToActionButton.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';
import TimerIcon from 'theme/components/Icons/TimerIcon.vue';

export default {
  name: 'Hero',
  components: {
    Asset,
    CallToActionButton,
    ContentNode,
    TimerIcon,
  },
  props: {
    action: {
      type: Object,
      required: false,
    },
    content: {
      type: Array,
      required: false,
    },
    estimatedTime: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.hero {
  @include breakpoint-content;
  padding-bottom: rem(80px);
  padding-top: rem(80px);
}

.copy-container {
  margin: 0 auto;
  text-align: center;
  width: 720px;
}

.title {
  @include font-styles(headline);
  color: var(--color-tutorials-overview-content);
}

.content {
  @include font-styles(body-large);
  color: var(--color-tutorials-overview-content);
}

.meta {
  color: var(--color-tutorials-overview-content-alt);
  align-items: center;
  display: flex;
  justify-content: center;

  &-content {
    @include font-styles(body-reduced);
  }

  .timer-icon {
    margin-right: rem(6px);
    height: $icon-size-default;
    width: $icon-size-default;
    fill: var(--color-tutorials-overview-icon);
    @include breakpoint(small) {
      margin-right: rem(5px);
      height: rem(14px);
      width: rem(14px);
    }
  }

  .time {
    @include font-styles(tutorials-overview-hero-meta-time);
  }
}

.title + .content {
  margin-top: rem(25px);
}

.content + .meta {
  margin-top: rem(20px);
}

.button-cta {
  margin-top: rem(30px);
}

* + .asset {
  margin-top: rem(70px);
}

@include breakpoint(medium) {
  .copy-container {
    width: 636px;
  }
}

@include breakpoint(small) {
  .hero {
    padding-bottom: rem(30px);
    padding-top: rem(40px);
  }

  .copy-container {
    width: 100%;
  }

  .title + .content {
    margin-top: rem(15px);
  }

  .button-cta {
    margin-top: rem(24px);
  }

  * + .asset {
    margin-top: rem(38px);
  }
}
</style>
