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
import CodeVoice from 'docc-render/components/ContentNode/CodeVoice.vue';

describe('CodeVoice', () => {
  const { WordBreak } = CodeVoice.components;

  it('renders a <WordBreak> with a <code> tag', () => {
    const wrapper = shallowMount(CodeVoice, {
      slots: { default: 'fooBar' },
    });
    const wordBreak = wrapper.find(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('code');
    expect(wordBreak.text()).toBe('fooBar');
  });
});
