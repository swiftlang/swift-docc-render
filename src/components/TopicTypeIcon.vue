<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="TopicTypeIcon"
    :class="{ 'navigator-icon': true, 'colorful-navigator-icon': shouldUseColorfulIcons && hasSymbolText }"
    :style="styles"
    :data-color-variant="colorVariant"
    :data-symbol-text="symbolText"
  >
    <OverridableAsset
      v-if="imageOverride"
      :imageOverride="imageOverride"
      :shouldCalculateOptimalWidth="shouldCalculateOptimalWidth"
      class="icon-inline"
    />
    <component
      v-else
      :is="icon"
      v-bind="iconProps"
      class="icon-inline"
    />
  </div>
</template>

<script>
import PathIcon from 'theme/components/Icons/PathIcon.vue';
import TechnologyIcon from 'theme/components/Icons/TechnologyIcon.vue';
import ArticleIcon from 'theme/components/Icons/ArticleIcon.vue';
import TutorialIcon from 'theme/components/Icons/TutorialIcon.vue';
import TopicFuncIcon from 'theme/components/Icons/TopicFuncIcon.vue';
import CollectionIcon from 'theme/components/Icons/CollectionIcon.vue';
import TopicFuncOpIcon from 'theme/components/Icons/TopicFuncOpIcon.vue';
import CurlyBracketsIcon from 'theme/components/Icons/CurlyBracketsIcon.vue';
import TopicSubscriptIcon from 'theme/components/Icons/TopicSubscriptIcon.vue';
import TwoLetterSymbolIcon from 'theme/components/Icons/TwoLetterSymbolIcon.vue';
import SingleLetterSymbolIcon from 'theme/components/Icons/SingleLetterSymbolIcon.vue';
import { TopicTypes, TopicTypeAliases } from 'docc-render/constants/TopicTypes';
import { HeroColorsMap } from 'docc-render/constants/HeroColors';
import SVGIcon from 'docc-render/components/SVGIcon.vue';
import OverridableAsset from 'docc-render/components/OverridableAsset.vue';

const TopicTypeIcons = {
  [TopicTypes.article]: ArticleIcon,
  [TopicTypes.associatedtype]: CollectionIcon,
  [TopicTypes.buildSetting]: CollectionIcon,
  [TopicTypes.class]: SingleLetterSymbolIcon,
  [TopicTypes.collection]: CollectionIcon,
  [TopicTypes.dictionarySymbol]: SingleLetterSymbolIcon,
  [TopicTypes.container]: CollectionIcon,
  [TopicTypes.enum]: SingleLetterSymbolIcon,
  [TopicTypes.extension]: TwoLetterSymbolIcon,
  [TopicTypes.func]: TopicFuncIcon,
  [TopicTypes.op]: TopicFuncOpIcon,
  [TopicTypes.httpRequest]: SingleLetterSymbolIcon,
  [TopicTypes.languageGroup]: CollectionIcon,
  [TopicTypes.learn]: PathIcon,
  [TopicTypes.method]: SingleLetterSymbolIcon,
  [TopicTypes.macro]: SingleLetterSymbolIcon,
  [TopicTypes.module]: TechnologyIcon,
  [TopicTypes.namespace]: SingleLetterSymbolIcon,
  [TopicTypes.overview]: PathIcon,
  [TopicTypes.protocol]: TwoLetterSymbolIcon,
  [TopicTypes.property]: SingleLetterSymbolIcon,
  [TopicTypes.propertyListKey]: SingleLetterSymbolIcon,
  [TopicTypes.resources]: PathIcon,
  [TopicTypes.sampleCode]: CurlyBracketsIcon,
  [TopicTypes.struct]: SingleLetterSymbolIcon,
  [TopicTypes.subscript]: TopicSubscriptIcon,
  [TopicTypes.symbol]: CollectionIcon,
  [TopicTypes.tutorial]: TutorialIcon,
  [TopicTypes.typealias]: SingleLetterSymbolIcon,
  [TopicTypes.union]: SingleLetterSymbolIcon,
  [TopicTypes.var]: SingleLetterSymbolIcon,
};

const TopicTypeProps = {
  [TopicTypes.class]: { symbol: 'C' },
  [TopicTypes.dictionarySymbol]: { symbol: 'O' },
  [TopicTypes.enum]: { symbol: 'E' },
  [TopicTypes.extension]: { first: 'E', second: 'x' },
  [TopicTypes.httpRequest]: { symbol: 'E' },
  [TopicTypes.method]: { symbol: 'M' },
  [TopicTypes.macro]: { symbol: '#' },
  [TopicTypes.namespace]: { symbol: 'N' },
  [TopicTypes.protocol]: { first: 'P', second: 'r' },
  [TopicTypes.property]: { symbol: 'P' },
  [TopicTypes.propertyListKey]: { symbol: 'K' },
  [TopicTypes.struct]: { symbol: 'S' },
  [TopicTypes.typealias]: { symbol: 'T' },
  [TopicTypes.union]: { symbol: 'U' },
  [TopicTypes.var]: { symbol: 'V' },
};

export default {
  name: 'TopicTypeIcon',
  components: { OverridableAsset, SVGIcon, SingleLetterSymbolIcon },
  constants: { TopicTypeIcons, TopicTypeProps },
  props: {
    type: {
      type: String,
      required: true,
    },
    withColors: {
      type: Boolean,
      default: false,
    },
    enableColorfulIcons: {
      type: Boolean,
      default: true,
    },
    imageOverride: {
      type: Object,
      default: null,
    },
    shouldCalculateOptimalWidth: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    normalisedType: ({ type }) => TopicTypeAliases[type] || type,
    icon: ({ normalisedType }) => TopicTypeIcons[normalisedType] || CollectionIcon,
    iconProps: ({ normalisedType }) => TopicTypeProps[normalisedType] || {},
    color: ({ normalisedType }) => HeroColorsMap[normalisedType],
    shouldUseColorfulIcons() {
      return this.enableColorfulIcons;
    },
    /**
     * Returns the symbol text to display in colorful icon mode.
     * Only symbols with explicit text definitions (from TopicTypeProps) are colorized.
     * Decorative icons (articles, collections, etc.) remain unchanged.
     */
    symbolText() {
      if (!this.shouldUseColorfulIcons) return null;

      const props = this.iconProps;
      if (props.symbol) {
        return props.symbol;
      }
      if (props.first && props.second) {
        return props.first + props.second;
      }

      return '';
    },
    hasSymbolText() {
      return this.symbolText && this.symbolText.length > 0;
    },
    /**
     * Determines the background color variant based on the symbol text.
     * Color mapping follows Apple's SF Symbols conventions.
     */
    colorVariant() {
      if (!this.shouldUseColorfulIcons || !this.hasSymbolText) return null;

      const text = this.symbolText.toUpperCase();

      // Purple: Structures, Classes, Protocols
      if (['S', 'C', 'PR'].includes(text)) return 'purple';

      // Blue: Methods
      if (text === 'M') return 'blue';

      // Mint: Properties
      if (text === 'P') return 'mint';

      // Orange: Types, Enums
      if (['T', 'E'].includes(text)) return 'orange';

      // Red: Macros
      if (text === '#') return 'red';

      // Green: Default
      return 'green';
    },
    styles: ({
      color,
      withColors,
    }) => (withColors && color ? { '--icon-color': `var(--color-type-icon-${color})` } : {}),
  },
};
</script>

<style lang='scss'>
@import 'docc-render/styles/_core.scss';

/**
 * Colorful Navigator Icons
 *
 * Provides colorful, rounded icon badges for symbol types in the navigator.
 * Inspired by Xcode's documentation rendering and SF Symbols design language.
 *
 * Features:
 * - System font fallback for SF Pro Rounded
 * - Color variants based on symbol type (purple, blue, mint, orange, red, green)
 * - Automatic light/dark mode color adjustment
 * - Only applied to symbols with text (classes, structs, methods, etc.)
 * - Decorative icons (articles, collections) remain unchanged
 */

// System font with SF Pro Rounded fallback
@font-face {
  font-family: 'SF Pro Rounded';
  src: local('SF Pro Rounded'), local('SF Pro Display');
  font-weight: bold;
  font-style: normal;
}

// Color palette for colorful icons
:root {
  // Light mode colors
  --systemOrange-light: #ff9500;
  --systemPurple-light: #cc54da;
  --systemBlue-light: #0f7dfa;
  --systemMint-light: #00c1d9;
  --systemRed-light: #ec4425;
  --systemGreen-light: #34c759;

  // Dark mode colors
  --systemOrange-dark: #ff9f0a;
  --systemPurple-dark: #bf5af2;
  --systemBlue-dark: #0a84ff;
  --systemMint-dark: #27c7d6;
  --systemRed-dark: #ff453a;
  --systemGreen-dark: #30d158;

  // Active colors (default to light mode)
  --systemOrange: var(--systemOrange-light);
  --systemPurple: var(--systemPurple-light);
  --systemBlue: var(--systemBlue-light);
  --systemMint: var(--systemMint-light);
  --systemRed: var(--systemRed-light);
  --systemGreen: var(--systemGreen-light);
}

// Switch to dark mode colors
@media (prefers-color-scheme: dark) {
  :root {
    --systemOrange: var(--systemOrange-dark);
    --systemPurple: var(--systemPurple-dark);
    --systemBlue: var(--systemBlue-dark);
    --systemMint: var(--systemMint-dark);
    --systemRed: var(--systemRed-dark);
    --systemGreen: var(--systemGreen-dark);
  }
}
</style>

<style scoped lang='scss'>

.TopicTypeIcon {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  color: var(--icon-color, var(--color-figure-gray-secondary));

  :deep(picture) {
    flex: 1;
  }

  svg, :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  /**
   * Colorful icon badge styling
   * Applied only to symbols with text (classes, structs, methods, etc.)
   */
  &.colorful-navigator-icon {
    width: 18px;
    min-width: 18px;
    height: 18px;
    padding: 2px 4px;
    border-radius: 4px;
    background-color: var(--systemGreen);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    vertical-align: middle;

    font-family: 'SF Pro Rounded', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-weight: 700;
    font-size: 12px;
    line-height: 1;
    color: white;

    // Hide the original SVG icon
    svg {
      display: none;
    }

    // Display symbol text via pseudo-element
    &::after {
      content: attr(data-symbol-text);
    }

    // Color variants based on symbol type
    &[data-color-variant="purple"] { background-color: var(--systemPurple); }
    &[data-color-variant="blue"]   { background-color: var(--systemBlue); }
    &[data-color-variant="mint"]   { background-color: var(--systemMint); }
    &[data-color-variant="orange"] { background-color: var(--systemOrange); }
    &[data-color-variant="red"]    { background-color: var(--systemRed); }
    &[data-color-variant="green"]  { background-color: var(--systemGreen); }
  }
}
</style>
