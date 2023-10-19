<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <GenericModal
    isFullscreen
    :showClose="false"
    :visible.sync="isVisible"
    backdropBackgroundColorOverride="rgba(0, 0, 0, 0.7)"
  >
    <div
      class="quick-navigation"
    >
      <div
        class="quick-navigation__container"
        :class="{ 'focus' : focusedInput }"
      >
        <FilterInput
          v-model="userInput"
          class="quick-navigation__filter"
          :placeholder="$t('filter.search-symbols', { technology })"
          focusInputWhenCreated
          focusInputWhenEmpty
          preventBorderStyle
          selectInputOnFocus
          @keydown.down.exact.native.prevent="handleDownKeyInput"
          @keydown.enter.exact.native="handleKeyEnter"
          @focus="focusedInput = true"
          @blur="focusedInput = false"
        >
          <template #icon>
            <div
              class="quick-navigation__magnifier-icon-container"
              :class="{ 'blue': userInput.length }"
            >
              <MagnifierIcon />
            </div>
          </template>
        </FilterInput>
        <div
          class="quick-navigation__match-list"
          :class="{ 'active' : processedUserInput.length }"
        >
          <div
            v-if="noResultsWereFound"
            class="no-results"
          >
            <p>
              No results found.
            </p>
          </div>
          <template v-else>
            <div
              v-bind="{[SCROLL_LOCK_DISABLE_ATTR]: true}"
              class="quick-navigation__refs"
              @keydown.down.exact.prevent="focusNext"
              @keydown.up.exact.prevent="focusPrev"
              @keydown.enter.exact="handleKeyEnter"
            >
              <Reference
                v-for="(symbol, index) in filteredSymbols"
                class="quick-navigation__reference"
                :key="symbol.uid"
                :url="symbol.path"
                :tabindex="focusedIndex === index ? '0' : '-1'"
                @click.native="closeQuickNavigationModal"
                ref="match"
              >
                <div
                  class="quick-navigation__symbol-match"
                  role="list"
                >
                  <div class="symbol-info">
                    <div class="symbol-name">
                      <TopicTypeIcon
                        class="navigator-icon"
                        :type="symbol.type"
                      />
                      <div class="symbol-title">
                        <span v-text="formatSymbolTitle(symbol.title, 0, symbol.start)" />
                        <QuickNavigationHighlighter
                          :text="symbol.substring"
                          :matcherText="processedUserInput"
                        />
                        <span
                          v-text="formatSymbolTitle(
                            symbol.title,
                            symbol.start + symbol.matchLength
                          )"
                        />
                      </div>
                    </div>
                    <div class="symbol-path">
                      <div
                        v-for="(parent, index) in symbol.parents"
                        :key="parent.title"
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
            <Preview
              v-if="previewState"
              class="quick-navigation__preview"
              :json="previewJSON"
              :state="previewState"
              v-bind="{[SCROLL_LOCK_DISABLE_ATTR]: true}"
            />
          </template>
        </div>
      </div>
    </div>
  </GenericModal>
</template>

<script>
import TopicTypeIcon from 'docc-render/components/TopicTypeIcon.vue';
import FilterInput from 'docc-render/components/Filter/FilterInput.vue';
import GenericModal from 'docc-render/components/GenericModal.vue';
import QuickNavigationHighlighter from 'docc-render/components/Navigator/QuickNavigationHighlighter.vue';
import MagnifierIcon from 'theme/components/Icons/MagnifierIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import QuickNavigationPreview from 'docc-render/components/Navigator/QuickNavigationPreview.vue';
import debounce from 'docc-render/utils/debounce';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';
import LRUMap from 'docc-render/utils/lru-map';
import { convertChildrenArrayToObject, getParents } from 'docc-render/utils/navigatorData';
import { fetchDataForPreview } from 'docc-render/utils/data';
import { SCROLL_LOCK_DISABLE_ATTR } from 'docc-render/utils/scroll-lock';

const { PreviewState } = QuickNavigationPreview.constants;

const ABORT_ERROR_NAME = 'AbortError';
const MAX_RESULTS = 20;
const SLOW_LOADING_DELAY = 1000; // 1 second in milliseconds

export default {
  name: 'QuickNavigationModal',
  components: {
    FilterInput,
    GenericModal,
    MagnifierIcon,
    TopicTypeIcon,
    QuickNavigationHighlighter,
    Reference,
    Preview: QuickNavigationPreview,
  },
  mixins: [
    keyboardNavigation,
  ],
  created() {
    this.abortController = null;
    this.$cachedSymbolResults = new LRUMap(MAX_RESULTS);
    this.loadingTimeout = null;
  },
  data() {
    return {
      debouncedInput: '',
      userInput: '',
      focusedInput: false,
      cachedSymbolResults: {},
      previewIsLoadingSlowly: false,
      SCROLL_LOCK_DISABLE_ATTR,
    };
  },
  props: {
    children: {
      type: Array,
      required: true,
    },
    showQuickNavigationModal: {
      type: Boolean,
      required: true,
    },
    technology: {
      type: String,
      required: true,
    },
  },
  computed: {
    childrenMap({ children }) {
      return convertChildrenArrayToObject(children);
    },
    filteredSymbols: ({
      constructFuzzyRegex,
      children,
      fuzzyMatch,
      processedUserInput,
      childrenMap,
      orderSymbolsByPriority,
    }) => {
      const symbols = children.filter(symbol => (
        symbol.type !== 'groupMarker'
        && symbol.title != null
      ));
      if (!processedUserInput) return [];
      const matches = fuzzyMatch({
        inputLength: processedUserInput.length,
        symbols,
        processedInputRegex: new RegExp(constructFuzzyRegex(processedUserInput), 'i'),
        childrenMap,
      });
      // Filter repeated matches and return the first 20
      const uniqueMatches = [...new Map(matches.map(match => [match.path, match])).values()];
      return orderSymbolsByPriority(uniqueMatches).slice(0, MAX_RESULTS);
    },
    isVisible: {
      get: ({ showQuickNavigationModal }) => showQuickNavigationModal,
      set(value) {
        this.$emit('update:showQuickNavigationModal', value);
      },
    },
    noResultsWereFound: ({ processedUserInput, totalItemsToNavigate }) => (
      processedUserInput.length && !totalItemsToNavigate
    ),
    // Transformations required for filtering symbols
    // Remove space-character
    processedUserInput: ({ debouncedInput }) => debouncedInput.replace(/\s/g, ''),
    totalItemsToNavigate: ({ filteredSymbols }) => filteredSymbols.length,
    selectedSymbol: ({
      filteredSymbols,
      focusedIndex,
    }) => (focusedIndex !== null ? filteredSymbols[focusedIndex] : null),
    nextSymbol: ({
      filteredSymbols,
      focusedIndex,
    }) => {
      if (focusedIndex === null) {
        return null;
      }
      let nextIndex = focusedIndex + 1;
      if (nextIndex >= filteredSymbols.length) {
        nextIndex = 0;
      }
      return filteredSymbols[nextIndex];
    },
    focusedMatchElement: ({ $refs, focusedIndex }) => $refs.match[focusedIndex].$el,
    previewJSON: ({
      cachedSymbolResults,
      selectedSymbol,
    }) => (selectedSymbol ? (
      (cachedSymbolResults[selectedSymbol.uid] || {}).json
    ) : (
      null
    )),
    previewState: ({
      cachedSymbolResults,
      previewIsLoadingSlowly,
      selectedSymbol,
      // eslint-disable-next-line no-nested-ternary
    }) => (selectedSymbol && Object.hasOwnProperty.call(cachedSymbolResults, selectedSymbol.uid) ? (
      cachedSymbolResults[selectedSymbol.uid].success
        ? PreviewState.success
        : PreviewState.error
    ) : (
      previewIsLoadingSlowly
        ? PreviewState.loadingSlowly
        : PreviewState.loading
    )),
  },
  watch: {
    userInput: 'debounceInput',
    focusedIndex() {
      if (this.focusedInput) return;
      this.scrollIntoView();
      this.focusReference();
    },
    selectedSymbol: 'fetchSelectedSymbolData',
    $route: 'closeQuickNavigationModal',
  },
  methods: {
    closeQuickNavigationModal() {
      this.$emit('update:showQuickNavigationModal', false);
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
      this.debouncedInput = value;
    }, 250),
    endingPointHook() {
      // Reset selected symbol to the first one of the list
      this.focusedIndex = 0;
    },
    formatSymbolTitle(symbolTitle, symbolStart, symbolEnd) {
      return symbolTitle.slice(symbolStart, symbolEnd);
    },
    fuzzyMatch({
      inputLength, symbols, processedInputRegex, childrenMap,
    }) {
      return symbols.map((symbol) => {
        const match = processedInputRegex.exec(symbol.title);
        // Dismiss if symbol isn't matched
        if (!match) return false;

        const matchLength = match[0].length;
        // Dismiss if match length is greater than 3x the input's length
        if (matchLength > inputLength * 3) return false;
        return ({
          uid: symbol.uid,
          title: symbol.title,
          path: symbol.path,
          parents: getParents(symbol.parent, childrenMap),
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
      if (this.noResultsWereFound || !this.userInput.length) return;
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
    focusReference() {
      this.focusedMatchElement.focus();
    },
    handleDownKeyInput() {
      this.focusedIndex = 0;
      this.focusReference();
    },
    scrollIntoView() {
      this.focusedMatchElement.scrollIntoView({
        block: 'nearest',
      });
    },
    startingPointHook() {
      this.focusedIndex = this.totalItemsToNavigate - 1;
    },
    async fetchSelectedSymbolData() {
      // start a timer: if a full second has elapsed and the network request for
      // data hasn't completed yet, indicate that the data is still loading in
      // the actual UI — without the delay, the constant flashing of this
      // message would be too distracting
      this.loadingTimeout = setTimeout(() => {
        if (this.previewState === PreviewState.loading) {
          this.previewIsLoadingSlowly = true;
        }
      }, SLOW_LOADING_DELAY);

      // exit early if the previwe data is already cached for this symbol as
      // there is no additional work needed
      if (!this.selectedSymbol || this.$cachedSymbolResults.has(this.selectedSymbol.uid)) {
        clearTimeout(this.loadingTimeout);
        this.previewIsLoadingSlowly = false;
        return;
      }

      const fetchSymbolData = async (symbol) => {
        if (!symbol || this.$cachedSymbolResults.has(symbol.uid)) {
          return;
        }

        try {
          // load render JSON for the selected /documentation/ page
          const json = await fetchDataForPreview(symbol.path, {
            signal: this.abortController.signal,
          });
          this.$cachedSymbolResults.set(symbol.uid, {
            success: true,
            json,
          });
        } catch (e) {
          // errors triggered by the abort controller are safe to ignore since
          // we are only aborting them for performance reasons and would like
          // to later re-try them if possible
          if (e.name !== ABORT_ERROR_NAME) {
            this.$cachedSymbolResults.set(symbol.uid, {
              success: false,
            });
          }
        } finally {
          // `LRUMap` is a custom object that is very similar to a builtin `Map`
          // and since `Map` objects can't directly hook into the reactivity
          // in Vue 2, we need to convert this object into a plain `Object` every
          // time it is mutated to workaround this lack of reactivity
          this.cachedSymbolResults = Object.freeze(Object.fromEntries(this.$cachedSymbolResults));
        }
      };

      // the abort controller is useful for clients with slower networks—if it
      // is taking a long time for page data to load, we don't want to create
      // a bottleneck with many queued pending requests. this controller is used
      // to cancel any pending requests that aren't for this symbol or the one
      // immediately following it which can happen on a slow network if the
      // user quickly scrolls through the list of results
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      await Promise.all([
        fetchSymbolData(this.selectedSymbol).finally(() => {
          // the timeout for the loading message only applies to the currently
          // selected symbol
          clearTimeout(this.loadingTimeout);
          this.previewIsLoadingSlowly = false;
        }),
        fetchSymbolData(this.nextSymbol),
      ]);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$base-border-width: 1px;
$input-horizontal-spacing: rem(15px);

.quick-navigation {
  --input-border-color: var(--color-grid);

  input[type="text"] {
    @include font-styles(body-large);
  }

  &__filter {
    --input-horizontal-spacing: #{$input-horizontal-spacing};
  }

  :deep(.filter__wrapper) {
    background-color: var(--color-fill-secondary);
  }

  &__container {
    background-color: var(--color-fill-secondary);
    border: solid $base-border-width var(--input-border-color);
    border-radius: $small-border-radius;
    margin: 0 rem(16px);
    > * {
      --input-text: var(--color-figure-gray-secondary);
    }

    &.focus {
      @include focus-shadow-form-element();
    }
  }
  &__magnifier-icon-container {
    width: rem(17px);
    > * {
      width: 100%;
    }
    &.blue .magnifier-icon {
      fill: var(--color-figure-blue);
      color: var(--color-figure-blue);
    }
  }
  &__match-list {
    display: flex;
    max-height: rem(450px);
    height: 0px;

    & > * {
      min-width: 0;
    }
    &.active {
      height: auto;
      border-top: 1px solid var(--input-border-color);
    }
    .no-results {
      margin: rem(15px) auto;
      width: fit-content;
    }
  }
  &__refs {
    flex: 1;
    overflow: auto;
  }
  &__preview {
    border-left: $base-border-width solid var(--color-grid);
    flex: 0 0 61.8%;
    overflow: auto;
    position: sticky;
    top: 0;
  }
  &__reference {
    display: block;
    padding: rem(10px) rem(15px);

    &:hover {
      text-decoration: none;
      background-color: var(--color-navigator-item-hover);
    }

    &:focus {
      margin: 0 rem(5px);
      padding: rem(10px) rem(10px);
      background-color: var(--color-navigator-item-hover);
    }
  }
  &__symbol-match {
    display: flex;
    height: rem(40px);
    color: var(--color-figure-gray);
    .symbol-info {
      margin: auto;
      width: 100%;
      .navigator-icon {
        margin-right: rem(10px);
      }
      .symbol-name {
        display: flex;
        .symbol-title {
           @include truncate(100%);
        }
      }
      .symbol-path {
        @include font-styles(body-reduced-tight);
        color: var(--color-figure-gray-secondary);
        display: flex;
        margin-left: rem(27px);
        overflow: hidden;
        white-space: nowrap;
        .parent-path {
          padding-right: rem(5px);
        }
      }
    }
  }
}

</style>
