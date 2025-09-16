/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import MobileCodePreviewToggle from 'docc-render/components/Tutorial/MobileCodePreviewToggle.vue';

const mount = isActionable => (
  shallowMount(MobileCodePreviewToggle, {
    propsData: {
      isActionable,
    },
  })
);

describe('MobileCodePreviewToggle', () => {
  it('renders a span when `isActionable=false`', () => {
    const wrapper = mount(false);

    const span = wrapper.findComponent('span');
    expect(span.exists()).toBe(true);
    expect(span.text()).toBe('tutorials.preview.title');
  });

  it('renders an anchor when `isActionable=true` and emits an event when clicked', () => {
    const wrapper = mount(true);

    const link = wrapper.findComponent('a');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe('tutorials.preview.title');

    link.trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();
  });
});
