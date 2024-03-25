<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <CodeTheme class="doc-topic-view">
    <template>
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
      <component
        :is="enableNavigator ? 'AdjustableSidebarWidth' : 'StaticContentWidth'"
        v-bind="sidebarProps"
        v-on="sidebarListeners"
        class="full-width-container topic-wrapper"
      >
        <PortalTarget name="modal-destination" multiple />
        <template #aside="{ scrollLockID, breakpoint }">
          <NavigatorDataProvider
            :interface-language="interfaceLanguage"
            :technologyUrl="technology ? technology.url : null"
            :api-changes-version="store.state.selectedAPIChangesVersion"
            ref="NavigatorDataProvider"
          >
            <template #default="slotProps">
              <div class="doc-topic-aside">
                <QuickNavigationModal
                  v-if="enableQuickNavigation"
                  :children="slotProps.flatChildren"
                  :showQuickNavigationModal.sync="showQuickNavigationModal"
                  :technology="technology ? technology.title : null"
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
                    :symbolKind="symbolKind"
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
        <slot/>
      </component>
    </template>
  </CodeTheme>
</template>

<script>
import { PortalTarget } from 'portal-vue';
import CodeTheme from 'docc-render/components/Tutorial/CodeTheme.vue';
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';
import QuickNavigationButton from 'docc-render/components/Navigator/QuickNavigationButton.vue';
import QuickNavigationModal from 'docc-render/components/Navigator/QuickNavigationModal.vue';
import AdjustableSidebarWidth from 'docc-render/components/AdjustableSidebarWidth.vue';
import Navigator from 'docc-render/components/Navigator.vue';
import StaticContentWidth from 'docc-render/components/DocumentationTopic/StaticContentWidth.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { storage } from 'docc-render/utils/storage';
import { getSetting } from 'docc-render/utils/theme-settings';

import NavigatorDataProvider from 'theme/components/Navigator/NavigatorDataProvider.vue';
import DocumentationNav from 'theme/components/DocumentationTopic/DocumentationNav.vue';

const NAVIGATOR_HIDDEN_ON_LARGE_KEY = 'navigator-hidden-large';

export default {
  name: 'BaseNavigatorView',
  constants: { NAVIGATOR_HIDDEN_ON_LARGE_KEY },
  components: {
    Navigator,
    AdjustableSidebarWidth,
    StaticContentWidth,
    NavigatorDataProvider,
    CodeTheme,
    Nav: DocumentationNav,
    QuickNavigationButton,
    QuickNavigationModal,
    PortalTarget,
  },
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
    symbolKind: {
      type: String,
      default: '',
    },
    objcPath: {
      type: String,
      required: false,
    },
    swiftPath: {
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
      store: DocumentationTopicStore,
    };
  },
  provide() {
    return {
      store: this.store,
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
        : {}
    ),
    sidebarListeners() {
      return this.enableNavigator ? ({
        'update:shownOnMobile': this.toggleMobileSidenav,
        'update:hiddenOnLarge': this.toggleLargeSidenav,
      }) : {};
    },
  },
  methods: {
    handleCodeColorsChange(codeColors) {
      CodeThemeStore.updateCodeColors(codeColors);
    },
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
    this.$bridge.on('codeColors', this.handleCodeColorsChange);
    this.$bridge.send({ type: 'requestCodeColors' });
    if (this.enableQuickNavigation) window.addEventListener('keydown', this.onQuickNavigationKeydown);
  },
  created() {
    this.store.reset();
  },
  beforeDestroy() {
    this.$bridge.off('codeColors', this.handleCodeColorsChange);
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

.doc-topic-view {
  --delay: 1s;
  display: flex;
  flex-flow: column;
  background: var(--colors-text-background, var(--color-text-background));

  .delay-hiding-leave-active {
    // don't hide navigator until delay time has passed
    transition: display var(--delay);
  }
}

.doc-topic-aside {
  height: 100%;
  box-sizing: border-box;
  border-right: 1px solid var(--color-grid);

  @include breakpoint(medium, nav) {
    background: var(--color-fill);
    border-right: none;

    .sidebar-transitioning & {
      border-right: 1px solid var(--color-grid);
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
      border-left: 1px solid var(--color-grid);
      border-right: 1px solid var(--color-grid);
      box-sizing: border-box;
    }
  }
}
</style>
