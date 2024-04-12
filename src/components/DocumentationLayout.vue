<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="documentation-layout">
    <Nav
      v-if="!isTargetIDE"
      :diffAvailability="diffAvailability"
      :interfaceLanguage="interfaceLanguage"
      :objcPath="objcPath"
      :swiftPath="swiftPath"
      :displaySidenav="enableNavigator"
      @toggle-sidenav="handleToggleSidenav"
    >
      <template #title>
        <slot name="title" />
      </template>
    </Nav>
    <AdjustableSidebarWidth
      v-bind="sidebarProps"
      v-on="sidebarListeners"
      class="full-width-container topic-wrapper"
    >
      <PortalTarget name="modal-destination" multiple />
      <template #aside="{ scrollLockID, breakpoint }">
        <NavigatorDataProvider
          :interface-language="interfaceLanguage"
          :technologyUrl="technology ? technology.url : ''"
          :api-changes-version="selectedAPIChangesVersion"
          ref="NavigatorDataProvider"
        >
          <template #default="slotProps">
            <div class="aside">
              <QuickNavigationModal
                v-if="enableQuickNavigation"
                :children="slotProps.flatChildren"
                :showQuickNavigationModal.sync="showQuickNavigationModal"
                :technology="technology ? technology.title : ''"
              />
              <transition name="delay-hiding">
                <Navigator
                  v-show="sidenavVisibleOnMobile || breakpoint === BreakpointName.large"
                  :flatChildren="slotProps.flatChildren"
                  :parent-topic-identifiers="parentTopicIdentifiers"
                  :technology="slotProps.technology || technology"
                  :is-fetching="slotProps.isFetching"
                  :error-fetching="slotProps.errorFetching"
                  :api-changes="slotProps.apiChanges"
                  :references="references"
                  :navigator-references="slotProps.references"
                  :scrollLockID="scrollLockID"
                  :render-filter-on-top="breakpoint !== BreakpointName.large"
                  @close="handleToggleSidenav(breakpoint)"
                >
                  <template v-if="enableQuickNavigation" #filter>
                    <QuickNavigationButton @click.native="openQuickNavigationModal" />
                  </template>
                  <template #navigator-head>
                    <slot name="title" />
                  </template>
                </Navigator>
              </transition>
            </div>
          </template>
        </NavigatorDataProvider>
      </template>
      <slot />
    </AdjustableSidebarWidth>
  </div>
</template>

<script>
import { PortalTarget } from 'portal-vue';
import QuickNavigationButton from 'docc-render/components/Navigator/QuickNavigationButton.vue';
import QuickNavigationModal from 'docc-render/components/Navigator/QuickNavigationModal.vue';
import AdjustableSidebarWidth from 'docc-render/components/AdjustableSidebarWidth.vue';
import Navigator from 'docc-render/components/Navigator.vue';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { storage } from 'docc-render/utils/storage';
import { getSetting } from 'docc-render/utils/theme-settings';

import NavigatorDataProvider from 'theme/components/Navigator/NavigatorDataProvider.vue';
import DocumentationNav from 'theme/components/DocumentationTopic/DocumentationNav.vue';

const NAVIGATOR_HIDDEN_ON_LARGE_KEY = 'navigator-hidden-large';

export default {
  name: 'DocumentationLayout',
  constants: { NAVIGATOR_HIDDEN_ON_LARGE_KEY },
  components: {
    Navigator,
    AdjustableSidebarWidth,
    NavigatorDataProvider,
    Nav: DocumentationNav,
    QuickNavigationButton,
    QuickNavigationModal,
    PortalTarget,
  },
  mixins: [onPageLoadScrollToFragment],
  props: {
    enableNavigator: Boolean,
    diffAvailability: {
      type: Object,
      required: false,
    },
    interfaceLanguage: {
      type: String,
      required: false,
    },
    references: {
      type: Object,
      default: () => {},
    },
    objcPath: {
      type: String,
      required: false,
    },
    swiftPath: {
      type: String,
      required: false,
    },
    selectedAPIChangesVersion: {
      type: String,
      required: false,
    },
    technology: {
      type: Object,
      require: false,
    },
    parentTopicIdentifiers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      sidenavVisibleOnMobile: false,
      sidenavHiddenOnLarge: storage.get(NAVIGATOR_HIDDEN_ON_LARGE_KEY, false),
      showQuickNavigationModal: false,
      BreakpointName,
    };
  },
  computed: {
    enableQuickNavigation: ({ isTargetIDE }) => (
      !isTargetIDE && getSetting(['features', 'docs', 'quickNavigation', 'enable'], true)
    ),
    sidebarProps: ({ sidenavVisibleOnMobile, enableNavigator, sidenavHiddenOnLarge }) => (
      enableNavigator
        ? {
          shownOnMobile: sidenavVisibleOnMobile,
          hiddenOnLarge: sidenavHiddenOnLarge,
        }
        : {
          enableNavigator,
        }
    ),
    sidebarListeners() {
      return this.enableNavigator ? ({
        'update:shownOnMobile': this.toggleMobileSidenav,
        'update:hiddenOnLarge': this.toggleLargeSidenav,
      }) : {};
    },
  },
  methods: {
    handleToggleSidenav(breakpoint) {
      if (breakpoint === BreakpointName.large) {
        this.toggleLargeSidenav();
      } else {
        this.toggleMobileSidenav();
      }
    },
    openQuickNavigationModal() {
      if (this.sidenavVisibleOnMobile) return;
      this.showQuickNavigationModal = true;
    },
    toggleLargeSidenav(value = !this.sidenavHiddenOnLarge) {
      this.sidenavHiddenOnLarge = value;
      storage.set(NAVIGATOR_HIDDEN_ON_LARGE_KEY, value);
    },
    toggleMobileSidenav(value = !this.sidenavVisibleOnMobile) {
      this.sidenavVisibleOnMobile = value;
    },
    onQuickNavigationKeydown(event) {
      // Open the modal only on `/` or `cmd+shift+o` key event
      if (event.key !== '/' && !(event.key === 'o' && event.shiftKey && event.metaKey)) return;
      // Prevent modal from opening when the navigator is disabled
      if (!this.enableNavigator) return;
      // Prevent modal from opening if the event source element is an input
      if (event.target.tagName.toLowerCase() === 'input') return;
      this.openQuickNavigationModal();
      event.preventDefault();
    },
  },
  mounted() {
    if (this.enableQuickNavigation) window.addEventListener('keydown', this.onQuickNavigationKeydown);
  },
  beforeDestroy() {
    if (this.enableQuickNavigation) window.removeEventListener('keydown', this.onQuickNavigationKeydown);
  },
  inject: {
    isTargetIDE: {
      default() {
        return false;
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

:deep() {
  .generic-modal {
    overflow-y: overlay;
  }
  .modal-fullscreen > .container {
    background-color: transparent;
    height: fit-content;
    flex: auto;
    margin: rem(160px) 0;
    max-width: rem(800px);
    overflow: visible;
  }

  .navigator-filter .quick-navigation-open {
    margin-left: var(--nav-filter-horizontal-padding);
    width: calc(var(--nav-filter-horizontal-padding) * 2);
  }
}

.documentation-layout {
  --delay: 1s;
  display: flex;
  flex-flow: column;
  background: var(--colors-text-background, var(--color-text-background));

  .delay-hiding-leave-active {
    // don't hide navigator until delay time has passed
    transition: display var(--delay);
  }
}

.aside {
  height: 100%;
  box-sizing: border-box;
  border-right: $generic-border-style;

  @include breakpoint(medium, nav) {
    background: var(--color-fill);
    border-right: none;

    .sidebar-transitioning & {
      border-right: $generic-border-style;
    }
  }
}

.topic-wrapper {
  flex: 1 1 auto;
  width: 100%;

  :root.no-js &:deep(.sidebar) {
    display: none;
  }
}

.full-width-container {
  @include inTargetWeb {
    @include breakpoint-full-width-container();
    @include breakpoints-from(xlarge) {
      border-left: $generic-border-style;
      border-right: $generic-border-style;
      box-sizing: border-box;
    }
  }
}
</style>
