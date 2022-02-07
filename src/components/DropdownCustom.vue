<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BaseDropdown
    :value="value"
    :class="{ [OpenedClass]: isOpen, 'dropdown-small': isSmall }"
    class="dropdown-custom"
  >
    <template
      slot="dropdown"
      slot-scope="{ dropdownClasses }"
    >
      <span :id="`DropdownLabel_${_uid}`" class="visuallyhidden">{{ ariaLabel }}</span>
      <button
        ref="dropdownToggle"
        role="button"
        :id="`DropdownToggle_${_uid}`"
        :class="dropdownClasses"
        class="form-dropdown-toggle"
        :aria-labelledby="`DropdownLabel_${_uid} DropdownToggle_${_uid}`"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-haspopup="true"
        @click="toggleDropdown"
        @keydown.enter.prevent="openDropdown"
        @keydown.esc="closeAndFocusToggler"
        @keydown.down.prevent="openDropdown"
        @keydown.up.prevent="openDropdown"
      >
        <span class="form-dropdown-title">{{ value }}</span>
        <slot name="toggle-post-content" />
      </button>
    </template>
    <template slot="eyebrow">
      <slot name="eyebrow" />
    </template>
    <template slot="after">
      <slot
        v-bind="{
          value,
          isOpen,
          contentClasses: ['form-dropdown-content', { 'is-open' : isOpen }],
          closeDropdown,
          onChangeAction,
          closeAndFocusToggler,
          navigateOverOptions,
          OptionClass,
          ActiveOptionClass,
        }"
      />
    </template>
  </BaseDropdown>
</template>

<script>

import BaseDropdown from 'docc-render/components/BaseDropdown.vue';

const OpenedClass = 'is-open';
const OptionClass = 'option';
const ActiveOptionClass = 'option-active';

export default {
  name: 'DropdownCustom',
  components: { BaseDropdown },
  constants: {
    OpenedClass,
    OptionClass,
    ActiveOptionClass,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
    isSmall: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      OpenedClass,
      OptionClass,
      ActiveOptionClass,
    };
  },
  mounted() {
    document.addEventListener('click', this.closeOnLoseFocus);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeOnLoseFocus);
  },
  methods: {
    onChangeAction(value) {
      this.$emit('input', value);
    },
    toggleDropdown() {
      if (this.isOpen) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    },
    async closeAndFocusToggler() {
      this.closeDropdown();
      await this.$nextTick();
      this.$refs.dropdownToggle.focus({ preventScroll: true });
    },
    closeDropdown() {
      this.isOpen = false;
      this.$emit('close');
    },
    openDropdown() {
      this.isOpen = true;
      this.$emit('open');
      this.focusActiveLink();
    },
    closeOnLoseFocus(e) {
      if (!this.$el.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    },
    /**
     * Scrolls over the options whe clicking up/down arrows.
     * @param {HTMLElement} target
     * @param {Number} step
     */
    navigateOverOptions({ target }, step) {
      // get all options
      const allOptions = this.$el.querySelectorAll(`.${OptionClass}`);
      // convert to an array
      const allOptionsArray = Array.from(allOptions);
      // find the current index the target is in
      const targetIndex = allOptionsArray.indexOf(target);
      // get the next element
      const nextElement = allOptionsArray[targetIndex + step];
      if (!nextElement) {
        return;
      }
      // focus the new element
      nextElement.focus({ preventScroll: true });
    },
    /**
     * Focuses the currently active option
     * @return {Promise<void>}
     */
    async focusActiveLink() {
      const currentOption = this.$el.querySelector(`.${ActiveOptionClass}`);
      if (!currentOption) return;
      await this.$nextTick();
      currentOption.focus({ preventScroll: true });
    },
  },
};
</script>

<style scoped lang='scss'>
@import "docc-render/styles/_core.scss";

$focus-shadow: 0 0 0 2px var(--color-focus-color);

// applies extra styling to make the dropdown look smaller
.dropdown-small {
  height: 30px;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--color-fill);

  // overwrite the typography and focus styles on the toggle
  .form-dropdown-toggle {
    line-height: 1.5;
    font-size: 12px;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 20px;
    min-height: unset;
    height: 30px;
    display: flex;
    align-items: center;

    &:focus {
      box-shadow: none;
      border-color: var(--color-dropdown-border);
    }

    // override the outline to a smaller glow on focus from keyboard
    @include on-keyboard-focus() {
      box-shadow: $focus-shadow;
      outline: none;
      border-color: var(--color-focus-border-color);
    }
  }
}

.form-dropdown-toggle {
  margin: 0;
  // on open remove the bottom border and border radius, so it merges with the content.
  .is-open & {
    border-radius: $border-radius $border-radius 0 0;
    // remove bottom border and compensate for the spacing
    border-bottom: none;
    padding-bottom: 1px;

    // hack to apply focus style to the toggle button, when open but focusing the content.
    .fromkeyboard & {
      // apply outline everywhere, except the bottom.
      box-shadow: 1px -1px 0 1px var(--color-focus-color),
      -1px -1px 0 1px var(--color-focus-color);
      border-color: var(--color-focus-border-color);
    }
  }
}

// style the content inside the toggle
.form-dropdown-title {
  margin: 0;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// the wrapping in `dropdown-custom` is needed to properly apply the /deep/ selector
.dropdown-custom {
  border-radius: $border-radius;

  &.is-open {
    border-radius: $border-radius $border-radius 0 0;
  }

  // style the dropdown content holder
  /deep/ .form-dropdown-content {
    background: var(--color-fill);
    position: absolute;
    right: 0;
    left: 0;
    top: 100%;
    border-bottom-left-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
    border: 1px solid var(--color-dropdown-border);
    border-top: none;
    display: none;
    overflow-y: auto;

    &.is-open {
      display: block;

      .fromkeyboard & {
        // hack to apply focus outline everywhere, except the top.
        box-shadow: 1px 1px 0 1px var(--color-focus-color),
        -1px 1px 0 1px var(--color-focus-color);
        border-color: var(--color-focus-border-color);
        border-top-color: transparent;
      }
    }

    // if wrapped inside a nav
    // add nav-height to bottom-spacing for more space
    // in case user has multiple tabs open
    $bottom-spacing: 72px;

    .nav & {
      // At initial page load, we take away 20px along with the height of both
      // the nav to make the dropdown not exceed the height of the
      // breakpoint (20px is visual space between the bottom of the dropdown and the
      // bottom of the page).
      max-height: calc(100vh - #{$globalnav-height} - #{$nav-height} - #{$bottom-spacing});
      @include nav-is-sticking($nested: true) {
        // When the nav is sticking, we no longer need to account for the
        // height of the global nav.
        max-height: calc(100vh - #{$nav-height} - #{$bottom-spacing});
      }
    }
  }

  // style the options
  /deep/ .options {
    list-style: none;
    margin: 0;
    padding: 0 0 20px;
  }

  // style each option
  /deep/ .option {
    cursor: pointer;
    padding: 5px 20px;
    font-size: 12px;
    line-height: 20px;
    outline: none;

    &:hover {
      background-color: var(--color-fill-tertiary);
    }

    &.option-active {
      font-weight: $font-weight-semibold;
    }

    .fromkeyboard & {
      &:hover {
        background-color: transparent;
      }

      &:focus {
        background-color: var(--color-fill-tertiary);
        outline: none;
      }
    }
  }
}
</style>
