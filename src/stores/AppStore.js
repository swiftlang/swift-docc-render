/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ColorScheme from 'docc-render/constants/ColorScheme';
import Settings from 'docc-render/utils/settings';

const supportsAutoColorScheme = (typeof window.matchMedia !== 'undefined') && [
  ColorScheme.light.value,
  ColorScheme.dark.value,
  'no-preference',
].some(scheme => window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches);

const defaultColorScheme = supportsAutoColorScheme ? ColorScheme.auto : ColorScheme.light;

export default {
  state: {
    preferredColorScheme: Settings.preferredColorScheme || defaultColorScheme.value,
    supportsAutoColorScheme,
    systemColorScheme: ColorScheme.light.value,
  },
  setPreferredColorScheme(value) {
    this.state.preferredColorScheme = value;
    Settings.preferredColorScheme = value;
  },
  setSystemColorScheme(value) {
    this.state.systemColorScheme = value;
  },
  syncPreferredColorScheme() {
    if (!!Settings.preferredColorScheme
      && Settings.preferredColorScheme !== this.state.preferredColorScheme) {
      this.state.preferredColorScheme = Settings.preferredColorScheme;
    }
  },
};
