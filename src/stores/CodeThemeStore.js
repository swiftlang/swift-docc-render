/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  state: {
    codeColors: null,
  },
  reset() {
    this.state.codeColors = null;
  },
  updateCodeColors(value) {
    const rgbaValue = (color) => {
      if (!color) {
        return null;
      }
      return `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
    };

    // Map colors to RGBA values.
    this.state.codeColors = Object.entries(value).reduce((colors, [key, color]) => ({
      ...colors,
      [key]: rgbaValue(color),
    }), {});
  },
};
