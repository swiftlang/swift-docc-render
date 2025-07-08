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
import AssessmentsProgress from 'docc-render/components/Tutorial/AssessmentsProgress.vue';

describe('AssessmentsProgress', () => {
  const wrapper = shallowMount(AssessmentsProgress, {
    propsData: {
      index: 1,
      total: 3,
    },
  });

  it('renders index/total in a p tag', () => {
    const title = wrapper.findComponent('p.title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('tutorials.question-of 1 3');
  });
});
