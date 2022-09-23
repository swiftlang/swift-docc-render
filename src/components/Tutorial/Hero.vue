<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <LinkableSection
    anchor="introduction"
    :title="sectionTitle"
    class="tutorial-hero"
  >
    <div class="hero dark">
      <div v-if="backgroundImageUrl" class="bg" :style="bgStyle" />
      <slot name="above-title" />
      <Row>
        <Column>
          <Headline :level="1">
            <template v-if="chapter" slot="eyebrow">{{ chapter }}</template>
            {{ title }}
          </Headline>
          <div v-if="content || video" class="intro">
            <ContentNode v-if="content" :content="content" />
            <template v-if="video">
              <p>
                <a
                  href="#"
                  class="call-to-action"
                  @click.prevent="toggleCallToActionModal"
                >
                  Watch intro video
                  <PlayIcon class="cta-icon icon-inline" />
                </a>
              </p>
              <GenericModal
                :visible.sync="callToActionModalVisible"
                isFullscreen
                theme="dark"
              >
                <Asset
                  ref="asset"
                  class="video-asset"
                  v-show="callToActionModalVisible"
                  :identifier="video"
                  @videoEnded="handleVideoEnd"
                />
              </GenericModal>
            </template>
          </div>
          <Metadata
            :projectFilesUrl="projectFilesUrl"
            :estimatedTimeInMinutes="estimatedTimeInMinutes"
            :xcodeRequirement="xcodeRequirementData"
            class="metadata"
          />
        </Column>
      </Row>
    </div>
  </LinkableSection>
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';
import Headline from 'docc-render/components/Headline.vue';
import Asset from 'docc-render/components/Asset.vue';
import LinkableElement from 'docc-render/components/LinkableElement.vue';

import GenericModal from 'docc-render/components/GenericModal.vue';
import PlayIcon from 'theme/components/Icons/PlayIcon.vue';
import { normalizeAssetUrl, toCSSUrl } from 'docc-render/utils/assets';
import HeroMetadata from './HeroMetadata.vue';

export default {
  name: 'Hero',
  components: {
    PlayIcon,
    GenericModal,
    Column: {
      render(createElement) {
        return createElement(GridColumn, {
          props: {
            span: {
              large: 7,
              medium: 9,
              small: 12,
            },
          },
        }, (
          this.$slots.default
        ));
      },
    },
    ContentNode,
    Headline,
    Metadata: HeroMetadata,
    Row: GridRow,
    Asset,
    LinkableSection: LinkableElement,
  },
  inject: ['references'],
  props: {
    title: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
    },
    content: {
      type: Array,
    },
    projectFiles: {
      type: String,
    },
    estimatedTimeInMinutes: {
      type: Number,
    },
    xcodeRequirement: {
      type: String,
      required: false,
    },
    video: {
      type: String,
    },
    backgroundImage: {
      type: String,
    },
  },
  computed: {
    backgroundImageUrl() {
      const reference = this.references[this.backgroundImage] || {};
      const { variants = [] } = reference;
      const lightVariant = variants.find(variant => (
        variant.traits.includes('light')
      ));

      return (lightVariant || {}).url;
    },
    projectFilesUrl() {
      return this.projectFiles ? normalizeAssetUrl(this.references[this.projectFiles].url) : null;
    },
    bgStyle() {
      return {
        backgroundImage: toCSSUrl(this.backgroundImageUrl),
      };
    },
    xcodeRequirementData() {
      return this.references[this.xcodeRequirement];
    },
    sectionTitle() {
      return 'Introduction';
    },
  },
  data() {
    return {
      callToActionModalVisible: false,
    };
  },
  methods: {
    async toggleCallToActionModal() {
      this.callToActionModalVisible = true;
      // make sure the modal is rendered
      await this.$nextTick();
      // Get video element by ref
      const videoPlayer = this.$refs.asset.$el.querySelector('video');
      if (!videoPlayer) return;
      try {
        // Start video playback
        await videoPlayer.play();
        videoPlayer.muted = false;
      } catch (e) {
        // catch any errors
      }
    },
    handleVideoEnd() {
      this.callToActionModalVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.hero {
  background-color: var(--color-tutorial-hero-background);
  color: var(--color-tutorial-hero-text);
  position: relative;
}

.bg {
  background-color: var(--color-tutorial-hero-background);
  background-position: top;
  background-repeat: no-repeat;
  background-size: cover;
  content: "";
  height: 100%;
  left: 0;
  opacity: 0.3;
  position: absolute;
  top: 0;
  width: 100%;
}

.row {
  @include breakpoint-content();
  padding: $inter-section-spacing-single-side 0;
}

.col {
  z-index: 1;
}

/deep/ .eyebrow {
  @include font-styles(eyebrow);
  color: var(--color-hero-eyebrow);
}

.headline {
  @include font-styles(headline);
  margin-bottom: 2rem;
}

.intro {
  @include font-styles(body-large);
}

.content + p {
  margin-top: $stacked-margin-large;
  @include breakpoint(small) {
    margin-top: 8px;
  }
}

.call-to-action {
  display: flex;
  align-items: center;

  .cta-icon {
    margin-left: .4rem;
    width: 1em;
    height: 1em;
  }
}

.metadata {
  margin-top: 2rem;
}

.video-asset {
  display: grid;
  height: 100vh;
  margin: 0;
  place-items: center center;
}

.video-asset /deep/ video {
  max-width: 1280px;
  min-width: 320px;
  width: 100%;
}

.headline {
  @include breakpoint(small) {
    margin-bottom: 19px;
  }
}

</style>
