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
import StrikeThrough from 'docc-render/components/ContentNode/StrikeThrough.vue';

describe('StrikeThrough', () => {
  it('renders an <s>', () => {
    const wrapper = shallowMount(StrikeThrough, {
      slots: { default: 'foobar' },
    });
    expect(wrapper.is('s')).toBe(true);
    expect(wrapper.text()).toBe('foobar');
  });
});
