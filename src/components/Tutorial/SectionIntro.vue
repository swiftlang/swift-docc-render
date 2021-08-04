<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="intro-container">
    <Row :class="['intro', `intro-${sectionNumber}`, { ide: isTargetIDE }]">
      <Column class="left">
        <Headline :level="2">
          <router-link :to="sectionLink" slot="eyebrow">
            Section {{ sectionNumber }}
          </router-link>
          {{ title }}
        </Headline>
        <ContentNode :content="content" />
      </Column>
      <Column class="right">
        <div class="media">
          <!-- On mobile, show video controls instead of replay button. -->
          <Asset
            v-if="media"
            :identifier="media"
            :showsReplayButton="!isClientMobile"
            :showsVideoControls="isClientMobile"
            :videoAutoplays="!isClientMobile"
          />
        </div>
      </Column>
    </Row>
    <ExpandedIntro
      v-if="expandedSections.length > 0"
      class="expanded-intro"
      :content="expandedSections"
    />
  </div>
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import BodyContent from 'docc-render/components/Article/BodyContent.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';
import Headline from 'docc-render/components/Headline.vue';

export default {
  name: 'SectionIntro',
  inject: {
    isClientMobile: {
      default: () => false,
    },
    isTargetIDE: {
      default: () => false,
    },
  },
  components: {
    Asset,
    ContentNode,
    ExpandedIntro: BodyContent,
    Headline,
    Row: GridRow,
    Column: {
      render(createElement) {
        return createElement(GridColumn, {
          props: {
            span: {
              large: 6,
              small: 12,
            },
          },
        }, (
          this.$slots.default
        ));
      },
    },
  },
  props: {
    sectionAnchor: {
      type: String,
      required: true,
    },
    content: {
      type: Array,
      required: true,
    },
    media: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    sectionNumber: {
      type: Number,
      required: true,
    },
    expandedSections: {
      type: Array,
      default: () => ([]),
    },
  },
  methods: {
    focus() {
      this.$emit('focus', this.media);
    },
  },
  computed: {
    sectionLink() {
      return {
        path: this.$route.path,
        hash: this.sectionAnchor,
        query: this.$route.query,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.intro-container {
  margin-bottom: $tutorial-section-spacing-single-side;
}

.intro {
  display: flex;
  align-items: center;

  @include breakpoint(small) {
    padding-bottom: 0;
    flex-direction: column;
  }
  &.ide {
    .media {
      /deep/ img {
        background-color: var(--colors-text-background, var(--color-text-background));
      }
    }
  }
}

.col {
  $margin: 40px;
  $margin-medium: 28px;

  &.left {
    padding-right: $margin;

    @include breakpoint(medium) {
      padding-right: $margin-medium;
    }

    @include breakpoint(small) {
      @include breakpoint-content;
      padding-right: 0;
    }
  }

  &.right {
    padding-left: $margin;

    @include breakpoint(medium) {
      padding-left: $margin-medium;
    }

    @include breakpoint(small) {
      padding-left: 0;
    }
  }
};

.content {
  @include font-styles(body);
}

.media {
  /deep/ img {
    width: auto;
    max-height: 560px;
    min-height: rem(320px);
    object-fit: scale-down;
  }

  @include breakpoint(small) {
    margin: 0;
    margin-top: $section-spacing-single-side;

    /deep/ img, /deep/ video {
      max-height: 80vh;
    }
  }

  /deep/ .asset {
    padding: 0 20px;
  }
}

.headline {
  color: var(--colors-header-text, var(--color-header-text));
}

/deep/ .eyebrow {
  @include font-styles(eyebrow-reduced);
  a {
    color: inherit;
  }
}

/deep/ .heading {
  @include font-styles(heading-2);
}

.expanded-intro {
  @include breakpoint-content;
  margin-top: $article-stacked-margin-large;
}

/deep/ .cols-2 {
  gap: $article-stacked-margin-small calculate-column-width(2);
}

/deep/ .cols-3 .column {
  gap: $article-stacked-margin-small calculate-column-width(1.5);
}
</style>
