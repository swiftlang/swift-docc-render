/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ColorScheme from 'docc-render/constants/ColorScheme';
import ImageLoadingStrategy from 'docc-render/constants/ImageLoadingStrategy';
import Settings from 'docc-render/utils/settings';
import appLocales from 'theme/lang/locales.json';

const supportsAutoColorScheme = (typeof window.matchMedia !== 'undefined') && [
  ColorScheme.light,
  ColorScheme.dark,
  'no-preference',
].some(scheme => window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches);

const defaultColorScheme = supportsAutoColorScheme ? ColorScheme.auto : ColorScheme.light;

export default {
  state: {
    imageLoadingStrategy: process.env.VUE_APP_TARGET === 'ide'
      ? ImageLoadingStrategy.eager : ImageLoadingStrategy.lazy,
    preferredColorScheme: Settings.preferredColorScheme || defaultColorScheme,
    preferredLocale: Settings.preferredLocale,
    supportsAutoColorScheme,
    systemColorScheme: ColorScheme.light,
    availableLocales: [],
  },
  reset() {
    this.state.imageLoadingStrategy = process.env.VUE_APP_TARGET === 'ide'
      ? ImageLoadingStrategy.eager : ImageLoadingStrategy.lazy;
    this.state.preferredColorScheme = Settings.preferredColorScheme || defaultColorScheme;
    this.state.supportsAutoColorScheme = supportsAutoColorScheme;
    this.state.systemColorScheme = ColorScheme.light;
  },
  setImageLoadingStrategy(strategy) {
    this.state.imageLoadingStrategy = strategy;
  },
  setPreferredColorScheme(value) {
    this.state.preferredColorScheme = value;
    Settings.preferredColorScheme = value;
  },
  setAllLocalesAreAvailable() {
    const allLocales = appLocales.map(locale => locale.code);
    this.state.availableLocales = allLocales;
  },
  setAvailableLocales(locales = []) {
    this.state.availableLocales = locales;
  },
  setPreferredLocale(locale) {
    this.state.preferredLocale = locale;
    Settings.preferredLocale = this.state.preferredLocale;
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
