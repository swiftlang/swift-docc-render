/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NotFound from 'docc-render/views/NotFound.vue';
import { shallowMount } from '@vue/test-utils';

const { GenericError } = NotFound.components;

describe('NotFound', () => {
  it('renders a `GenericError` with a custom message', () => {
    const wrapper = shallowMount(NotFound);
    const error = wrapper.find(GenericError);
    expect(error.exists()).toBe(true);
    expect(error.props('message')).toBe('The page you’re looking for can’t be found.');
  });

  it('exposes a default slot', () => {
    const wrapper = shallowMount(NotFound, {
      slots: {
        default: '<div class="default">Default Content</div>',
      },
    });
    expect(wrapper.find('.default').text()).toBe('Default Content');
  });
});
