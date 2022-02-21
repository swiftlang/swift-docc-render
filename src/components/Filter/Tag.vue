<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <li class="tag" role="presentation">
    <button
      ref="button"
      :class="{ 'focus': isActiveTag }"
      role="option"
      :aria-selected="ariaSelected"
      aria-roledescription="tag"
      @focus="$emit('focus', { event: $event, tagName: name })"
      @click.prevent="$emit('click', { event: $event, tagName: name })"
      @dblclick.prevent="!keyboardIsVirtual && deleteTag()"
      @keydown.exact="$emit('keydown', { event: $event, tagName: name })"
      @keydown.shift.exact="$emit('keydown', { event: $event, tagName: name })"
      @keydown.shift.meta.exact="$emit('keydown', { event: $event, tagName: name })"
      @keydown.meta.exact="$emit('keydown', { event: $event, tagName: name })"
      @keydown.ctrl.exact="$emit('keydown', { event: $event, tagName: name })"
      @keydown.delete.prevent="deleteTag"
      @mousedown.prevent="focusButton"
      @copy="handleCopy"
    >
      <span v-if="!isRemovableTag" class="visuallyhidden">
        Add tag -
      </span>
      {{ name }}
      <span v-if="isRemovableTag" class="visuallyhidden">
        – Tag. Select to remove from list.
      </span>
    </button>
  </li>
</template>
<script>
import { prepareDataForHTMLClipboard } from 'docc-render/utils/clipboard';

export default {
  name: 'Tag',
  props: {
    name: {
      type: String,
      required: true,
    },
    isFocused: {
      type: Boolean,
      default: () => false,
    },
    isRemovableTag: {
      type: Boolean,
      default: false,
    },
    isActiveTag: {
      type: Boolean,
      default: false,
    },
    activeTags: {
      type: Array,
      required: false,
    },
    keyboardIsVirtual: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    isFocused(newVal) {
      if (newVal) {
        this.focusButton();
      }
    },
  },
  mounted() {
    // initialize global clipboard listeners
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('cut', this.handleCut);
    document.addEventListener('paste', this.handlePaste);

    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('copy', this.handleCopy);
      document.removeEventListener('cut', this.handleCut);
      document.removeEventListener('paste', this.handlePaste);
    });
  },
  methods: {
    isCurrentlyActiveElement() {
      return document.activeElement === this.$refs.button;
    },
    /**
     * Handles copy event
     * @param {ClipboardEvent} event
     */
    handleCopy(event) {
      // handle only if the current focused item is the button
      if (!this.isCurrentlyActiveElement()) return;
      // stop the event.
      event.preventDefault();
      // copy as JSON
      let tags = [];
      if (this.activeTags.length > 0) {
        tags = this.activeTags;
      } else {
        tags = [this.name];
      }
      event.clipboardData.setData('text/html', prepareDataForHTMLClipboard({ tags }));
      // copy as plain text
      event.clipboardData.setData('text/plain', tags.join(' '));
    },
    handleCut(event) {
      if (!this.isCurrentlyActiveElement() || !this.isRemovableTag) return;
      this.handleCopy(event);
      this.deleteTag(event);
    },
    /**
     * Handles pasting into the page, when the focused element,
     * is the button of the current Tag instance
     * @param {ClipboardEvent} event
     */
    handlePaste(event) {
      if (!this.isCurrentlyActiveElement() || !this.isRemovableTag) return;
      // stop the `paste` event.
      event.preventDefault();
      // delete the current tag, as we are pasting over it
      this.deleteTag(event);
      // emit up the event data, for the `FilterInput` to handle
      this.$emit('paste-content', event);
    },
    deleteTag(event) {
      this.$emit('delete-tag', { tagName: this.name, event });
      this.$emit('prevent-blur');
    },
    /**
     * Handles clicking on tags.
     * Works for Mouse clicks and VO clicks.
     * @param {MouseEvent} event
     */
    focusButton(event = {}) {
      if (!this.keyboardIsVirtual) {
        this.$refs.button.focus();
      }
      // if the mouse click has no buttons clicked, its coming from VO
      if (event.buttons === 0 && this.isFocused) {
        this.deleteTag(event);
      }
    },
  },
  computed: {
    ariaSelected: ({ isActiveTag, isRemovableTag }) => {
      if (!isRemovableTag) return null;
      return isActiveTag ? 'true' : 'false';
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.tag {
  display: inline-block;
  padding-right: rem(10px);

  &:focus {
    outline: none;
  }

  button {
    color: var(--color-figure-gray);
    background-color: var(--color-fill-tertiary);
    @include font-styles(body-reduced-tight);
    border-radius: rem(14px);
    padding: rem(4px) rem(10px);
    white-space: nowrap;
    border: 1px solid transparent;

    @media (hover: hover) { // Prevent hover state to get stuck on iOS Safari
      &:hover {
        transition: background-color 0.2s, color 0.2s;
        background-color: var(--color-fill-blue);
        color: white;
      }
    }

    // We only want to make active the tags when they are clicked (focus) to prevent
    // ghost active states when deleting tags. https://stackoverflow.com/questions/1677990/
    &:focus:active {
      background-color: var(--color-fill-blue);
      color: white;
    }

    &:focus, &.focus {
      @include focus-shadow-form-element();
    }

    @include on-keyboard-focus() {
      @include focus-shadow-form-element();
    }
  }
}
</style>
