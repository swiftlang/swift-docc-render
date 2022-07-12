<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ol class="topic-list">
    <li
      v-for="topic in topics"
      :key="topic.url"
      :class="[kindClassFor(topic), { 'no-time-estimate': !topic.estimatedTime }]"
      class="topic"
    >
      <div class="topic-icon">
        <component :is="iconComponent(topic)" />
      </div>
      <router-link
        :to="buildUrl(topic.url, $route.query)"
        class="container"
        :aria-label="ariaLabelFor(topic)"
      >
        <div class="link">{{ topic.title }}</div>
        <div
          v-if="topic.estimatedTime"
          class="time"
        >
          <TimerIcon />
          <span class="time-label">{{ topic.estimatedTime }}</span>
        </div>
      </router-link>
    </li>
  </ol>
</template>

<script>
import TimerIcon from 'theme/components/Icons/TimerIcon.vue';
import ArticleIcon from 'theme/components/Icons/ArticleIcon.vue';
import TutorialIcon from 'theme/components/Icons/TutorialIcon.vue';
import { buildUrl } from 'docc-render/utils/url-helper';

const TopicKind = {
  article: 'article',
  tutorial: 'project', // remnant of old naming scheme "project" => "tutorial"
};

const TopicKindClass = {
  article: 'article',
  tutorial: 'tutorial',
};

const TopicKindIconLabel = {
  [TopicKind.article]: 'Article',
  [TopicKind.tutorial]: 'Tutorial',
};

export default {
  name: 'ChapterTopicList',
  components: { TimerIcon },
  constants: {
    TopicKind,
    TopicKindClass,
    TopicKindIconLabel,
  },
  props: {
    topics: {
      type: Array,
      required: true,
    },
  },
  methods: {
    buildUrl,
    iconComponent: ({ kind }) => ({
      [TopicKind.article]: ArticleIcon,
      [TopicKind.tutorial]: TutorialIcon,
    }[kind]),
    kindClassFor: ({ kind }) => ({
      [TopicKind.article]: TopicKindClass.article,
      [TopicKind.tutorial]: TopicKindClass.tutorial,
    }[kind]),
    formatTime: time => time
      .replace('min', ' minutes')
      .replace('hrs', ' hours'),
    ariaLabelFor({ title, estimatedTime, kind }) {
      const titleItems = [title, TopicKindIconLabel[kind]];
      if (estimatedTime) {
        titleItems.push(`${this.formatTime(estimatedTime)} Estimated Time`);
      }

      return titleItems.join(' - ');
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$circle-color: var(--color-fill-quaternary);
$circle-radius: rem(15px);
$circle-diameter: $circle-radius * 2;

.topic-list {
  list-style-type: none;
  margin: 50px 0 0 0;
  position: relative;

  li:before {
    content: "\200B"; /* add zero-width space */
    position: absolute; /* ensures it doesn't cause a gap */
  }

  // vertical line that runs through the circles for each link
  &::before {
    content: '';
    border-left: 1px solid $circle-color;
    display: block;
    height: calc(100% - #{$circle-radius});
    left: $circle-radius;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
  }
}

.topic {
  @include font-styles(chapter-list-item);
  display: flex;
  align-items: flex-start;

  & + & {
    margin-top: rem(10px);
  }

  // circle shape that precedes each link
  .topic-icon {
    background-color: $circle-color;
    border-radius: 50%;
    flex-shrink: 0;
    height: $circle-diameter;
    width: $circle-diameter;
    margin-right: rem(20px);
    position: relative;
    text-align: center;
    user-select: none;
    padding: rem(8px);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      fill: var(--color-tutorials-overview-icon);
      max-width: 100%;
      max-height: 100%;
      width: 100%;
    }
  }

}

.container {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-top: rem(2px);

  &:hover {
    text-decoration: none;

    .link {
      text-decoration: underline;
    }
  }
}

.timer-icon {
  margin-right: rem(5px);
  height: rem(12px);
  width: rem(12px);
  fill: var(--color-tutorials-overview-icon);
}

.time {
  @include font-styles(body-reduced-tight);
  color: var(--color-tutorials-overview-content-alt);
  align-items: center;
  display: inline-flex;
}

.link {
  padding-right: rem(10px);
  color: var(--colors-link, var(--color-tutorials-overview-link));
}

@include breakpoint-between-medium-and-nav-medium() {
  .topic-list {
    margin-top: rem(40px);
  }
}

@include breakpoint(small) {
  .topic-list {
    margin-top: rem(30px);
  }
  .topic {
    height: auto;
    align-items: flex-start;

    &.no-time-estimate {
      align-items: center;

      .topic-icon {
        align-self: flex-start;
        top: 0;
      }
    }

    & + & {
      margin-top: rem(20px);
    }

    .topic-icon {
      top: rem(5px);
      margin-right: rem(13px);
    }
  }

  .container {
    flex-wrap: wrap;
    padding-top: 0;
  }

  .link,
  .time {
    flex-basis: 100%;
  }
  .time {
    margin-top: rem(5px);
  }
}
</style>
