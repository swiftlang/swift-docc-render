<template>
  <div class="quick-navigation-modal">
    <div class="container">
      <div class="close-icon" @click="$emit('toggleShowQuickNavigationModal')">
        <p>
          Close
        </p>
      </div>
      <input
        class="filter"
        v-model="userInput"
      />
      <div>
        <div v-for="(symbol, idx) in filteredSymbols" :key="idx">
          <strong>
            {{ symbol.priority }}
          </strong>
          -
          <HighlightMatches
            :text="symbol.title"
            :matcher="filterPattern"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'docc-render/utils/debounce';
import HighlightMatches from 'docc-render/components/Navigator/HighlightMatches.vue';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';

const CONSECUTIVE_CHARACTER_MATCH = 10;
const LEADING_CHARACTER_MATCH = 5;
const UPPERCASE_CHARACTER_MATCH = 3;
const MISMATCH_CHARACTER_PENALTY = 10;

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
    fuzzyRegex: ({ debouncedInput }) => new RegExp(`[${debouncedInput}]`),
    filterPattern: ({ debouncedInput }) => new RegExp(safeHighlightPattern(debouncedInput), 'i'),
    filteredSymbols: ({
      children,
      fuzzyMatch,
      debouncedInput,
      priorityOrderSymbols,
    }) => {
      const symbols = children.filter(c => (
        c.type !== 'groupMarker'
        && c.title != null
        && fuzzyMatch({ debouncedInput, symbolTitle: c.title })
      ));
      return priorityOrderSymbols({ debouncedInput, symbolsArray: symbols });
    },
  },
  props: {
    children: {
      type: Array,
      required: true,
    },
  },
  methods: {
    debounceInput: debounce(function debounceInput(value) {
      this.debouncedInput = value;
    }, 500),
    fuzzyMatch({ debouncedInput, symbolTitle }) {
      if (debouncedInput === '') { return false; }
      let inputIdx = 0;
      let symbolIdx = 0;
      while (inputIdx < debouncedInput.length && symbolIdx < symbolTitle.length) {
        if (
          debouncedInput.charAt(inputIdx).toLowerCase()
          === symbolTitle.charAt(symbolIdx).toLowerCase()
        ) {
          inputIdx += 1;
        }
        symbolIdx += 1;
      }
      if (inputIdx === debouncedInput.length) { return true; }
      return false;
    },
    priorityOrderSymbols({ debouncedInput, symbolsArray = [] }) {
      const rankedSymbols = symbolsArray;
      rankedSymbols.map((symbol, rankedSymbolIdx) => {
        let score = 0;
        // 1. Consecutive string match
        let inputIdx = 0;
        let symbolIdx = 0;
        let maxCount = 0;
        while (inputIdx < debouncedInput.length && symbolIdx < symbol.title.length) {
          let localCount = 0;
          while (
            inputIdx < debouncedInput.length
            && symbolIdx < symbol.title.length
            && debouncedInput.charAt(inputIdx).toLowerCase()
            === symbol.title.charAt(symbolIdx).toLowerCase()
          ) {
            localCount += 1;
            inputIdx += 1;
            symbolIdx += 1;
          }
          if (localCount > 1) { maxCount += localCount; }
          symbolIdx += 1;
        }
        score += CONSECUTIVE_CHARACTER_MATCH * maxCount;
        // 2. Leading character match
        if (symbol.title.charAt(0).toLowerCase() === debouncedInput.charAt(0).toLowerCase()) {
          score += LEADING_CHARACTER_MATCH;
        }
        // 3. Cammel case match
        const inputUpperCharacters = debouncedInput.match(/[A-Z]/g);
        const symbolUpperCharacters = symbol.title.match(/[A-Z]/g);
        if (inputUpperCharacters && symbolUpperCharacters) {
          const cammelCaseMatchingChars = inputUpperCharacters.filter(value => symbolUpperCharacters.match(/[A-Z]/g).includes(value));
          score += UPPERCASE_CHARACTER_MATCH * cammelCaseMatchingChars.length;
        }
        // 4. Unmatched character
        score -= Math.abs(debouncedInput.length - symbol.title.length) > MISMATCH_CHARACTER_PENALTY
          ? MISMATCH_CHARACTER_PENALTY
          : Math.abs(debouncedInput.length - symbol.title.length);
        rankedSymbols[rankedSymbolIdx].priority = score;
        return score;
      });
      // Higher priority at the top
      rankedSymbols.sort((a, b) => b.priority - a.priority);
      return rankedSymbols;
    },
  },
  mixins: [],
  watch: {
    userInput: 'debounceInput',
  },
};
</script>
<style scoped>
  .close-icon {
    padding-bottom: 10px;
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

</style>
