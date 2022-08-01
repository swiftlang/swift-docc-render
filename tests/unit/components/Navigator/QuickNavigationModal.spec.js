/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import QuickNavigationHighlighter from '@/components/Navigator/QuickNavigationHighlighter.vue';
import QuickNavigationModal from '@/components/Navigator/QuickNavigationModal.vue';
import Reference from '@/components/ContentNode/Reference.vue';

describe('QuickNavigationModal', () => {
  let wrapper;
  let input;

  const inputValue = 'foo';
  const symbols = [
    {
      title: 'foo',
      path: '/foo',
    },
    {
      title: 'fobaro',
      path: '/fobaro',
    },
    {
      title: 'bar',
      path: '/bar',
    },
  ];
  const filteredSymbols = [
    symbols[0],
    symbols[1],
  ];
  const config = {
    propsData: {},
    provide: {
      quickNavigationStore: {
        state: {
          showQuickNavigation: false,
          flattenIndex: symbols,
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(QuickNavigationModal, config);
    input = wrapper.find({ ref: 'input' });
  });

  it('it renders the Quick navigation modal', () => {
    expect(input.exists()).toBe(true);
    expect(wrapper.classes('quick-navigation-modal')).toBe(true);
  });

  it('it adds text to the input', async () => {
    const textInput = wrapper.find('input');
    await textInput.setValue(inputValue);
    expect(wrapper.find('input').element.value).toBe(inputValue);
  });

  it('it filters the symbols on user input', async () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    await wrapper.vm.$nextTick();
    const matches = wrapper.vm.filteredSymbols;
    expect(matches).toHaveLength(filteredSymbols.length);
    expect(matches.at(0)).toMatchObject(filteredSymbols[0]);
    expect(matches.at(1)).toMatchObject(filteredSymbols[1]);
    expect(wrapper.findAll(QuickNavigationHighlighter).length).toBe(2);
    expect(wrapper.findAll(Reference).at(0).props().url).toBe(filteredSymbols[0].path);
    expect(wrapper.findAll(Reference).at(1).props().url).toBe(filteredSymbols[1].path);
  });
});
