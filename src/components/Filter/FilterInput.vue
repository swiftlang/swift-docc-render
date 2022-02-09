<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="filter"
    role="search"
    tabindex="0"
    :aria-labelledby="searchAriaLabelledBy"
    :class="{ 'focus': showSuggestedTags }"
    @blur.capture="handleBlur"
    @focus.capture="showSuggestedTags = true"
  >
    <div :class="['filter__wrapper', { 'filter__wrapper--reversed': positionReversed }]">
      <div class="filter__top-wrapper">
        <button
          class="filter__filter-button"
          aria-hidden="true"
          tabindex="-1"
          :class="{ 'blue': inputIsNotEmpty }"
          @click="focusInput"
          @mousedown.prevent
        >
          <slot name="icon" />
        </button>
        <div
          :class="['filter__input-box-wrapper', { 'scrolling': isScrolling }]"
          @scroll="handleScroll"
        >
          <TagList
            v-if="hasSelectedTags"
            :id="SelectedTagsId"
            :input="input"
            :tags="selectedTags"
            :ariaLabel="selectedTagsLabel"
            :activeTags="activeTags"
            v-bind="virtualKeyboardBind"
            class="filter__selected-tags"
            ref="selectedTags"
            areTagsRemovable
            v-on="selectedTagsMultipleSelectionListeners"
            @focus-prev="positionReversed ? focusFirstTag() : null"
            @focus-next="focusInputFromTags"
            @reset-filters="resetFilters"
            @prevent-blur="$emit('update:preventedBlur', true)"
          />
          <label
            id="filter-label"
            :for="FilterInputId"
            class="visuallyhidden"
            aria-hidden="true"
          >
            {{ placeholder }}
          </label>
          <input
            :id="FilterInputId"
            ref="input"
            v-model="modelValue"
            :placeholder="hasSelectedTags ? '' : placeholder"
            :aria-expanded="displaySuggestedTags ? 'true' : 'false'"
            v-bind="AXinputProperties"
            type="text"
            class="filter__input"
            v-on="inputMultipleSelectionListeners"
            @keydown.down.prevent="positionReversed ? null : focusFirstTag()"
            @keydown.up.prevent="positionReversed ? focusFirstTag() : null"
            @keydown.left="leftKeyInputHandler"
            @keydown.right="rightKeyInputHandler"
            @keydown.delete="deleteHandler"
            @keydown.meta.a.prevent="selectInputAndTags"
            @keydown.ctrl.a.prevent="selectInputAndTags"
            @keydown.exact="inputKeydownHandler"
            @keydown.enter.exact="enterHandler"
            @keydown.shift.exact="inputKeydownHandler"
            @keydown.shift.meta.exact="inputKeydownHandler"
            @keydown.meta.exact="assignEventValues"
            @keydown.ctrl.exact="assignEventValues"
          >
        </div>
        <div class="filter__delete-button-wrapper">
          <button
            v-if="(input.length) || displaySuggestedTags || hasSelectedTags"
            aria-label="Reset Filter"
            class="filter__delete-button"
            @click="resetFilters(true)"
            @mousedown.prevent
          >
            <ClearRoundedIcon />
          </button>
        </div>
      </div>
      <TagList
        v-if="displaySuggestedTags"
        :id="SuggestedTagsId"
        ref="suggestedTags"
        :ariaLabel="suggestedTagsLabel"
        :input="input"
        :tags="suggestedTags"
        v-bind="virtualKeyboardBind"
        class="filter__suggested-tags"
        @click-tags="selectTag($event.tagName)"
        @prevent-blur="$emit('update:preventedBlur', true)"
        @focus-next="positionReversed ? focusInput() : $emit('exit-filter')"
        @focus-prev="positionReversed ? $emit('exit-filter') : focusInput()"
      />
    </div>
  </div>
</template>

<script>
import ClearRoundedIcon from 'theme/components/Icons/ClearRoundedIcon.vue';
import { pluralize } from 'docc-render/utils/strings';
import multipleSelection from 'docc-render/mixins/multipleSelection';
import handleScrollbar from 'docc-render/mixins/handleScrollbar';
import TagList from './TagList.vue';

// Max number of tags to show
export const TagLimit = 5;

const FilterInputId = 'filter-input';
const SelectedTagsId = 'selected-tags';
const SuggestedTagsId = 'suggested-tags';
const AXinputProperties = {
  autocorrect: 'off',
  autocapitalize: 'off',
  autocomplete: 'off',
  spellcheck: 'false',
  role: 'combobox',
  'aria-haspopup': 'true',
  'aria-autocomplete': 'none',
  'aria-owns': 'suggestedTags',
  'aria-controls': 'suggestedTags',
};

export default {
  name: 'FilterInput',
  mixins: [handleScrollbar, multipleSelection],
  constants: {
    FilterInputId,
    SelectedTagsId,
    SuggestedTagsId,
    AXinputProperties,
    TagLimit,
  },
  components: {
    TagList,
    ClearRoundedIcon,
  },
  props: {
    positionReversed: {
      type: Boolean,
      default: () => false,
    },
    tags: {
      type: Array,
      default: () => ([]),
    },
    selectedTags: {
      type: Array,
      default: () => [],
    },
    preventedBlur: {
      type: Boolean,
      default: () => false,
    },
    placeholder: {
      type: String,
      default: () => 'Filter',
    },
    value: {
      type: String,
      default: () => '',
    },
    shouldTruncateTags: {
      type: Boolean,
      default: false,
    },
    focusInputOnValueChange: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resetedTagsViaDeleteButton: false,
      FilterInputId,
      SelectedTagsId,
      SuggestedTagsId,
      AXinputProperties,
      showSuggestedTags: false,
    };
  },
  computed: {
    tagsText: ({ suggestedTags }) => pluralize({
      en: {
        one: 'tag',
        other: 'tags',
      },
    }, suggestedTags.length),
    selectedTagsLabel: ({ tagsText }) => `Selected ${tagsText}`,
    suggestedTagsLabel: ({ tagsText }) => `Suggested ${tagsText}`,
    hasSuggestedTags: ({ suggestedTags }) => suggestedTags.length,
    hasSelectedTags: ({ selectedTags }) => selectedTags.length,
    inputIsNotEmpty: ({ input, hasSelectedTags }) => input.length || hasSelectedTags,
    searchAriaLabelledBy: ({ hasSelectedTags }) => (
      hasSelectedTags ? FilterInputId.concat(' ', SelectedTagsId) : FilterInputId
    ),
    modelValue: {
      get: ({ value }) => value,
      set(v) {
        this.$emit('input', v);
      },
    },
    input: ({ value }) => value,
    /**
     * Filters out the selected tags, from the tags.
     * Can also truncate the tags, at a certain limit, via the `shouldTruncateTags` prop.
     * @returns {string[]}
     */
    suggestedTags: ({ tags, selectedTags, shouldTruncateTags }) => {
      const suggestedTags = tags.filter(tag => !selectedTags.includes(tag));

      return shouldTruncateTags
        ? suggestedTags
        : suggestedTags.slice(0, TagLimit);
    },
    displaySuggestedTags: ({ showSuggestedTags, suggestedTags }) => (
      showSuggestedTags && suggestedTags.length > 0
    ),
    inputMultipleSelectionListeners: ({
      resetActiveTags,
      handleCopy,
      handleCut,
      handlePaste,
    }) => (
      {
        click: resetActiveTags,
        copy: handleCopy,
        cut: handleCut,
        paste: handlePaste,
      }
    ),
    selectedTagsMultipleSelectionListeners: ({
      handleSingleTagClick,
      selectInputAndTags,
      handleDeleteTag,
      selectedTagsKeydownHandler,
      focusTagHandler,
      handlePaste,
    }) => (
      {
        'click-tags': handleSingleTagClick,
        'select-all': selectInputAndTags,
        'delete-tag': handleDeleteTag,
        keydown: selectedTagsKeydownHandler,
        focus: focusTagHandler,
        'paste-tags': handlePaste,
      }
    ),
  },
  watch: {
    async selectedTags() {
      if (!this.resetedTagsViaDeleteButton) {
        await this.focusInput();
      } else {
        this.resetedTagsViaDeleteButton = false;
      }

      if (this.displaySuggestedTags && this.hasSuggestedTags) {
        this.$refs.suggestedTags.resetScroll();
      }
    },

    suggestedTags(value) {
      this.$emit('suggested-tags', value);
    },

    showSuggestedTags(value) {
      this.$emit('show-suggested-tags', value);
    },

    async input() {
      // if the `value` changes, but we are not focused on the input, we can make sure the input
      // is focused, by setting `focusOnValueChange`
      if (
        this.focusInputOnValueChange
        && document.activeElement !== this.$refs.input
        && this.inputIsNotEmpty
      ) {
        this.focusInput();
      }
    },
  },
  methods: {
    /**
     * Focuses the input
     * @returns {Promise<void>}
     */
    async focusInput() {
      // make sure everything is rendered
      await this.$nextTick();
      // focus the input
      this.$refs.input.focus();

      if (!this.input && this.resetActiveTags) {
        this.resetActiveTags();
      }
    },
    async resetFilters(hideTags = false) {
      this.setFilterInput('');
      this.setSelectedTags([]);

      if (!hideTags) {
        // We prevent blur from hiding tags
        this.$emit('update:preventedBlur', true);
        if (this.resetActiveTags) {
          this.resetActiveTags();
        }
        await this.focusInput();
        return;
      }

      this.resetedTagsViaDeleteButton = true;
      this.showSuggestedTags = false;
      this.$refs.input.blur();
    },
    focusFirstTag() {
      // make sure we show the suggestedTags, in case we lost focus
      if (!this.showSuggestedTags) {
        this.showSuggestedTags = true;
      }
      // make sure that the suggestedTags ref exists
      if (this.hasSuggestedTags && this.$refs.suggestedTags) {
        this.$refs.suggestedTags.focusFirstTag();
      }
    },
    setFilterInput(value) {
      this.$emit('input', value);
    },
    setSelectedTags(tags) {
      this.$emit('update:selectedTags', tags);
    },
    deleteTags(array) {
      this.setSelectedTags(this.selectedTags.filter(tag => !array.includes(tag)));
    },
    async handleBlur(event) {
      // if the blur came from clicking a link
      const target = event.relatedTarget;
      if (target && target.matches && target.matches('button, input, ul')) return;
      // Wait for mousedown to send event listeners
      await this.$nextTick();

      this.resetActiveTags();

      if (this.preventedBlur) {
        this.$emit('update:preventedBlur', false);
        return;
      }
      this.showSuggestedTags = false;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$tag-outline-padding: 4px !default;
$input-vertical-padding: rem(13px) !default;

.filter {
  --input-vertical-padding: #{$input-vertical-padding};

  position: relative;
  box-sizing: border-box;
  // Remove Gray Highlight When Tapping Links in Mobile Safari =>
  // https://css-tricks.com/snippets/css/remove-gray-highlight-when-tapping-links-in-mobile-safari/
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  border-radius: $small-border-radius + 1;
  @include on-keyboard-focus() {
    outline: none;
  }

  &__top-wrapper {
    display: flex;
  }

  &__filter-button {
    position: relative;
    margin-left: rem(10px);
    z-index: 1;
    cursor: text;
    margin-right: rem(3px);

    @include breakpoint(small) {
      margin-right: rem(7px);
    }

    .svg-icon {
      fill: var(--color-fill-gray-secondary);
      display: block;
      height: 21px;
    }

    &.blue /deep/ > * {
      fill: var(--color-figure-blue);
      color: var(--color-figure-blue);
    }
  }

  &.focus {
    .filter__wrapper {
      box-shadow: 0 0 0 3pt var(--color-focus-color);
      border-color: var(--color-fill-blue);
    }
  }

  &__wrapper {
    border: 1px solid var(--color-fill-gray-secondary);
    background: var(--color-fill);
    border-radius: $small-border-radius;

    &--reversed {
      display: flex;
      flex-direction: column-reverse;
    }
  }

  &__suggested-tags {
    border-top: 1px solid var(--color-fill-gray-tertiary);
    z-index: 1;
    overflow: hidden;

    /deep/ ul {
      padding: var(--input-vertical-padding) rem(9px);
      border: 1px solid transparent;
      border-bottom-left-radius: $small-border-radius - 1;
      border-bottom-right-radius: $small-border-radius - 1;

      .fromkeyboard & {
        &:focus {
          outline: none;
          box-shadow: 0 0 0 5px var(--color-focus-color);
        }
      }
    }

    .filter__wrapper--reversed & {
      border-bottom: 1px solid var(--color-fill-gray-tertiary);
      border-top: none;
    }
  }

  &__selected-tags {
    z-index: 1;
    padding-left: $tag-outline-padding;
    margin: -$tag-outline-padding 0;

    @include breakpoint(small) {
      padding-left: 0;
    }

    /deep/ {
      ul {
        padding: $tag-outline-padding;

        @include breakpoint(small) {
          padding-right: rem(7px);
        }

        .tag:last-child {
          padding-right: 0;
        }
      }
    }
  }

  &__delete-button {
    @include replace-outline-for-shadow-on-focus;
    position: relative;
    margin: 0;
    z-index: 1;
    border-radius: 100%;

    .clear-rounded-icon {
      height: rem(16px);
      width: rem(16px);
      fill: var(--color-fill-gray-secondary);
      display: block;
    }
  }

  &__delete-button-wrapper {
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-top-right-radius: $small-border-radius;
    border-bottom-right-radius: $small-border-radius;
  }

  &__input-box-wrapper {
    @include custom-horizontal-scrollbar;
    display: flex;
    overflow-x: auto;
    align-items: center;
    cursor: text;
    flex: 1;
  }

  &__input {
    @include font-styles(body-large);
    color: var(--color-text);
    height: rem(28px);
    border: none;
    width: 100%;
    min-width: 130px; // set a min width, so it does not get crushed by tags
    background: transparent;
    padding: var(--input-vertical-padding) 0;
    z-index: 1;
    // Text indent is needed instead of padding so text inside <input> doesn't get cut off
    text-indent: rem(7px);

    @include breakpoint(small) {
      text-indent: rem(3px);
    }

    &:focus {
      outline: none;
    }

    &[placeholder] {
      @include placeholder(var(--color-fill-gray-secondary))
    }
  }
}
</style>
