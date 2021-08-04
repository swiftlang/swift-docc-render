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
import ButtonLink from 'docc-render/components/ButtonLink.vue';

const { Reference } = ButtonLink.components;

describe('ButtonLink', () => {
  const propsData = {
    url: 'foo.com',
  };

  const propsDataWithoutUrl = {
    title: 'Foo',
  };

  const slotValue = 'SlotFoo';

  it('renders a `Reference` with "button-cta" classes if there is url on props', () => {
    const wrapper = shallowMount(ButtonLink, {
      propsData,
      slots: {
        default: slotValue,
      },
    });

    const ref = wrapper.find(Reference);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe(propsData.url);
    expect(ref.classes('button-cta')).toBe(true);
    expect(ref.classes('is-dark')).toBe(false);
    expect(ref.text()).toBe(slotValue);
  });

  it('renders a button with "button-cta" classes if there is url on props', () => {
    const wrapper = shallowMount(ButtonLink, {
      propsData: propsDataWithoutUrl,
      slots: {
        default: slotValue,
      },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.classes('button-cta')).toBe(true);
    expect(button.text()).toBe(slotValue);
  });

  it('renders a dark button', () => {
    const wrapper = shallowMount(ButtonLink, {
      propsData: {
        ...propsData,
        isDark: true,
      },
    });
    expect(wrapper.classes()).toContain('is-dark');
  });
});
