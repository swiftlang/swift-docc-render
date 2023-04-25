<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="preview">
    <!-- success, show a preview -->
    <DocumentationTopic
      v-if="state === STATE.success"
      v-bind="topicProps"
      enableMinimized
    />
    <!-- only show a loader in the UI if things are loading slowly -->
    <!-- otherwise, show nothing for the default loading state -->
    <!-- TODO: extract a more generic loader component in the future -->
    <div v-else-if="state === STATE.loadingSlowly" class="loading">
      <div
        v-for="style in LOADER_ROW_STYLES"
        class="loading-row"
        :key="style['--index']"
        :style="style"
      />
    </div>
    <!-- error, unavailable message -->
    <div v-else-if="state === STATE.error" class="unavailable">
      <p>Preview unavailable</p>
    </div>
  </div>
</template>

<script>
import DocumentationTopic from 'docc-render/components/DocumentationTopic.vue';
import { clone } from 'docc-render/utils/data';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';

const { extractProps } = DocumentationTopic.methods;

const HERO_KIND = 'hero';
const STATE = {
  error: 'error',
  loading: 'loading',
  loadingSlowly: 'loadingSlowly',
  success: 'success',
};

const PreviewStore = {
  ...DocumentationTopicStore,
  state: clone(DocumentationTopicStore.state),
};

export default {
  name: 'QuickNavigationPreview',
  components: { DocumentationTopic },
  constants: { PreviewState: STATE },
  data() {
    return {
      store: PreviewStore,
    };
  },
  provide() {
    return {
      store: this.store,
    };
  },
  props: {
    json: {
      type: Object,
      required: false,
    },
    state: {
      type: String,
      required: true,
      validator: v => Object.hasOwnProperty.call(STATE, v),
    },
  },
  computed: {
    LOADER_ROW_STYLES: () => ([
      { '--index': 0, width: '30%' },
      { '--index': 1, width: '80%' },
      { '--index': 2, width: '50%' },
    ]),
    STATE: () => STATE,
    topicProps: ({ json }) => {
      const props = extractProps(json);

      // massage the render JSON for both /documentation/* and /tutorials/*
      // pages into props that can be safely rendered using a minimized
      // `DocumentationTopic` component
      //
      // for /tutorials/* pages, this means extracting the first `sections`
      // hero item and using its content as the `abstract`
      const { sections = [] } = json;
      let { abstract } = props;
      const hero = sections.find(({ kind }) => kind === HERO_KIND);
      if (!abstract && hero) {
        abstract = hero.content;
      }

      return {
        ...props,
        abstract,
      };
    },
  },
  watch: {
    async json(json) {
      const { references = {} } = json || {};
      await this.$nextTick();
      PreviewStore.setReferences(references);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.preview {
  @include breakpoint(small) {
    display: none;
  }
}

.unavailable {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
}

.loading {
  padding: 20px;

  &-row {
    animation: pulse 2.5s ease;
    animation-delay: calc(1s + 0.3s * var(--index));
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    background-color: var(--color-fill-gray-tertiary);
    border-radius: 4px;
    height: 12px;
    margin: 20px 0;
    opacity: 0;

    &:first-of-type {
      margin-top: 0;
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
