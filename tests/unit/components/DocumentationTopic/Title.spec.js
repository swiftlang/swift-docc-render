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
import Title from 'docc-render/components/DocumentationTopic/Title.vue';

describe('Title', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Title, {
      slots: {
        default: 'FooKit',
      },
    });
  });

  it('renders a div.topictitle', () => {
    expect(wrapper.is('div.topictitle')).toBe(true);
  });

  it('renders an eyebrow if provided', () => {
    expect(wrapper.contains('.eyebrow')).toBe(false);

    wrapper.setProps({ eyebrow: 'Thing' });

    const eyebrow = wrapper.find('.eyebrow');
    expect(eyebrow.exists()).toBe(true);
    expect(eyebrow.text()).toBe('Thing');
  });

  it('renders <h1> tag for the default slot', () => {
    const h1 = wrapper.find('h1');
    expect(h1.classes('title')).toBe(true);
    expect(h1.text()).toBe('FooKit');
  });
});
