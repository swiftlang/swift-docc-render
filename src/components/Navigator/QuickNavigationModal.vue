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
    @keydown.down.exact.prevent="focusNext"
    @keydown.esc.exact.prevent="closeQuickNavigationModal"
    @keydown.up.exact.prevent="focusPrev"
    @keydown.enter.exact="handleKeyEnter"
  >
    <div
      class="quick-navigation__modal-shadow"
      @click.self="closeQuickNavigationModal()"
    >
      <div
        class="quick-navigation__container"
      >
        <FilterInput
          v-model="userInput"
          placeholder="Search symbols"
          class="quick-navigation__filter"
          :preventFocusStyle=true
          :focusInputWhenCreated=true
          @input="focusedIndex = 0"
        >
          <template slot="icon">
            <div
              class="quick-navigation__magnifier-icon-container"
            >
              <MagnifierIcon />
            </div>
          </template>
          <template v-slot:input-menu-items>
            <div class="quick-navigation__close-key-container">
              <button
                aria-label="Close modal"
                class="quick-navigation__close-key"
                @click="closeQuickNavigationModal()"
              >
                <span>
                  ESC
                </span>
              </button>
            </div>
          </template>
        </FilterInput>
        <div
          class="quick-navigation__match-list"
          :class="{ 'active' : debouncedInput.length }"
        >
          <div
            v-if="noneResultsWhereFound"
            class="no-results"
          >
            <p>
              No results found.
          </p>
          </div>
          <div
            v-for="(symbol, index) in filteredSymbols"
            :class="{ 'selected' : index == focusedIndex }"
            :key="index"
            @click="closeQuickNavigationModal()"
          >
            <Reference
              :url="symbol.path"
              :id="index"
              class="quick-navigation__reference"
            >
              <div
                class="quick-navigation__symbol-match"
                ref="match"
                role="list"
                tabindex="0"
                @focus.capture="focusIndex(index)"
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
                  <div class="symbol-path">
                    <div
                      v-for="(parent, index) in symbol.parents"
                      :key="index"
                    >
                      <span
                        v-text="parent.title"
                        class="parent-path"
                      />
                      <span
                        v-if="index !== symbol.parents.length - 1"
                        class="parent-path"
                        v-text="`/`"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reference>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import FilterInput from 'docc-render/components/Filter/FilterInput.vue';
import QuickNavigationHighlighter from 'docc-render/components/Navigator/QuickNavigationHighlighter.vue';
import MagnifierIcon from 'theme/components/Icons/MagnifierIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import debounce from 'docc-render/utils/debounce';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';
import symbolTreeNavigator from 'docc-render/mixins/symbolTreeNavigator';

export default {
  name: 'QuickNavigationModal',
  components: {
    FilterInput,
    MagnifierIcon,
    NavigatorLeafIcon,
    QuickNavigationHighlighter,
    Reference,
  },
  mixins: [
    keyboardNavigation,
    symbolTreeNavigator,
  ],
  data() {
    return {
      debouncedInput: '',
      userInput: '',
      quickNavigationStore: this.quickNavigationStore,
      flattenIndex: this.quickNavigationStore.state.flattenIndex,
    };
  },
  computed: {
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
        debouncedInput,
        symbols,
        processedInputRegex: new RegExp(constructFuzzyRegex(debouncedInput), 'i'),
      });
      // Return the first 20 symbols out of sorted ones
      return orderSymbolsByPriority(matches).slice(0, 20);
    },
    noneResultsWhereFound: ({ debouncedInput, filteredSymbols }) => (
      debouncedInput.length && !filteredSymbols.length
    ),
    totalItemsToNavigate: ({ filteredSymbols }) => filteredSymbols.length,
  },
  watch: {
    userInput: 'debounceInput',
    focusedIndex: 'scrollIntoView',
  },
  inject: ['quickNavigationStore'],
  methods: {
    handleInputSelect(event) {
      if (event.key !== 'a' || !event.metaKey) return;
      this.$refs.input.select();
    },
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
      // foobar -> [f][^f]*?[o][^o]*?[o][^o]*?[b][^b]*?[a][^a]*?r
      return [...userInput].reduce((prev, char, index) => (
        prev
          .concat(`[${char}]`)
          .concat(index < userInput.length - 1 ? `[^${char.toLowerCase()}]*?` : '')
      ), '');
    },
    debounceInput: debounce(function debounceInput(value) {
      // Remove space-character
      this.debouncedInput = value.replace(/\s/g, '');
    }, 250),
    endingPointHook() {
      // Reset selected symbol to the first one of the list
      this.focusedIndex = 0;
    },
    fuzzyMatch({ debouncedInput, symbols, processedInputRegex }) {
      return symbols.map((symbol) => {
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
          parents: this.getParents(symbol.parent),
          type: symbol.type,
          inputLengthDifference: symbol.title.length - inputLength,
          matchLength,
          matchLengthDifference: matchLength - inputLength,
          start: match.index,
          substring: match[0],
        });
      }).filter(Boolean);
    },
    handleKeyEnter() {
      if (!this.filteredSymbols.length) return;
      this.$router.push(this.filteredSymbols[this.focusedIndex].path);
      this.closeQuickNavigationModal();
    },
    orderSymbolsByPriority(matchingSymbols) {
      return matchingSymbols.sort((a, b) => {
        // Shortests symbol match title have preference over larger titles
        if (a.matchLengthDifference > b.matchLengthDifference) return 1;
        if (a.matchLengthDifference < b.matchLengthDifference) return -1;
        // Matches at the beginning of string have relevance over matches at the end
        if (a.start > b.start) return 1;
        if (a.start < b.start) return -1;
        // Shortests symbol title have preference over larger titles
        if (a.inputLengthDifference > b.inputLengthDifference) return 1;
        if (a.inputLengthDifference < b.inputLengthDifference) return -1;
        return 0;
      });
    },
    scrollIntoView() {
      this.$refs.match[this.focusedIndex].scrollIntoView({
        block: 'nearest',
        inline: 'start',
      });
    },
    startingPointHook() {
      this.focusedIndex = this.filteredSymbols.length - 1;
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleInputSelect);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleInputSelect);
  },
};
</script>

<style lang="scss">
@import 'docc-render/styles/_core.scss';

$clear-icon-size: rem(23px);
$modal-margin-top: 10rem;
$base-border-width: 1px;
$filter-padding: rem(15px);

.quick-navigation {
  input[type="text"] {
    @include font-styles(body-large);
  }
  &__clear-icon {
    display: flex;
    margin: auto;
    margin-right: rem(5px);
    width: $clear-icon-size;
    > * {
      width: 100%;
      height: 100%;
    }
  }
  &__close-key {
    @include font-styles(caption);
    border: solid $base-border-width;
    border-color: var(--color-grid);
    border-radius: $border-radius;
    color: var(--color-figure-gray-secondary);
    padding: rem(5px);
  }
  &__close-key-container {
    margin-top: auto;
    margin-bottom: auto;
    margin-right: rem(10px);
  }
  &__container {
    background-color: var(--color-fill);
    border: solid $base-border-width var(--color-fill-gray);
    border-radius: $border-radius;
    filter: drop-shadow(0px 7px 50px rgba(0, 0, 0, 0.25));
    margin: auto;
    max-width: rem(800px);
    .filter__wrapper {
      border: 0px;
    }
  }
  &__filter {
    background: var(--color-fill);
    border: 0px;
    border-radius: $border-radius;
    box-sizing: border-box;
    outline-width: 0;
    width: 100%;
  }
  &__input-container {
    display: flex;
    padding: $filter-padding;
  }
  &__magnifier-icon-container {
    display: flex;
    height: rem(18px);
    width: rem(18px);
    margin: auto;
    > * {
      width: 100%;
    }
  }
  &__match-list {
    overflow: scroll;
    max-height: rem(450px);
    &.active {
      border-top: 1px solid var(--color-fill-gray);
    }
    .no-results {
      margin: $filter-padding auto $filter-padding auto;
      width: fit-content;
    }
    .selected {
      background-color: var(--color-navigator-item-hover);
    }
  }
  &__modal-shadow {
    background-color: var(--color-quick-navigation-modal-shadow);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    padding: min(rem(10px));
    padding-top: $modal-margin-top;
  }
  &__reference:hover {
      text-decoration: none;
    }
  &__symbol-match {
    display: flex;
    height: rem(40px);
    padding: rem(10px) $filter-padding rem(10px) $filter-padding;
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
        display: flex;
        margin-left: rem(27px);
        .parent-path {
          padding-right: rem(5px);
        }
      }
    }
  }
}

</style>
