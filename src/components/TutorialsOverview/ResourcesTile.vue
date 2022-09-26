<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="tile">
    <div v-if="identifier" class="icon">
      <component :is="iconComponent" />
    </div>
    <div class="title">{{ title }}</div>
    <ContentNode :content="content" />
    <DestinationDataProvider
      v-if="action"
      :destination="action"
    >
      <Reference
        slot-scope="{ url, title }"
        class="link"
        :url="url"
      >
        {{ title }}
        <InlineChevronRightIcon class="link-icon icon-inline" />
      </Reference>
    </DestinationDataProvider>
  </div>
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';
import CurlyBracketsIcon from 'theme/components/Icons/CurlyBracketsIcon.vue';
import DocumentIcon from 'theme/components/Icons/DocumentIcon.vue';
import DownloadIcon from 'theme/components/Icons/DownloadIcon.vue';
import ForumIcon from 'theme/components/Icons/ForumIcon.vue';
import PlayIcon from 'theme/components/Icons/PlayIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import DestinationDataProvider from 'docc-render/components/DestinationDataProvider.vue';

const Identifier = {
  documentation: 'documentation',
  downloads: 'downloads',
  featured: 'featured',
  forums: 'forums',
  sampleCode: 'sampleCode',
  videos: 'videos',
};

export default {
  name: 'Tile',
  constants: { Identifier },
  components: {
    DestinationDataProvider,
    InlineChevronRightIcon,
    ContentNode,
    CurlyBracketsIcon,
    DocumentIcon,
    DownloadIcon,
    ForumIcon,
    PlayIcon,
    Reference,
  },
  props: {
    action: {
      type: Object,
      required: false,
    },
    content: {
      type: Array,
      required: true,
    },
    identifier: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      require: true,
    },
  },
  computed: {
    iconComponent: ({ identifier }) => ({
      [Identifier.documentation]: DocumentIcon,
      [Identifier.downloads]: DownloadIcon,
      [Identifier.forums]: ForumIcon,
      [Identifier.sampleCode]: CurlyBracketsIcon,
      [Identifier.videos]: PlayIcon,
    })[identifier],
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.tile {
  background: var(--color-tutorials-overview-fill-secondary, dark-color(fill-secondary));
  padding: 40px 30px;
  color: var(--color-tutorials-overview-content-alt);
}

a, .content /deep/ a {
  color: var(--colors-link, var(--color-tutorials-overview-link));
}

.icon {
  $icon-size-default: rem(25px);
  display: block;
  height: $icon-size-default;
  line-height: $icon-size-default;
  margin-bottom: rem(10px);
  width: $icon-size-default;

  /deep/ svg.svg-icon {
    width: 100%;
    max-height: 100%;

    // ensure the icon is always the same color as the content
    fill: var(--color-tutorials-overview-icon);

    .svg-icon-stroke {
      stroke: var(--color-tutorials-overview-content-alt);
    }
  }
}

.title {
  @include font-styles(tutorials-overview-chapter-title);
  margin-bottom: 0.8em;
}

.content, .link {
  @include font-styles(body-reduced);
}

.content {
  color: var(--color-tutorials-overview-content-alt);
}

.link {
  display: block;
  margin-top: rem(20px);

  .link-icon {
    margin-left: .2em;
    width: 0.6em;
    height: 0.6em;
  }
}

/deep/ .content {
  ul {
    list-style-type: none;
    margin-left: 0;
    @include font-styles(body-reduced-tight);

    // fix AX navigation
    li:before {
      content: "\200B"; /* add zero-width space */
      position: absolute; /* ensures it doesn't cause a gap */
    }
  }

  li + li {
    margin-top: 8px;
  }
}

@include breakpoint(small) {
  .tile {
    padding: rem(30px) rem(20px);
  }
}
</style>
