/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import OnThisPageStickyContainer from '@/components/DocumentationTopic/OnThisPageStickyContainer.vue';
import { shallowMount } from '@vue/test-utils';

const createWrapper = ({ ...opts } = {}) => shallowMount(OnThisPageStickyContainer, {
  slots: {
    default: '<div class="default">Default Content</div>',
  },
  ...opts,
});

describe('OnThisPageStickyContainer', () => {
  it('renders the default slot', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.default').text()).toBe('Default Content');
  });

  it('adds an "ide" class for IDE targets', () => {
    let wrapper = createWrapper();
    expect(wrapper.classes('ide')).toBe(false);

    wrapper = createWrapper({
      provide: {
        isTargetIDE: true,
      },
    });
    expect(wrapper.classes('ide')).toBe(true);
  });
});
