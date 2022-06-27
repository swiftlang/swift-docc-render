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
      <div class="close-icon" @click="$emit('toggleShowQuickNavigationModal')">
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
          @click="$emit('toggleShowQuickNavigationModal')"
          :key="idx"
        >
          <router-link
            :to="symbol.path"
          >
            -
            <HighlightMatches
              :text="symbol.title"
              :matcher="fuzzyRegex"
            />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'docc-render/utils/debounce';
import HighlightMatches from 'docc-render/components/Navigator/HighlightMatches.vue';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';

export default {
  name: 'QuickNavigationModal',
  components: {
    HighlightMatches,
  },
  data() {
    return {
      userInput: '',
      debouncedInput: '',
      matchingChars: '',
    };
  },
  computed: {
    fuzzyRegex: ({
      constructFuzzyRegex,
      debouncedInput,
    }) => new RegExp(constructFuzzyRegex(debouncedInput.toLowerCase())),
    filterPattern: ({ debouncedInput }) => new RegExp(safeHighlightPattern(debouncedInput), 'i'),
    filteredSymbols: ({
      children,
      constructFuzzyRegex,
      fuzzyMatch,
      debouncedInput,
      orderSymbolsByPriority,
    }) => {
      const symbols = children.filter(c => (
        c.type !== 'groupMarker'
        && c.title != null
      ));
      if (debouncedInput) {
        const regexFuzzyBuilt = constructFuzzyRegex(debouncedInput);
        const processedInputRegex = RegExp(regexFuzzyBuilt);
        const matches = fuzzyMatch({
          debouncedInput: debouncedInput.toLowerCase(),
          symbols,
          processedInputRegex,
        });
        const priorityOrderSymbols = orderSymbolsByPriority(matches);
        return priorityOrderSymbols.slice(0, 20);
      }
      return false;
    },
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
  methods: {
    constructFuzzyRegex(userInput) {
      let regexBuilder = '';
      [...userInput].forEach((char, idx) => {
        regexBuilder += char.toLowerCase();
        if (idx !== userInput.length - 1) {
          regexBuilder += `[^${char.toLowerCase()}]*?`;
        }
      });
      return regexBuilder;
    },
    debounceInput: debounce(function debounceInput(value) {
      this.debouncedInput = value;
    }, 500),
    fuzzyMatch({ debouncedInput, symbols, processedInputRegex }) {
      const matches = [];
      symbols.map((symbol) => {
        if (debouncedInput) {
          const match = processedInputRegex.exec(symbol.title.toLowerCase());
          if (match) {
            const isExactMatch = RegExp(
              debouncedInput,
            ).test(symbol.title.toLowerCase());
            if (Math.abs(match[0].length - debouncedInput.length) > debouncedInput.length * 2) {
              return false;
            }
            matches.push({
              title: symbol.title,
              path: symbol.path,
              matchLength: match[0].length,
              start: match.index,
              matchLengthDifference: isExactMatch === true
                ? 0
                : Math.abs(match[0].length - debouncedInput.length),
              inputLengthDifference: Math.abs(
                symbol.title.length - debouncedInput.length,
              ),
            });
            return true;
          }
        }
        return false;
      });
      return matches;
    },
    orderSymbolsByPriority(matchingSymbols) {
      return matchingSymbols.sort((a, b) => {
        // Sort exact string match by symbol title length
        if (a.matchLengthDifference === 0 && b.matchLengthDifference === 0) {
          if (a.inputLengthDifference > b.inputLengthDifference) return 1;
          if (a.inputLengthDifference < b.inputLengthDifference) return -1;
        }
        // Exact string match have priority over fuzzy match
        if (a.matchLengthDifference === 0 || b.matchLengthDifference === 0) {
          if (a.matchLengthDifference > b.matchLengthDifference) return 1;
          if (a.matchLengthDifference < b.matchLengthDifference) return -1;
        }
        // Shortests symbol match title have preference over larger titles
        if (a.matchLengthDifference > b.matchLengthDifference) return 1;
        if (a.matchLengthDifference < b.matchLengthDifference) return -1;
        // Shortests symbol title have preference over larger titles
        if (a.inputLengthDifference > b.inputLengthDifference) return 1;
        if (a.inputLengthDifference < b.inputLengthDifference) return -1;
        // Matches at the beggining of string have relevance over matches at the end
        if (a.start > b.start) return 1;
        if (a.start < b.start) return -1;
        return 0;
      });
    },
  },
  mixins: [],
  watch: {
    userInput: 'debounceInput',
    showQuickNavigationModal() {
      this.userInput = '';
    },
  },
};
</script>

<style scoped>

  .close-icon {
    padding-bottom: 10px;
  }
  .container {
      flex-direction: row;
  }
  .filter {
    border-radius: 5px;
    background-color: white;
    border: solid rgb(212, 212, 212) 1px;
    padding: 20px;
    width: 80%;
    margin-bottom: 20px;
  }
  .quick-navigation-modal {
    background-color: rgb(255, 255, 255);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    padding: 100px;
    overflow: scroll;
  }
  .symbol-match {
    width: fit-content;
  }

</style>
