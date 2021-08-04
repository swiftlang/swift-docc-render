<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="content-and-media" :class="classes">
    <ContentNode :content="content" />
    <Asset :identifier="media" />
  </div>
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import ContentNode from 'docc-render/components/Article/ContentNode.vue';

const MediaPosition = {
  leading: 'leading',
  trailing: 'trailing',
};

export default {
  name: 'ContentAndMedia',
  components: {
    Asset,
    ContentNode,
  },
  props: {
    content: ContentNode.props.content,
    media: Asset.props.identifier,
    mediaPosition: {
      type: String,
      default: () => MediaPosition.trailing,
      validator: pos => Object.prototype.hasOwnProperty.call(MediaPosition, pos),
    },
  },
  computed: {
    classes() {
      return {
        'media-leading': this.mediaPosition === MediaPosition.leading,
        'media-trailing': this.mediaPosition === MediaPosition.trailing,
      };
    },
  },
  MediaPosition,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$col-width-content: calculate-column-width(7.5);
$col-width-media: calculate-column-width(3.5);
$col-offset: 100% - ($col-width-content + $col-width-media);

.content-and-media {
  display: flex;

  &.media-leading {
    flex-direction: row-reverse;
  }

  &.media-trailing {
    flex-direction: row;
  }

  // For medium/large breakpoints only, vertically align the content of the
  // columns with each other
  @include breakpoints-from(medium) {
    align-items: center;
    justify-content: center;
  }
}

.content {
  width: $col-width-content;
}

.asset {
  width: $col-width-media;

  .media-leading & {
    margin-right: $col-offset;
  }

  .media-trailing & {
    margin-left: $col-offset;
  }
}

@include breakpoint(small) {
  // The content should always be ordered first visually on small breakpoints,
  // even if the media is leading on medium/large breakpoints
  .content-and-media {
    &.media-leading,
    &.media-trailing {
      flex-direction: column;
    }
  }

  .content,
  .asset {
    width: 100%;
  }

  .asset {
    .media-leading &,
    .media-trailing & {
      margin: $article-stacked-margin-small 0 0 0;
    }
  }
}
</style>
