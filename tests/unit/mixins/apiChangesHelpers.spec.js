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
import { APIChangesMultipleLines } from 'docc-render/mixins/apiChangesHelpers';

const createWrapper = (change = 'added') => shallowMount({
  name: 'ComponentWithAPIChanges',
  mixins: [APIChangesMultipleLines],
  template: '<div ref="apiChangesDiff"></div>',
  computed: {
    change: () => change,
  },
});

describe('apiChangesHelpers', () => {
  let wrapper;

  beforeEach(() => {
    window.getComputedStyle = jest.fn().mockReturnValue({
      lineHeight: '25px',
    });
  });

  it('set `hasMultipleLinesAfterAPIChanges` to true if apiChangesDiff ref is multiline', () => {
    wrapper = createWrapper();
    wrapper.vm.$refs = { apiChangesDiff: { offsetHeight: 100 } };

    const apiChangesDiff = wrapper.find({ ref: 'apiChangesDiff' });
    expect(apiChangesDiff.exists()).toBe(true);
    expect(wrapper.vm.hasMultipleLinesAfterAPIChanges).toBe(true);
    expect(window.getComputedStyle).toHaveBeenCalledTimes(1);
    expect(window.getComputedStyle).toHaveBeenCalledWith(wrapper.vm.$refs.apiChangesDiff);
  });

  it('set `hasMultipleLinesAfterAPIChanges` to false if apiChangesDiff ref has only one line', () => {
    wrapper = createWrapper();
    wrapper.vm.$refs = { apiChangesDiff: { offsetHeight: 25 } };

    expect(wrapper.vm.hasMultipleLinesAfterAPIChanges).toBe(false);
    expect(window.getComputedStyle).toHaveBeenCalledTimes(1);
    expect(window.getComputedStyle).toHaveBeenCalledWith(wrapper.vm.$refs.apiChangesDiff);
  });

  it('set `hasMultipleLinesAfterAPIChanges` to false if apiChangesDiff ref is multiline but API Changes it not available', () => {
    wrapper = createWrapper(null);
    wrapper.vm.$refs = { apiChangesDiff: { offsetHeight: 100 } };

    expect(wrapper.vm.hasMultipleLinesAfterAPIChanges).toBe(false);
    expect(window.getComputedStyle).toHaveBeenCalledTimes(0);
  });
});
