<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="resources" id="resources" tabindex="-1">
    <VolumeName name="Resources" :content="content" />
    <TileGroup :tiles="tiles" />
  </section>
</template>

<script>
import onIntersectViewport, { intersectionMargins } from 'docc-render/mixins/onIntersectViewport';

import VolumeName from 'docc-render/components/TutorialsOverview/VolumeName.vue';
import ResourcesTileGroup from './ResourcesTileGroup.vue';

export default {
  name: 'Resources',
  mixins: [onIntersectViewport],
  inject: {
    store: {
      default: () => ({
        setActiveSidebarLink() {},
        setActiveVolume() {},
      }),
    },
  },
  components: {
    VolumeName,
    TileGroup: ResourcesTileGroup,
  },
  computed: {
    intersectionRootMargin: () => intersectionMargins.topOneThird,
  },
  props: {
    content: {
      type: Array,
      required: false,
    },
    tiles: {
      type: Array,
      required: true,
    },
  },
  methods: {
    onIntersectViewport() {
      this.store.setActiveSidebarLink('Resources');
      this.store.setActiveVolume(null);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.title {
  @include font-styles(heading-2-reduced);
  color: light-color(fill-tertiary);
}

.content {
  @include font-styles(body-tight);
  color: dark-color(figure-gray-secondary-alt);
  margin-top: 10px;
}
</style>
