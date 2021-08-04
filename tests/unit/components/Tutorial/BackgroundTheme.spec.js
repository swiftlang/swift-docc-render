/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';
import BackgroundTheme from 'docc-render/components/Tutorial/BackgroundTheme.vue';

describe('BackgroundTheme', () => {
  const colors = {
    background: 'backgroundColor',
  };

  beforeEach(() => {
    CodeThemeStore.state.codeColors = colors;
  });

  afterEach(() => {
    CodeThemeStore.reset();
  });

  it('sets CSS variables for each color', () => {
    const wrapper = shallowMount(BackgroundTheme);
    expect(wrapper.vm.backgroundStyle['--background']).toBe(colors.background);
  });
});
