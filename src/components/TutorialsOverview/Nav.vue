<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavBase>
    <NavTitleContainer :to="buildUrl($route.path, $route.query)">
      <template slot="default">
        <slot />
      </template>
      <template slot="subhead">Tutorials</template>
    </NavTitleContainer>
    <template slot="menu-items">
      <li>
        <TutorialsNavigation :sections="sections" />
      </li>
    </template>
  </NavBase>
</template>

<script>
import NavBase from 'docc-render/components/NavBase.vue';
import TutorialsNavigation from 'docc-render/components/TutorialsOverview/TutorialsNavigation.vue';
import NavTitleContainer from 'docc-render/components/NavTitleContainer.vue';
import { buildUrl } from 'docc-render/utils/url-helper';

const SectionKind = {
  resources: 'resources',
  volume: 'volume',
};

export default {
  name: 'Nav',
  constants: { SectionKind },
  components: {
    NavTitleContainer,
    TutorialsNavigation,
    NavBase,
  },
  props: {
    sections: {
      type: Array,
      require: true,
    },
  },
  methods: {
    buildUrl,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.tutorials-navigation {
  display: none;

  @include breakpoint(small, $scope: nav) {
    display: block;
  }
}

.nav /deep/ .nav-menu .nav-menu-items {
  padding: 12px 0 44px 0;
  @include breakpoints-from(medium, $scope: nav) {
    display: none;
  }
  @include breakpoint-exact(medium) {
    padding-top: 25px;
  }
  @include breakpoint-exact(small) {
    padding-top: 18px;
    padding-bottom: 40px;
  }
}
</style>
