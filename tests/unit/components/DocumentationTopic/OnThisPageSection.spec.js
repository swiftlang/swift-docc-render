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
import OnThisPageSection from 'docc-render/components/DocumentationTopic/OnThisPageSection.vue';

describe('OnThisPageSection', () => {
  let wrapper;

  const propsData = {
    anchor: 'foo',
    title: 'Foo',
  };

  const provide = {
    store: { addOnThisPageSection: jest.fn() },
  };

  const slots = { default: '<p>bar</p>' };

  beforeEach(() => {
    wrapper = shallowMount(OnThisPageSection, {
      propsData,
      provide,
      slots,
    });
  });

  it('renders a <section> with an id attribute', () => {
    expect(wrapper.is('section')).toBe(true);
    expect(wrapper.attributes('id')).toBe(propsData.anchor);
  });

  it('renders slot content', () => {
    const content = wrapper.find('p');
    expect(content.exists()).toBe(true);
    expect(content.html()).toBe(slots.default);
  });

  it('calls `store.addOnThisPageSection` on created', () => {
    expect(provide.store.addOnThisPageSection).toBeCalled();
  });
});
