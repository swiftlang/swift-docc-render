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
import TutorialsNavigationList from 'docc-render/components/TutorialsOverview/TutorialsNavigationList.vue';

describe('TutorialsNavigationList', () => {
  it('renders an ol.tutorials-navigation-list', () => {
    const wrapper = shallowMount(TutorialsNavigationList, {
      slots: { default: '<li>item</li>' },
    });
    expect(wrapper.is('ol.tutorials-navigation-list')).toBe(true);
    expect(wrapper.contains('li')).toBe(true);
    expect(wrapper.text()).toBe('item');
  });
});
