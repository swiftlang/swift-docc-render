<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="quick-navigation-modal">
    <div class="container">
      <div
        class="close-icon"
        @click="closeQuickNavigationModal()"
      >
        <p>
          Close
        </p>
      </div>
      <input
        ref="input"
        class="filter"
        v-model="userInput"
        type="text"
      />
      <div>
        <div
          v-for="(symbol, idx) in filteredSymbols"
          class="symbol-match"
          @click="closeQuickNavigationModal()"
          :key="idx"
        >
          <Reference :url="symbol.path" :id="idx">
            <span>
              -
              {{ symbol.title.slice(0, symbol.start) }}
            </span>
            <QuickNavigationHighlighter
              :text="symbol.substring"
              :matcherText="debouncedInput"
            />
            <span>
              {{ symbol.title.slice(symbol.start + symbol.matchLength) }}
            </span>
          </Reference>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'docc-render/utils/debounce';
import QuickNavigationHighlighter from 'docc-render/components/Navigator/QuickNavigationHighlighter.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';

export default {
  name: 'QuickNavigationModal',
  components: {
    QuickNavigationHighlighter,
    Reference,
  },
  inject: ['quickNavigationStore'],
  data() {
    return {
      debouncedInput: '',
      quickNavigationStore: this.quickNavigationStore,
      userInput: '',
    };
  },
  computed: {
    filteredSymbols: ({
      flattenIndex,
      constructFuzzyRegex,
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
  },
  methods: {
    closeQuickNavigationModal() {
      this.quickNavigationStore.toggleShowQuickNavigationModal();
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
        const match = processedInputRegex.exec(symbol.title.toLowerCase());
        // Dismiss if symbol isn't matched
        if (!match) return false;

        const matchLength = match[0].length;
        const inputLength = debouncedInput.length;
        // Dismiss if match length is greater than 3x the input's length
        if (matchLength > inputLength * 3) return false;

        return ({
          title: symbol.title,
          path: symbol.path,
          inputLengthDifference: symbol.title.length - inputLength,
          matchLength,
          matchLengthDifference: matchLength - inputLength,
          start: match.index,
          substring: match[0],
        });
      }).filter(Boolean)
    ),
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
  watch: {
    userInput: 'debounceInput',
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

  .close-icon {
    padding-bottom: 10px;
  }
  .container {
      flex-direction: row;
  }
  .filter {
    border-radius: $border-radius;
    background-color: var(--color-fill);
    border: solid var(--color-figure-gray) 1px;
    padding: 20px;
    width: 80%;
    margin-bottom: 20px;
  }
  .quick-navigation-modal {
    background-color: var(--color-fill);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 100px;
    overflow: scroll;
  }
  .symbol-match {
    width: fit-content;
  }

</style>
