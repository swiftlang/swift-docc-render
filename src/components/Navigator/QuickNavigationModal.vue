<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <GenericModal
    :showClose="false"
    :visible="showQuickNavigationModal"
    :isFullscreen="true"
    :styleProps="modalStyleProps"
    @update:visible="$emit('update:showQuickNavigationModal', false)"
  >
    <div
      class="quick-navigation"
      @keydown.down.exact.prevent="focusNext"
      @keydown.up.exact.prevent="focusPrev"
      @keydown.enter.exact="handleKeyEnter"
    >
      <div
        class="quick-navigation__container"
      >
        <FilterInput
          v-model="userInput"
          class="quick-navigation__filter"
          placeholder="Search symbols"
          focusInputWhenCreated
          focusInputWhenEmpty
          @input="focusedIndex = 0"
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
          :class="{ 'active' : debouncedInput.length }"
        >
          <div
            v-if="noResultsWereFound"
            class="no-results"
          >
            <p>
              No results found.
            </p>
          </div>
          <Reference
            v-for="(symbol, index) in filteredSymbols"
            class="quick-navigation__reference"
            :key="symbol.uid"
            :url="symbol.path"
            @click.native="closeQuickNavigationModal"
            @focus.native="focusIndex(index)"
          >
            <div
              class="quick-navigation__symbol-match"
              ref="match"
              role="list"
              :class="{ 'selected' : index == focusedIndex }"
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
                      :matcherText="debouncedInput"
                    />
                    <span
                      v-text="formatSymbolTitle(symbol.title, symbol.start + symbol.matchLength)"
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
import debounce from 'docc-render/utils/debounce';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';
import { convertChildrenArrayToObject, getParents } from 'docc-render/utils/navigatorIndex';

const ModalStyleProps = {
  'background-color': 'transparent',
  'max-width': '50rem',
  height: 'fit-content',
  flex: 'auto',
  margin: '10rem 1rem',
  overflow: 'visible',
};

export default {
  name: 'QuickNavigationModal',
  components: {
    FilterInput,
    GenericModal,
    MagnifierIcon,
    TopicTypeIcon,
    QuickNavigationHighlighter,
    Reference,
  },
  mixins: [
    keyboardNavigation,
  ],
  data() {
    return {
      debouncedInput: '',
      userInput: '',
      modalStyleProps: ModalStyleProps,
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
  },
  computed: {
    childrenMap({ children }) {
      return convertChildrenArrayToObject(children);
    },
    filteredSymbols: ({
      constructFuzzyRegex,
      children,
      fuzzyMatch,
      debouncedInput,
      orderSymbolsByPriority,
    }) => {
      const symbols = children.filter(symbol => (
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
    noResultsWereFound: ({ debouncedInput, totalItemsToNavigate }) => (
      debouncedInput.length && !totalItemsToNavigate
    ),
    totalItemsToNavigate: ({ filteredSymbols }) => filteredSymbols.length,
  },
  watch: {
    userInput: 'debounceInput',
    focusedIndex: 'scrollIntoView',
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
      this.debouncedInput = value.replace(/\s/g, '');
    }, 250),
    endingPointHook() {
      // Reset selected symbol to the first one of the list
      this.focusedIndex = 0;
    },
    formatSymbolTitle(symbolTitle, symbolStart, symbolEnd) {
      return symbolTitle.slice(symbolStart, symbolEnd);
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
          uid: symbol.uid,
          title: symbol.title,
          path: symbol.path,
          parents: getParents(symbol.parent, this.childrenMap),
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
      if (
        this.noResultsWereFound
        || !this.userInput.length
      ) return;
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
      });
    },
    startingPointHook() {
      this.focusedIndex = this.totalItemsToNavigate - 1;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$base-border-width: 1px;
$filter-padding: rem(15px);

.quick-navigation {
  input[type="text"] {
    @include font-styles(body-large);
  }
  &__container {
    background-color: var(--color-fill);
    border: solid $base-border-width var(--color-fill-gray);
    border-radius: $small-border-radius + 1;
    > * {
      --input-text: var(--color-figure-gray-secondary);
    }
  }
  &__magnifier-icon-container {
    width: rem(18px);
    padding-left: rem(5px);
    > * {
      width: 100%;
    }
    &.blue .magnifier-icon {
      fill: var(--color-figure-blue);
      color: var(--color-figure-blue);
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
  &__open-key-container {
    margin-top: auto;
    margin-bottom: auto;
    margin-right: rem(15px);
    color: var(--color-figure-gray-secondary);
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
