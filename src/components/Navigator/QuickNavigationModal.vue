<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="quick-navigation"
  >
    <div
      class="quick-navigation__modal-shadow"
      @click="closeQuickNavigationModal()"
    >
    </div>
    <div
      class="quick-navigation__container"
      ref="container"
    >
      <div class="quick-navigation__input-container">
        <div class="quick-navigation__magnifier-icon-container">
          <MagnifierIcon/>
        </div>
        <input
          class="quick-navigation__filter"
          ref="input"
          type="text"
          placeholder="Quick Navigation"
          v-model="userInput"
          @input="selectedIndex = 0"
        />
        <button
          v-if="userInput.length"
          class="quick-navigation__clear-icon"
          @click="clearUserInput()"
        >
          <ClearRoundedIcon />
        </button>
        <div class="quick-navigation__close-key">
          <span>
            ESC
          </span>
        </div>
      </div>
      <div
        class="quick-navigation__match-list"
        :class="{ 'active' : debouncedInput.length }"
      >
        <div
          v-if="debouncedInput.length && !filteredSymbols.length"
          class="no-results"
        >
          <p>
            No results found.
         </p>
        </div>
        <div
          v-for="(symbol, idx) in filteredSymbols"
          :class="{ 'selected': idx == selectedIndex }"
          :key="idx"
          @click="closeQuickNavigationModal()"
        >
          <Reference
            class="quick-navigation__reference"
            :url="symbol.path"
            :id="idx"
          >
            <div
              class="quick-navigation__symbol-match"
              ref="match"
            >
              <div class="symbol-info">
                <div class="symbol-name">
                  <NavigatorLeafIcon
                    class="navigator-icon"
                    :type="symbol.type"
                  />
                  <div class="symbol-title">
                    <span v-text="symbol.title.slice(0, symbol.start)"></span>
                    <QuickNavigationHighlighter
                      :text="symbol.substring"
                      :matcherText="debouncedInput"
                    />
                    <span v-text="symbol.title.slice(symbol.start + symbol.matchLength)">
                    </span>
                  </div>
                </div>
                <div
                  v-if="symbol.relativePath"
                  class="symbol-path"
                >
                  {{ symbol.relativePath }}
                </div>
              </div>
            </div>
          </Reference>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import QuickNavigationHighlighter from 'docc-render/components/Navigator/QuickNavigationHighlighter.vue';
import ClearRoundedIcon from 'theme/components/Icons/ClearRoundedIcon.vue';
import MagnifierIcon from 'theme/components/Icons/MagnifierIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import debounce from 'docc-render/utils/debounce';
import scrollLock from 'docc-render/utils/scroll-lock';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';

export default {
  name: 'QuickNavigationModal',
  components: {
    ClearRoundedIcon,
    MagnifierIcon,
    NavigatorLeafIcon,
    QuickNavigationHighlighter,
    Reference,
  },
  props: {
    isModalOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      debouncedInput: '',
      selectedIndex: -1,
      userInput: '',
      quickNavigationStore: this.quickNavigationStore,
    };
  },
  computed: {
    filterPattern: ({ debouncedInput }) => new RegExp(safeHighlightPattern(debouncedInput), 'i'),
    filteredSymbols: ({
      constructFuzzyRegex,
      flattenIndex,
      fuzzyMatch,
      debouncedInput,
      orderSymbolsByPriority,
    }) => {
      const symbols = flattenIndex.filter(symbol => (
        symbol.type !== 'groupMarker'
        && symbol.title != null
      ));
      if (!debouncedInput) return [];
      const matches = fuzzyMatch({
        debouncedInput: debouncedInput.toLowerCase(),
        symbols,
        processedInputRegex: new RegExp(constructFuzzyRegex(debouncedInput)),
      });
      // Return the first 20 symbols out of sorted ones
      return orderSymbolsByPriority(matches).slice(0, 20);
    },
    flattenIndex: ({ quickNavigationStore }) => quickNavigationStore.state.flattenIndex,
    modalOn: ({ quickNavigationStore }) => quickNavigationStore.state.enableQuickNavigation,
    fuzzyRegex: ({
      constructFuzzyRegex,
      debouncedInput,
    }) => new RegExp(constructFuzzyRegex(debouncedInput.toLowerCase())),
  },
  watch: {
    isModalOpen(isOpen) {
      if (isOpen) {
        this.onShow();
      } else {
        this.onHide();
      }
    },
    userInput: 'debounceInput',
  },
  inject: ['quickNavigationStore'],
  methods: {
    clearUserInput() {
      this.debouncedInput = '';
      this.userInput = '';
      this.$refs.input.focus();
    },
    closeQuickNavigationModal() {
      this.quickNavigationStore.toggleShowQuickNavigationModal(false);
    },
    constructFuzzyRegex(userInput) {
      // Construct regex for fuzzy match
      // Ex:
      // foobar -> f[^f]*?o[^o]*?o[^o]*?b[^b]*?a[^a]*?r
      return [...userInput].reduce((prev, char, index) => (
        prev
          .concat(char.toLowerCase())
          .concat(index < userInput.length - 1 ? `[^${char.toLowerCase()}]*?` : '')
      ), '');
    },
    debounceInput: debounce(function debounceInput(value) {
      this.debouncedInput = value;
    }, 500),
    fuzzyMatch: ({ debouncedInput, symbols, processedInputRegex }) => (
      symbols.map((symbol) => {
        const match = processedInputRegex.exec(symbol.title);
        // Dismiss if symbol isn't matched
        if (!match) return false;

        const matchLength = match[0].length;
        const inputLength = debouncedInput.length;
        // Dismiss if match length is greater than 3x the input's length
        if (matchLength > inputLength * 3) return false;

        return ({
          title: symbol.title,
          path: symbol.path,
          relativePath: symbol.path.split('/').slice(3, -1).join('/'),
          type: symbol.type,
          inputLengthDifference: symbol.title.length - inputLength,
          matchLength,
          matchLengthDifference: matchLength - inputLength,
          start: match.index,
          substring: match[0],
        });
      }).filter(Boolean)
    ),
    handleKeyDown() {
      if (
        this.selectedIndex === this.filteredSymbols.length - 1
      ) { return; }
      if (this.selectedIndex === -1) {
        this.selectedIndex = 0;
        return;
      }
      this.selectedIndex += 1;
      this.$refs.match[this.selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    },
    handleKeyUp() {
      if (
        !this.filteredSymbols.length
        || this.selectedIndex === 0
      ) {
        this.selectedIndex = 0;
        return;
      }
      this.selectedIndex -= 1;
      this.$refs.match[this.selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    },
    handleKeyEnter() {
      this.$router.push(this.filteredSymbols[this.selectedIndex].path);
      this.closeQuickNavigationModal();
    },
    onHide() {
      // unlock scroll
      scrollLock.unlockScroll(this.$refs.container);
    },
    onKeydown(event) {
      if (!this.modalOn) { return; }
      if (event.key === 'Escape') {
        this.closeQuickNavigationModal();
        event.preventDefault();
        return;
      }
      switch (event.key) {
      case 'ArrowDown':
        this.handleKeyDown();
        break;
      case 'ArrowUp':
        this.handleKeyUp();
        event.preventDefault();
        break;
      case 'Enter':
        this.handleKeyEnter();
        break;
      default: break;
      }
    },
    onShow() {
      // lock scroll
      scrollLock.lockScroll(this.$refs.container);
      this.$refs.input.focus();
      this.selectedIndex = -1;
    },
    orderSymbolsByPriority(matchingSymbols) {
      return matchingSymbols.sort((a, b) => {
        // Shortests symbol match title have preference over larger titles
        if (a.matchLengthDifference > b.matchLengthDifference) return 1;
        if (a.matchLengthDifference < b.matchLengthDifference) return -1;
        // Shortests symbol title have preference over larger titles
        if (a.inputLengthDifference > b.inputLengthDifference) return 1;
        if (a.inputLengthDifference < b.inputLengthDifference) return -1;
        // Matches at the beginning of string have relevance over matches at the end
        if (a.start > b.start) return 1;
        if (a.start < b.start) return -1;
        return 0;
      });
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown);
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$clear-icon-size: rem(23px);
$modal-margin-top: 10rem;
$modal-margin-sides: 20rem;
$modal-padding-top: 1.25rem;
$base-border-width: 1px;
$filter-padding: rem(20px);

.quick-navigation {
  z-index: 9998;
  input[type="text"] {
    @include font-styles(body-large);
  }
  &__clear-icon {
    height: $clear-icon-size;
    margin: auto;
    margin-right: rem(5px);
    width: $clear-icon-size;
  }
  &__close-key {
    @include font-styles(caption);
    border: solid $base-border-width;
    border-color: var(--color-grid);
    border-radius: $border-radius;
    color: var(--color-figure-gray-secondary);
    padding: rem(5px);
  }
  &__container {
    background-color: var(--color-fill);
    border: solid $base-border-width var(--color-fill-gray);
    border-radius: $border-radius;
    filter: drop-shadow(0px 7px 50px rgba(0, 0, 0, 0.25));
    left: 0;
    margin: auto;
    position: fixed;
    right: 0;
    top: $modal-margin-top;
    z-index: 10000;
    width: 680px;
  }
  &__filter {
    background: var(--color-fill);
    border: 0px;
    border-radius: $border-radius;
    box-sizing: border-box;
    outline-width: 0;
    padding-left: $filter-padding;
    padding-right: $filter-padding;
    width: 100%;
  }
  &__input-container {
    display: flex;
    padding: $filter-padding;
  }
  &__magnifier-icon-container {
    height: rem(18px);
    margin: auto;
    width: rem(18px);
  }
  &__match-list {
    overflow: scroll;
    max-height: 400px;
    &.active {
      border-top: 1px solid var(--color-fill-gray);
    }
    .no-results {
      margin: 20px auto 20px auto;
      width: fit-content;
    }
    .selected {
      background-color: var(--color-fill-tertiary);
    }
  }
  &__modal-shadow {
    background-color: var(--color-quick-navigation-modal-shadow);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    z-index: 9999;
  }
  &__reference {
    text-decoration: none;
  }
  &__symbol-match {
    display: flex;
    height: rem(40px);
    padding: rem(12px) $filter-padding rem(12px) $filter-padding;
    color: var(--color-figure-gray);
    &:hover {
      background-color: var(--color-navigator-item-hover);
    }
    .symbol-info {
      margin-top: auto;
      margin-bottom: auto;
      width: 100%;
      .navigator-icon {
        margin-bottom: auto;
        margin-right: rem(10px);
      }
      .symbol-name {
        display: flex;
        p {
          margin: 0;
        }
        .symbol-title {
           @include truncate(100%);
        }
      }
      .symbol-path {
        @include font-styles(body-reduced-tight);
        color: var(--color-figure-gray-secondary);
        margin-left: 27px;
      }
    }
  }
}

</style>
