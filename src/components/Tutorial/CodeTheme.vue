<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div :style="codeStyle">
    <slot />
  </div>
</template>

<script>
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';

const MinLightness = 0;
const MaxLightness = 255;

// parses a CSS "rgba(...)" string into an object with integer rgb values and a
// float alpha value
function getRGBA(rgbaString) {
  const match = rgbaString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+\.?\d*|\.\d+)\s*\)/);
  if (!match) {
    throw new Error('invalid rgba() input');
  }

  const decimalRadix = 10;
  return {
    r: parseInt(match[1], decimalRadix),
    g: parseInt(match[2], decimalRadix),
    b: parseInt(match[3], decimalRadix),
    a: parseFloat(match[4]),
  };
}

function relativeLuminance(rgbaString) {
  const { r, g, b } = getRGBA(rgbaString);
  // https://en.wikipedia.org/wiki/Relative_luminance#Relative_luminance_in_colorimetric_spaces
  return (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
}

// returns a CSS "rgba(...)" string with the input adjusted to be lighter by a
// given percentage (or darker given a negative percentage)
function adjustLightness(rgbaString, percentage) {
  const lightness = Math.round(MaxLightness * percentage);
  const color = getRGBA(rgbaString);

  const { a } = color;
  const [r, g, b] = [color.r, color.g, color.b].map(n => (
    Math.max(MinLightness, Math.min(MaxLightness, n + lightness))
  ));

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function lighten(rgbaString, percentage) {
  return adjustLightness(rgbaString, percentage);
}

function darken(rgbaString, percentage) {
  return adjustLightness(rgbaString, percentage * -1);
}

export default {
  name: 'CodeTheme',
  data() {
    return {
      codeThemeState: CodeThemeStore.state,
    };
  },
  computed: {
    codeStyle() {
      const { codeColors } = this.codeThemeState;

      if (!codeColors) {
        return null;
      }

      return {
        '--text': codeColors.text,
        '--background': codeColors.background,
        '--line-highlight': codeColors.lineHighlight,
        '--url': codeColors.commentURL,
        '--syntax-comment': codeColors.comment,
        '--syntax-quote': codeColors.comment,
        '--syntax-keyword': codeColors.keyword,
        '--syntax-literal': codeColors.keyword,
        '--syntax-selector-tag': codeColors.keyword,
        '--syntax-string': codeColors.stringLiteral,
        '--syntax-bullet': codeColors.stringLiteral,
        '--syntax-meta': codeColors.keyword,
        '--syntax-number': codeColors.stringLiteral,
        '--syntax-symbol': codeColors.stringLiteral,
        '--syntax-tag': codeColors.stringLiteral,
        '--syntax-attr': codeColors.typeAnnotation,
        '--syntax-built_in': codeColors.typeAnnotation,
        '--syntax-builtin-name': codeColors.typeAnnotation,
        '--syntax-class': codeColors.typeAnnotation,
        '--syntax-params': codeColors.typeAnnotation,
        '--syntax-section': codeColors.typeAnnotation,
        '--syntax-title': codeColors.typeAnnotation,
        '--syntax-type': codeColors.typeAnnotation,
        '--syntax-attribute': codeColors.keyword,
        '--syntax-identifier': codeColors.text,
        '--syntax-subst': codeColors.text,
        '--color-syntax-param-internal-name': this.internalParamNameColor,
      };
    },
    internalParamNameColor() {
      const {
        background: bgColor,
        text: textColor,
      } = this.codeThemeState.codeColors;
      try {
        // if the background color is closer to black, darken the text color by
        // 25%, otherwise if the background color is closer to white, lighten
        // the text color by 25%
        const bgLuminance = relativeLuminance(bgColor);
        const adjust = bgLuminance < (MaxLightness / 2) ? darken : lighten;

        const percentage = 0.25;
        return adjust(textColor, percentage);
      } catch {
        return textColor;
      }
    },
  },
};

</script>
