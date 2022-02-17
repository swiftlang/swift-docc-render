/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import HighlightMatches from '@/components/Navigator/HighlightMatches.vue';
import { shallowMount } from '@vue/test-utils';

const defaultProps = {
  text: 'Some String to Match',
  matcher: /me\sstring/gi,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(HighlightMatches, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('HighlightMatches', () => {
  it('renders the HighlightMatches', () => {
    const wrapper = createWrapper();
    expect(wrapper.html())
      .toEqual('<p class="highlight"><span>So</span><span class="match">me String</span><span> to Match</span></p>');
  });

  it('renders the text, when no matcher provided', () => {
    const wrapper = createWrapper({
      propsData: {
        matcher: undefined,
      },
    });
    expect(wrapper.html())
      .toEqual(`<p class="highlight">${defaultProps.text}</p>`);
  });

  it('wraps multiple matches', () => {
    const wrapper = createWrapper({
      propsData: {
        matcher: /app/gi,
        text: 'apples apps appointments',
      },
    });
    expect(wrapper.html())
      .toEqual('<p class="highlight"><span class="match">app</span><span>les </span><span class="match">app</span><span>s </span><span class="match">app</span><span>ointments</span></p>');
  });
});
