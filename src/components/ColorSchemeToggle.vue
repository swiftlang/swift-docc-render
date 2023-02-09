<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    aria-label="Select a color scheme preference"
    class="color-scheme-toggle"
    role="radiogroup"
  >
    <label
      v-for="option in options"
      :key="option.value"
    >
      <input
        type="radio"
        @input="setPreferredColorScheme"
        :checked="option.value == preferredColorScheme"
        :value="option.value"
      />
      <div class="text">{{option.label}}</div>
    </label>
  </div>
</template>

<script>
import AppStore from 'docc-render/stores/AppStore';
import ColorScheme from 'docc-render/constants/ColorScheme';

export default {
  name: 'ColorSchemeToggle',
  data: () => ({ appState: AppStore.state }),
  computed: {
    options: ({ supportsAutoColorScheme }) => [
      ColorScheme.light,
      ColorScheme.dark,
      ...(supportsAutoColorScheme ? [ColorScheme.auto] : []),
    ],
    preferredColorScheme: ({ appState }) => appState.preferredColorScheme,
    supportsAutoColorScheme: ({ appState }) => appState.supportsAutoColorScheme,
  },
  methods: {
    setPreferredColorScheme: (event) => {
      AppStore.setPreferredColorScheme(event.target.value);
    },
  },
  watch: {
    preferredColorScheme: {
      immediate: true,
      handler(preferredColorScheme) {
        document.body.dataset.colorScheme = preferredColorScheme;
      },
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.color-scheme-toggle {
  --toggle-color-fill: var(--color-button-background);
  --toggle-color-text: var(--color-fill-blue);

  @include font-styles(caption);
  border: 1px solid var(--toggle-color-fill);
  border-radius: var(--toggle-border-radius-outer, $border-radius);
  display: inline-flex;
  padding: 1px;

  @include prefers-dark {
    --toggle-color-text: var(--color-figure-blue);
  }

  @media print {
    display: none;
  }
}

input {
  @include visuallyhidden;
  appearance: none;
}

label {
  @include on-keyboard-focus-within() {
    @include focus-outline();
  }
}

.text {
  border: 1px solid transparent;
  border-radius: var(--toggle-border-radius-inner, 2px);
  color: var(--toggle-color-text);
  display: inline-block;
  text-align: center;
  padding: 1px 6px;
  min-width: 42px;
  box-sizing: border-box;

  &:hover {
    cursor: pointer;
  }

  input:checked + & {
    --toggle-color-text: var(--color-button-text);

    background: var(--toggle-color-fill);
    border-color: var(--toggle-color-fill);
  }
}
</style>
