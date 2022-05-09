<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="tags">
    <div
      class="scroll-wrapper"
      :class="{ 'scrolling': isScrolling }"
      ref="scroll-wrapper"
      @scroll="handleScroll"
    >
      <ul
        :id="`${id}-tags`"
        ref="tags"
        :aria-label="ariaLabel"
        tabindex="0"
        role="listbox"
        :aria-multiselectable="areTagsRemovable ? 'true' : 'false'"
        aria-orientation="horizontal"
        @keydown.left.capture.prevent="focusPrev"
        @keydown.right.capture.prevent="focusNext"
        @keydown.up.capture.prevent="focusPrev"
        @keydown.down.capture.prevent="focusNext"
        @keydown.delete.prevent.self="$emit('reset-filters')"
        @keydown.meta.a.capture.prevent="$emit('select-all')"
        @keydown.ctrl.a.capture.prevent="$emit('select-all')"
        @keydown.exact.capture="handleKeydown"
        @keydown.shift.exact.capture="handleKeydown"
      >
        <Tag
          v-for="(tag, index) in tags"
          ref="tag"
          :key="tag.id || index"
          :name="tag.label || tag"
          :isFocused="focusedIndex === index"
          :isRemovableTag="areTagsRemovable"
          :filterText="input"
          :isActiveTag="activeTags.includes(tag)"
          :activeTags="activeTags"
          :keyboardIsVirtual="keyboardIsVirtual"
          @focus="handleFocus($event, index)"
          @click="$emit('click-tags', $event)"
          @delete-tag="$emit('delete-tag', $event)"
          @prevent-blur="$emit('prevent-blur')"
          @paste-content="$emit('paste-tags', $event)"
          @keydown="$emit('keydown', $event)"
        />
      </ul>
    </div>
  </div>
</template>
<script>
import { isSingleCharacter } from 'docc-render/utils/input-helper';
import handleScrollbar from 'docc-render/mixins/handleScrollbar';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';
import Tag from './Tag.vue';

export default {
  name: 'Tags',
  mixins: [
    handleScrollbar,
    keyboardNavigation,
  ],
  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    activeTags: {
      type: Array,
      default: () => [],
    },
    ariaLabel: {
      type: String,
      required: false,
    },
    id: {
      type: String,
      required: false,
    },
    input: {
      type: String,
      default: null,
    },
    areTagsRemovable: {
      type: Boolean,
      default: false,
    },
    keyboardIsVirtual: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Tag,
  },
  methods: {
    focusTag(name) {
      this.focusIndex(this.tags.indexOf(name));
    },
    startingPointHook() {
      this.$emit('focus-prev');
    },
    handleFocus(event, index) {
      this.focusIndex(index);
      this.isScrolling = false;
      this.$emit('focus', event);
    },
    endingPointHook() {
      this.$emit('focus-next');
    },
    resetScroll() {
      this.$refs['scroll-wrapper'].scrollLeft = 0;
    },

    /**
     * Handles typing while focused on tags.
     * Should delete tag if a character is typed.
     */
    handleKeydown(event) {
      const { key } = event;
      const tag = this.tags[this.focusedIndex];

      // match if it is an alphanum key or space
      if (isSingleCharacter(key) && tag) {
        this.$emit('delete-tag', { tagName: tag.label || tag, event });
      }
    },
  },
  computed: {
    totalItemsToNavigate: ({ tags }) => tags.length,
  },
};
</script>

<style scoped lang="scss">

@import 'docc-render/styles/_core.scss';

.tags {
  position: relative;
  margin: 0;
  list-style: none;
  box-sizing: border-box;
  transition: padding-right .8s, padding-bottom .8s, max-height 1s, opacity 1s;
  padding: 0;

  .scroll-wrapper {
    overflow-x: auto;
    @include custom-horizontal-scrollbar;
  }

  ul {
    margin: 0;
    padding: 0;
    display: flex;
  }
}
</style>
