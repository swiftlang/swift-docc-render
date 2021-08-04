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
import CallToAction from 'docc-render/components/Tutorial/CallToAction.vue';

describe('CallToAction', () => {
  const { BaseCTA } = CallToAction.components;

  const propsData = {
    title: 'Fooing the bar',
    abstract: [],
    action: {},
    media: 'foo.bar',
  };

  it('renders a `BaseCTA` with the "Next" label', () => {
    const wrapper = shallowMount(CallToAction, { propsData });

    const cta = wrapper.find(BaseCTA);
    expect(cta.exists()).toBe(true);
    expect(cta.props()).toEqual(propsData);
    expect(cta.attributes('label')).toBe('Next');
  });
});
