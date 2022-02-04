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
      <NavMenuItemBase class="in-page-navigation">
        <TutorialsNavigation :sections="sections" />
      </NavMenuItemBase>
      <slot name="menu-items" />
    </template>
  </NavBase>
</template>

<script>
import NavBase from 'docc-render/components/NavBase.vue';
import TutorialsNavigation from 'docc-render/components/TutorialsOverview/TutorialsNavigation.vue';
import NavTitleContainer from 'docc-render/components/NavTitleContainer.vue';
import { buildUrl } from 'docc-render/utils/url-helper';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';

const SectionKind = {
  resources: 'resources',
  volume: 'volume',
};

export default {
  name: 'Nav',
  constants: { SectionKind },
  components: {
    NavMenuItemBase,
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

.nav /deep/ .nav-menu {
  padding-top: 0;

  .nav-menu-items {
    margin-left: auto;

    @include breakpoints-from(medium, $scope: nav) {
      .in-page-navigation {
        display: none;
      }
    }

    @include breakpoint-exact(small) {
      padding: 18px 0 40px;
    }
  }
}
</style>
