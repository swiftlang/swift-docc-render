<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <PortalSource to="modal-destination" :disabled="!isVisible">
    <div
      v-show="isVisible"
      class="generic-modal"
      role="dialog"
      :class="[stateClasses, themeClass]"
      :style="modalColors"
    >
      <div class="backdrop" @click="onClickOutside" />
      <div class="container" ref="container" :style="{ width }">
        <button
          v-if="showClose"
          class="close"
          ref="close"
          aria-label="Close"
          @click.prevent="closeModal"
        >
          <CloseIcon />
        </button>
        <div class="modal-content" ref="content">
          <slot />
        </div>
      </div>
    </div>
  </PortalSource>
</template>

<script>
import scrollLock from 'docc-render/utils/scroll-lock';
import FocusTrap from 'docc-render/utils/FocusTrap';
import changeElementVOVisibility from 'docc-render/utils/changeElementVOVisibility';
import { Portal } from 'portal-vue';
import CloseIcon from 'theme/components/Icons/CloseIcon.vue';

const Theme = {
  // Light theme.
  light: 'light',
  // Dark theme.
  dark: 'dark',
  // Dynamic theme, light/dark colors based on system appearance.
  dynamic: 'dynamic',
  // Code (dynamic) theme, code background colors based on system appearance.
  code: 'code',
};

export default {
  name: 'GenericModal',
  model: {
    prop: 'visible',
    event: 'update:visible',
  },
  components: { CloseIcon, PortalSource: Portal },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isFullscreen: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      validator: type => Object.keys(Theme).includes(type),
      default: Theme.light,
    },
    codeBackgroundColorOverride: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: null,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      lastFocusItem: null,
      prefersDarkStyle: false,
      focusTrapInstance: null,
    };
  },
  computed: {
    isVisible: {
      get: ({ visible }) => visible,
      set(value) {
        this.$emit('update:visible', value);
      },
    },
    modalColors() {
      return {
        '--background': this.codeBackgroundColorOverride,
      };
    },
    themeClass({ theme, prefersDarkStyle, isThemeDynamic }) {
      let dynamicThemeClasses = {};
      // if we use the `dynamic` theme, use the OS darkmode preference.
      if (isThemeDynamic) {
        dynamicThemeClasses = {
          'theme-light': !prefersDarkStyle,
          'theme-dark': prefersDarkStyle,
        };
      }
      return [`theme-${theme}`, dynamicThemeClasses];
    },
    stateClasses: ({ isFullscreen, isVisible, showClose }) => ({
      'modal-fullscreen': isFullscreen,
      'modal-standard': !isFullscreen,
      'modal-open': isVisible,
      'modal-with-close': showClose,
    }),
    isThemeDynamic: ({ theme }) => theme === Theme.dynamic || theme === Theme.code,
  },
  watch: {
    isVisible(isVisible) {
      if (isVisible) {
        this.onShow();
      } else {
        this.onHide();
      }
    },
  },
  mounted() {
    this.focusTrapInstance = new FocusTrap();
    document.addEventListener('keydown', this.onKeydown);
    // add listeners for dynamic themes
    if (this.isThemeDynamic) {
      const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
      matchMedia.addListener(this.onColorSchemePreferenceChange);
      this.$once('hook:beforeDestroy', () => {
        matchMedia.removeListener(this.onColorSchemePreferenceChange);
      });

      // Trigger a theme update when the modal is first loaded.
      this.onColorSchemePreferenceChange(matchMedia);
    }
  },
  beforeDestroy() {
    // make sure we unlock scrolling before navigating to a new page.
    if (this.isVisible) {
      scrollLock.unlockScroll(this.$refs.container);
    }
    document.removeEventListener('keydown', this.onKeydown);
    this.focusTrapInstance.destroy();
  },
  methods: {
    async onShow() {
      // make sure PortalVue is ready
      await this.$nextTick();
      // lock scroll
      scrollLock.lockScroll(this.$refs.container);
      // remember last focus item
      await this.focusCloseButton();
      // update the focus container
      this.focusTrapInstance.updateFocusContainer(this.$refs.container);
      // lock focus
      this.focusTrapInstance.start();
      // hide sibling elements from VO
      changeElementVOVisibility.hide(this.$refs.container);
    },
    onHide() {
      // unlock scroll
      scrollLock.unlockScroll(this.$refs.container);
      // unlock focus
      this.focusTrapInstance.stop();
      // return focus to last item
      if (this.lastFocusItem) {
        this.lastFocusItem.focus({ preventScroll: true });
        this.lastFocusItem = null;
      }
      this.$emit('close');
      // unhide elements from VO
      changeElementVOVisibility.show(this.$refs.container);
    },
    closeModal() {
      this.isVisible = false;
    },
    /**
     * Select all modal's content
     */
    selectContent() {
      window.getSelection().selectAllChildren(
        this.$refs.content,
      );
    },
    /**
     * Closes the modal when clicking on the backdrop
     */
    onClickOutside() {
      this.closeModal();
    },
    /**
     * Handle the keydown body event listener.
     * Used to:
     * - Overwrite cmd+a and ctrl+a behaviour to select modal content only
     * - Close the modal on `Escape` click.
     * @param {KeyboardEvent} params
     * @param {String} params.key
     */
    onKeydown(event) {
      const {
        metaKey = false, ctrlKey = false, key,
      } = event;

      if (!this.isVisible) return;
      if (key === 'a' && (metaKey || ctrlKey)) {
        event.preventDefault();
        this.selectContent();
      }
      if (key !== 'Escape') return;
      event.preventDefault();
      this.closeModal();
    },
    /**
     * Handles changing between light/dark mode on OS.
     * @param {MediaQueryList} params
     * @param {Boolean} params.matches
     */
    onColorSchemePreferenceChange({ matches }) {
      this.prefersDarkStyle = matches;
    },
    async focusCloseButton() {
      this.lastFocusItem = document.activeElement;
      // focus close button
      await this.$nextTick();
      if (this.$refs.close) this.$refs.close.focus();
      this.$emit('open');
    },
  },
};
</script>

<style lang='scss' scoped>
@import 'docc-render/styles/_core.scss';

$-modal-close-font-size: 40px;
$-modal-close-font-size-medium: 32px;
$modal-close-color: light-color(figure-gray-tertiary) !default;

.generic-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  z-index: 11000; // Make sure modals are positioned on top.
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  background: none;
  overflow: auto;
}

// modal-type
.modal {
  &-fullscreen {
    align-items: stretch;

    // expand the container to be 100% of the modal
    .container {
      margin: 0;
      flex: 1;
      width: 100%;
      height: 100%;
      padding-top: env(safe-area-inset-top);
      padding-right: env(safe-area-inset-right);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
    }
  }

  &-standard {
    padding: 20px;

    .container {
      padding: 60px;
      border-radius: $big-border-radius;
      @include prefers-dark {
        background: rgb(29, 29, 31);
      }
    }

    @include breakpoint(small) {
      padding: 0;
      align-items: stretch;
      .container {
        margin: 20px 0 0;
        padding: 50px 30px;
        flex: 1;
        width: 100%;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
}

.backdrop {
  overflow: auto;
  background: rgba(0, 0, 0, 0.4);
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
  position: fixed;
}

.container {
  @include breakpoint-content;
  background: var(--colors-generic-modal-background, var(--color-generic-modal-background));
  z-index: 1;
  position: relative;
  overflow: auto;
  max-width: 100%;
}

.close {
  position: absolute;
  z-index: 9999;
  top: 22px;
  left: 22px;
  width: 30px;
  height: 30px;
  color: $modal-close-color;
  cursor: pointer;
  background: none;
  border: 0;
  display: flex;
  align-items: center;

  .close-icon {
    fill: currentColor;
    width: 100%;
    height: 100%;
  }
}

// themes

.theme {
  &-dark {
    .container {
      background: dark-color(fill);

      .close {
        color: dark-color(figure-gray-tertiary);
      }
    }
  }

  &-code {
    .container {
      background-color: var(--background, var(--color-code-background));
    }
  }
}

</style>
