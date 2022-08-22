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
import QuickNavigationBar from '@/components/QuickNavigationBar.vue';

describe('QuickNavigationBar', () => {
  let wrapper;

  const mocks = {};

  const config = {
    mocks,
    provide: {
      quickNavigationStore: {
        toggleShowQuickNavigationModal: () => true,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(QuickNavigationBar, config);
  });

  it('it opens the Quick Navigation modal on click', async () => {
    const openQuickNavigationModal = jest.spyOn(wrapper.vm, 'openQuickNavigationModal');
    await wrapper.find('.quick-navigation-bar').trigger('click');
    expect(openQuickNavigationModal).toHaveBeenCalled();
  });
});
