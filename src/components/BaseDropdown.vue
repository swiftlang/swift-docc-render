<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="form-element">
    <slot
      name="dropdown"
      :dropdownClasses="dropdownClasses"
      :value="value"
    >
      <select
        v-model="modelValue"
        :class="dropdownClasses"
        v-bind="$attrs"
      >
        <slot />
      </select>
    </slot>
    <InlineChevronDownIcon class="form-icon" aria-hidden="true" />
    <span
      v-if="$slots.eyebrow"
      class="form-label"
      aria-hidden="true"
    >
      <slot name="eyebrow" />
    </span>
    <slot name="after" />
  </div>
</template>

<script>
import InlineChevronDownIcon from 'theme/components/Icons/InlineChevronDownIcon.vue';

/**
 * A basic dropdown component to use when a simple `select` element is sufficient.
 * For more advanced usages, {@see DropdownCustom}
 */
export default {
  name: 'BaseDropdown',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  components: {
    InlineChevronDownIcon,
  },
  computed: {
    modelValue: {
      get: ({ value }) => value,
      set(value) {
        this.$emit('input', value);
      },
    },
    dropdownClasses({ value }) {
      return ['form-dropdown', {
        'form-dropdown-selectnone': value === '',
        'no-eyebrow': !this.$slots.eyebrow,
      }];
    },
  },
};
</script>

<style lang='scss' scoped>
@import 'docc-render/styles/_core.scss';

$form-dropdown-text-color: var(--color-dropdown-text) !default;
$form-dropdown-option-text-color: var(--color-dropdown-option-text) !default;
$form-dropdown-margin-bottom: rem(14px);
$form-textbox-background-color: var(--color-dropdown-background) !default;

.form-element {
  position: relative;
}

// Styles the main element to click and open the dropdown.
// Its applied to the `select` or `button` elements in `DropdownCustom`
.form-dropdown {
  @include font-styles(form-default-text);
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 3.3em;
  color: $form-dropdown-text-color;
  padding: rem(19px) rem(40px) 0 rem(16px);
  text-align: left;
  //background: $form-textbox-background-color;
  border: 1px solid var(--color-dropdown-border);
  border-radius: $border-radius;
  background-clip: padding-box;
  margin-bottom: $form-dropdown-margin-bottom;
  appearance: none;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  // webkit-appearance not supporting in IE
  min-height: 32px; // height of select should match with textbox

  // remove the normal focus styling
  &:focus {
    outline: none;
    @include focus-shadow-form-element;
  }

  // if there is no eyebrow content, remove the top padding
  &.no-eyebrow {
    padding-top: 0;
  }

  &:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 $form-dropdown-text-color;
  }

  &::-ms-expand {
    opacity: 0;
  }

  ~ .form-icon {
    position: absolute;
    display: block;
    pointer-events: none;
    fill: var(--color-figure-gray-tertiary);
    right: 14px;
    width: 13px;
    height: auto;
    top: 50%;
    transform: translateY(-50%);

    // rotate the icon
    .is-open & {
      transform: translateY(-50%) scale(-1);
    }

    @include breakpoint(small) {
      right: 14px;
    }
  }

  ~ .form-label {
    @include font-styles(form-textbox-label-small);
    position: absolute;
    top: rem(8px);
    left: 17px;
    color: var(--color-figure-gray-secondary);
    pointer-events: none;
    padding: 0;
    z-index: 1;
  }

  /deep/ option {
    color: $form-dropdown-text-color;
  }
}

.form-dropdown-selectnone {
  color: transparent;

  ~ .form-label {
    @include font-styles(form-default-text);
    top: 19px;
    left: 17px;
    color: var(--color-figure-gray-tertiary);
  }

  &:-moz-focusring {
    text-shadow: none;
  }

  &::-ms-value {
    display: none;
  }
}

// adds dark theme support
.theme-dark {
  $background-color: var(--color-dropdown-dark-background);
  $border-color: var(--color-dropdown-dark-border);
  $text-color: var(--color-dropdown-dark-text);
  $dropdown-label-small: dark-color(figure-gray-secondary);
  $dropdown-label: dark-color(figure-gray-tertiary);

  .form-dropdown {
    color: $text-color;
    background-color: $background-color;
    border-color: $border-color;

    ~ .form-label {
      color: $dropdown-label-small;
    }

    &:-moz-focusring {
      color: transparent;
      text-shadow: 0 0 0 $text-color;
    }

    &.form-dropdown-selectnone {
      color: transparent;

      &:-moz-focusring {
        text-shadow: none;
      }
    }
  }

  .form-dropdown-selectnone ~ .form-label {
    color: $dropdown-label;
  }
}
</style>
