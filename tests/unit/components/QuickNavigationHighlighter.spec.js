/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import QuickNavigationHighlighter from '@/components/Navigator/QuickNavigationHighlighter.vue';

describe('QuickNavigationHighlighter', () => {
  const defaultProps = {
    text: 'Some String to Match',
    matcherText: 'ssoh',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('it renders the HighlightMatches', () => {
    const wrapper = shallowMount(QuickNavigationHighlighter, {
      propsData: {
        text: defaultProps.text,
        matcherText: defaultProps.matcherText,
      },
    });
    expect(wrapper.html())
      .toEqual('<p class="highlight"><span class="match">S</span><span>ome </span><span class="match">S</span><span>tring t</span><span class="match">o</span><span> Matc</span><span class="match">h</span></p>');
  });

  it('it renders the text, when no matcher provided', () => {
    const wrapper = shallowMount(QuickNavigationHighlighter, {
      propsData: {
        text: defaultProps.text,
      },
    });
    expect(wrapper.html())
      .toEqual(`<span class="highlight">${defaultProps.text}</span>`);
  });
});
