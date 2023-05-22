/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ConditionalWrapper from '@/components/ConditionalWrapper.vue';
import { shallowMount } from '@vue/test-utils';

describe('ConditionalWrapper', () => {
  it('renders the `ConditionalWrapper`, with the `tag`', () => {
    const wrapper = shallowMount(ConditionalWrapper, {
      context: {
        props: {
          tag: 'span',
          shouldWrap: true,
        },
        children: ['Some text'],
      },
      attrs: {
        'aria-hidden': 'true',
      },
    });
    const span = wrapper.find('span');
    expect(span.attributes('aria-hidden')).toBe('true');
    expect(wrapper.text()).toBe('Some text');
  });

  it('renders the children without the wrapping `tag`', () => {
    const Component = {
      template: `
        <div>
        <ConditionalWrapper tag="span" :shouldWrap="false">
          <em>Foo</em>
        </ConditionalWrapper>
        </div>`,
      components: { ConditionalWrapper },
    };
    const wrapper = shallowMount(Component, { stubs: { ConditionalWrapper } });
    expect(wrapper.html()).toBe('<div><em>Foo</em></div>');
  });
});
