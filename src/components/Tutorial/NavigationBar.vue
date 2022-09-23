<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavBase
    id="nav"
    :aria-label="technology"
    hasSolidBackground
  >
    <template slot="default">
      <ReferenceUrlProvider :reference="rootReference">
        <NavTitleContainer
          slot-scope="{ urlWithParams }"
          :to="urlWithParams"
        >
          <template slot="default">{{ technology }}</template>
          <template slot="subhead">Tutorials</template>
        </NavTitleContainer>
      </ReferenceUrlProvider>
    </template>
    <template slot="after-title">
      <div class="separator"></div>
    </template>
    <template slot="tray">
      <div class="mobile-dropdown-container">
        <MobileDropdown
          :options="chapters"
          :sections="optionsForSections"
          :currentOption="currentSection ? currentSection.title : ''"
          @select-section="onSelectSection"
        />
      </div>
      <div class="dropdown-container">
        <PrimaryDropdown
          class="primary-dropdown"
          :options="chapters"
          :currentOption="topic"
        />
        <ChevronIcon class="icon-inline" />
        <SecondaryDropdown
          v-if="currentSection"
          class="secondary-dropdown"
          :options="optionsForSections"
          :currentOption="currentSection.title"
          :sectionTracker="sectionIndicatorText"
          @select-section="onSelectSection"
        />
      </div>
      <slot name="tray" :siblings="chapters.length + optionsForSections.length" />
    </template>
  </NavBase>
</template>

<script>
import ChevronIcon from 'theme/components/Icons/ChevronIcon.vue';
import ReferenceUrlProvider from 'docc-render/components/ReferenceUrlProvider.vue';
import scrollToElement from 'docc-render/mixins/scrollToElement';
import NavBase from 'docc-render/components/NavBase.vue';
import NavTitleContainer from 'docc-render/components/NavTitleContainer.vue';
import MobileDropdown from './NavigationBar/MobileDropdown.vue';
import SecondaryDropdown from './NavigationBar/SecondaryDropdown.vue';
import PrimaryDropdown from './NavigationBar/PrimaryDropdown.vue';

const FirstSectionItem = {
  title: 'Introduction',
  url: '#introduction',
  reference: 'introduction',
  sectionNumber: 0,
  depth: 0,
};

export default {
  name: 'NavigationBar',
  components: {
    NavTitleContainer,
    NavBase,
    ReferenceUrlProvider,
    PrimaryDropdown,
    SecondaryDropdown,
    MobileDropdown,
    ChevronIcon,
  },
  mixins: [scrollToElement],
  inject: ['store', 'references'],
  props: {
    chapters: {
      type: Array,
      required: true,
    },
    technology: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    rootReference: {
      type: String,
      required: true,
    },
    identifierUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentSection: FirstSectionItem,
      tutorialState: this.store.state,
    };
  },
  watch: {
    pageSectionWithHighestVisibility(section) {
      if (section) {
        this.currentSection = section;
      }
    },
  },
  computed: {
    currentProject() {
      return this.chapters
        // collect all the projects for all the chapters
        .reduce((acc, { projects }) => acc.concat(projects), [])
        // find the current project
        .find(project => project.reference === this.identifierUrl);
    },
    pageSections() {
      if (!this.currentProject) return [];

      const allSections = [FirstSectionItem].concat(this.currentProject.sections);

      return this.tutorialState.linkableSections.map((linkableSection, index) => {
        const singleSection = allSections[index];
        const referenceObject = this.references[singleSection.reference];
        const { url, title } = referenceObject || singleSection;
        return {
          ...linkableSection,
          title,
          path: url,
        };
      });
    },
    optionsForSections() {
      return this.pageSections.map(({ depth, path, title }) => ({ depth, path, title }));
    },
    pageSectionWithHighestVisibility() {
      // sort page sections by their visibility relative to the breakpoint and
      // return the first with the highest (non-zero) visibility, if any
      return [...this.pageSections].sort((a, b) => (
        b.visibility - a.visibility
      )).find(section => (
        section.visibility > 0
      ));
    },
    sectionIndicatorText() {
      // subtract the Introduction from the number of total sections
      // as it's not included on section tracker count
      const numberOfSections = this.tutorialState.linkableSections.length - 1;
      const { sectionNumber } = this.currentSection || {};
      if (sectionNumber === 0) {
        return undefined;
      }
      return `(${sectionNumber} of ${numberOfSections})`;
    },
  },
  methods: {
    onSelectSection(path) {
      // Manually scroll to the section to work around a vue-router bug: https://github.com/vuejs/vue-router/issues/1668
      const hash = path.split('#')[1];
      this.handleFocusAndScroll(hash);
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.chevron-icon {
  padding: 0;
  color: var(--color-nav-outlines);
  grid-column: 2;
  height: 20px;
  width: 20px;
  margin: 0 4px;
}

@include breakpoints-from(medium, $scope: nav) {
  .nav /deep/ {
    .nav-content {
      display: grid;
      grid-template-columns: auto auto 3fr;
      align-items: center;
    }

    .nav-menu {
      padding: 0;
      grid-column: 3/5;
    }

    .nav-menu-item {
      margin: 0;
    }
  }
}

.dropdown-container {
  height: $nav-height;
  display: grid;
  grid-template-columns: minmax(230px, 285px) auto minmax(230px, 1fr);
  align-items: center;
  @include breakpoint(medium, $scope: nav) {
    grid-template-columns: minmax(173px, 216px) auto minmax(173px, 1fr);
  }
}

.separator {
  height: 20px;
  border-right: 1px solid;
  border-color: var(--color-nav-outlines);
  margin: 0 20px;
  grid-column: 2;
}

.mobile-dropdown-container {
  display: none;
}

.nav {
  @include nav-in-breakpoint($nested: true) {
    .dropdown-container,
    .separator {
      display: none;
    }
    .mobile-dropdown-container {
      display: block;
    }
    /deep/ .nav-title {
      grid-area: title;
    }

    /deep/ .pre-title {
      display: none;
    }
  }
}

.nav /deep/ .nav-title {
  grid-column: 1;
  width: 90%;
  padding-top: 0;
}

.primary-dropdown,
.secondary-dropdown {
  background: var(--color-tutorial-navbar-dropdown-background);
  border-color: var(--color-tutorial-navbar-dropdown-border);

  /deep/ .form-dropdown {
    &, &:focus {
      border-color: var(--color-tutorial-navbar-dropdown-border);
    }
  }

  /deep/ .options {
    background: var(--color-tutorial-navbar-dropdown-background);
    border-color: var(--color-tutorial-navbar-dropdown-border);
  }
}
</style>
