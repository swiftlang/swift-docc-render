/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import AppStore from 'docc-render/stores/AppStore';
import ColorScheme from 'docc-render/constants/ColorScheme';
import ImageLoadingStrategy from 'docc-render/constants/ImageLoadingStrategy';
import Settings from 'docc-render/utils/settings';

describe('AppStore', () => {
  it('has a default state', () => {
    expect(AppStore.state).toEqual({
      imageLoadingStrategy: ImageLoadingStrategy.lazy,
      preferredColorScheme: ColorScheme.light,
      supportsAutoColorScheme: false,
      systemColorScheme: ColorScheme.light,
      preferredLocale: null,
      availableLocales: [],
      firstRoutingEventHasOccurred: false,
    });
  });

  it('has correct state in IDE mode', () => {
    const originalTarget = process.env.VUE_APP_TARGET;
    process.env.VUE_APP_TARGET = 'ide';
    AppStore.reset();

    expect(AppStore.state).toEqual({
      imageLoadingStrategy: ImageLoadingStrategy.eager,
      preferredColorScheme: ColorScheme.light,
      supportsAutoColorScheme: false,
      systemColorScheme: ColorScheme.light,
      preferredLocale: null,
      availableLocales: [],
      firstRoutingEventHasOccurred: false,
    });

    // restore target
    process.env.VUE_APP_TARGET = originalTarget;
  });

  describe('setImageLoadingStrategy', () => {
    it('sets the `imageLoadingStrategy` state', () => {
      AppStore.setImageLoadingStrategy(ImageLoadingStrategy.eager);
      expect(AppStore.state.imageLoadingStrategy).toBe(ImageLoadingStrategy.eager);
    });
  });

  describe('setPreferredColorScheme', () => {
    it('sets the `preferredColorScheme` state', () => {
      AppStore.setPreferredColorScheme(ColorScheme.auto);
      expect(AppStore.state.preferredColorScheme).toBe(ColorScheme.auto);
      expect(Settings.preferredColorScheme).toBe(ColorScheme.auto);
    });
  });

  describe('setSystemColorScheme', () => {
    it('sets the `systemColorScheme` state', () => {
      AppStore.setSystemColorScheme(ColorScheme.dark);
      expect(AppStore.state.systemColorScheme).toBe(ColorScheme.dark);
    });
  });

  describe('setFirstRoutingEventHasOccurred', () => {
    it('sets the `firstRoutingEventHasOccurred` state', () => {
      AppStore.setFirstRoutingEventHasOccurred(true);
      expect(AppStore.state.firstRoutingEventHasOccurred).toBe(true);
    });
  });

  describe('syncPreferredColorScheme', () => {
    it('sets the `syncPreferredColorScheme` state', () => {
      AppStore.syncPreferredColorScheme();
      expect(AppStore.state.preferredColorScheme).toBe(Settings.preferredColorScheme);
    });
  });

  it('resets the state', () => {
    AppStore.setImageLoadingStrategy(ImageLoadingStrategy.eager);
    AppStore.setPreferredColorScheme(ColorScheme.auto);
    AppStore.setSystemColorScheme(ColorScheme.dark);
    AppStore.syncPreferredColorScheme();
    AppStore.reset();

    expect(AppStore.state).toEqual({
      imageLoadingStrategy: ImageLoadingStrategy.lazy,
      preferredColorScheme: ColorScheme.auto,
      supportsAutoColorScheme: false,
      systemColorScheme: ColorScheme.light,
      preferredLocale: null,
      availableLocales: [],
      firstRoutingEventHasOccurred: false,
    });
  });
});
