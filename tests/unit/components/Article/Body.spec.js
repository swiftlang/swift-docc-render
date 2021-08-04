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
import Body from 'docc-render/components/Article/Body.vue';

describe('Body', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Body, { propsData: { content: [] } });
  });

  it('renders a div.body wrapper', () => {
    expect(wrapper.is('div.body')).toBe(true);
  });

  it('renders a `BodyContent`', () => {
    const { BodyContent } = Body.components;
    expect(wrapper.contains(BodyContent)).toBe(true);
  });
});
