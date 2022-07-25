/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { mount, shallowMount } from '@vue/test-utils';
import DocumentationTopic from '@/views/DocumentationTopic.vue';
import FilterInput from '@/components/Filter/FilterInput.vue';
import NavigatorLeafIcon from '@/components/Navigator/NavigatorLeafIcon.vue';
import QuickNavigationHighlighter from '@/components/Navigator/QuickNavigationHighlighter.vue';
import QuickNavigationModal from '@/components/Navigator/QuickNavigationModal.vue';
import Reference from '@/components/ContentNode/Reference.vue';

jest.mock('docc-render/utils/theme-settings', () => ({
  getSetting: () => true,
}));

describe('QuickNavigationModal', () => {
  let wrapper;
  let input;

  const inputValue = 'foo';
  const nonResultsInputValue = 'xyz';
  const mocks = {
    $bridge: {
      on: jest.fn(),
      off: jest.fn(),
      send: jest.fn(),
    },
    $route: {
      path: '/documentation/somepath',
    },
  };
  const symbols = [
    {
      title: 'foo',
      path: '/foo',
      type: 'protocol',
    },
    {
      title: 'fobaro',
      path: '/foo/bar/foobar/fobaro',
      relativePath: 'foobar',
      type: 'method',
    },
    {
      title: 'bar',
      path: '/bar',
      type: 'init',
    },
    {
      title: 'barfbarobarobar',
      path: '/barfbarobarobar',
      type: 'init',
    },
  ];
  const filteredSymbols = [
    symbols[0],
    symbols[1],
    symbols[3],
  ];
  const symbolsMatchBlueprint = [
    {
      input: inputValue,
      title: symbols[0].title,
      subMatchString: 'foo',
    },
    {
      input: inputValue,
      title: symbols[1].title,
      subMatchString: 'fobaro',
    },
    {
      input: inputValue,
      title: symbols[2].title,
      subMatchString: '',
    },
    {
      input: inputValue,
      title: symbols[3].title,
      subMatchString: 'fbarobaro',
    },
  ];
  const config = {
    mocks,
    propsData: {
      isModalOpen: false,
    },
    provide: {
      quickNavigationStore: {
        state: {
          enableQuickNavigation: true,
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
    expect(wrapper.classes('quick-navigation')).toBe(true);
  });

  it('it adds text to the input', async () => {
    await input.setValue(inputValue);
    expect(input.element.value).toBe(inputValue);
  });

  it('it filters the symbols according to debouncedInput value', async () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    await wrapper.vm.$nextTick();
    const matches = wrapper.vm.filteredSymbols;
    expect(matches).toHaveLength(filteredSymbols.length);
    expect(matches.at(0)).toMatchObject(filteredSymbols[0]);
    expect(matches.at(1)).toMatchObject(filteredSymbols[1]);
    expect(wrapper.findAll(QuickNavigationHighlighter).length).toBe(filteredSymbols.length);
  });

  it('it opens modal on `filter__quick-navigation-icon` click', async () => {
    const filterInputWrapper = shallowMount(FilterInput, config);
    const documentationTopic = mount(DocumentationTopic, config);
    const openQuickNavigationModal = jest.spyOn(filterInputWrapper.vm, 'openQuickNavigationModal');
    expect(filterInputWrapper.find('.filter__quick-navigation-container').exists()).toBe(true);
    await filterInputWrapper.find('.filter__quick-navigation-container').trigger('click');
    expect(openQuickNavigationModal).toHaveBeenCalled();
    expect(documentationTopic.find('.quick-navigation').exists()).toBe(true);
  });

  it('it renders the modal shadow', () => {
    expect(wrapper.find('.quick-navigation__modal-shadow').exists()).toBe(true);
  });

  it('it renders the filter input', () => {
    expect(input.exists()).toBe(true);
  });

  it('it does not render the clear input x icon when user input exists', () => {
    expect(wrapper.find('.quick-navigation__clear-icon').exists()).toBe(false);
  });

  it('it renders the clear input x icon when user input exists', () => {
    input.setValue(inputValue);
    expect(wrapper.find('.quick-navigation__clear-icon').exists()).toBe(true);
  });

  it('it closes the modal on `modal-shadow` click', async () => {
    const closeQuickNavigationModal = jest.spyOn(wrapper.vm, 'closeQuickNavigationModal');
    await wrapper.find('.quick-navigation__modal-shadow').trigger('click');
    expect(closeQuickNavigationModal).toHaveBeenCalled();
  });

  it('it clears the user input on the x icon click', async () => {
    input.setValue(inputValue);
    const clearUserInput = jest.spyOn(wrapper.vm, 'clearUserInput');
    await wrapper.find('.quick-navigation__clear-icon').trigger('click');
    expect(clearUserInput).toHaveBeenCalled();
    expect(input.element.value).toBe('');
  });

  it('it renders the match list on user input', async () => {
    jest.useFakeTimers();
    input.setValue(inputValue);
    jest.advanceTimersByTime(500);
    expect(wrapper.vm.debouncedInput).toBe(inputValue);
    expect(wrapper.findAll('.quick-navigation__symbol-match').length).toBe(filteredSymbols.length);
    expect(wrapper.find('.no-results').exists()).toBe(false);
  });

  it('it renders the `no results found` string when input does not exist', () => {
    jest.useFakeTimers();
    input.setValue(nonResultsInputValue);
    jest.advanceTimersByTime(500);
    const noResultsWrapper = wrapper.find('.no-results');
    expect(wrapper.vm.debouncedInput).toBe(nonResultsInputValue);
    expect(wrapper.findAll('.quick-navigation__symbol-match').length).toBe(0);
    expect(noResultsWrapper.exists()).toBe(true);
    expect(noResultsWrapper.text()).toBe('No results found.');
  });

  it('it renders symbol matches with the corresponding symbol icon', () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    const matchWrapper = wrapper.findAll('.quick-navigation__symbol-match');
    expect(matchWrapper.at(0).find(NavigatorLeafIcon).exists()).toBe(true);
    expect(matchWrapper.at(1).find(NavigatorLeafIcon).exists()).toBe(true);
    expect(matchWrapper.at(0).find(NavigatorLeafIcon).props().type).toBe(filteredSymbols[0].type);
    expect(matchWrapper.at(1).find(NavigatorLeafIcon).props().type).toBe(filteredSymbols[1].type);
  });

  it('it renders a symbol match with the corresponding symbol title', () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    const matchTitlesWrapper = wrapper.findAll('.symbol-title');
    expect(
      matchTitlesWrapper.at(0).text()
      + matchTitlesWrapper.at(0).find(QuickNavigationHighlighter).props().text
      + matchTitlesWrapper.at(0).find('span').text(),
    ).toBe(filteredSymbols[0].title);
    expect(
      matchTitlesWrapper.at(1).text()
      + matchTitlesWrapper.at(1).find(QuickNavigationHighlighter).props().text
      + matchTitlesWrapper.at(1).find('span').text(),
    ).toBe(filteredSymbols[1].title);
  });

  it('it renders a symbol match with the symbol relative path if applies', () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    const symbolMatchWrapper = wrapper.findAll('.symbol-info');
    expect(symbolMatchWrapper.length).toBe(filteredSymbols.length);
    expect(symbolMatchWrapper.at(0).find('.symbol-path').exists()).toBe(false);
    expect(symbolMatchWrapper.at(1).find('.symbol-path').exists()).toBe(true);
    expect(symbolMatchWrapper.at(1).text()).toBe(filteredSymbols[1].relativePath);
  });

  it('it highlights symbol match on hover', async () => {
  });

  it('it redirects to the symbol path on symbol-match selection', async () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    const referencesWrapper = wrapper.findAll(Reference);
    expect(referencesWrapper.at(0).props().url).toBe(filteredSymbols[0].path);
    expect(referencesWrapper.at(1).props().url).toBe(filteredSymbols[1].path);
  });

  it('it highlights the matching substring of the symbol title', async () => {
    wrapper.setData({
      debouncedInput: inputValue,
    });
    const matchTitlesWrapper = wrapper.findAll('.symbol-title');
    expect(
      matchTitlesWrapper.at(0).find(QuickNavigationHighlighter).props().matcherText,
    ).toBe(symbolsMatchBlueprint[0].input);
    expect(
      matchTitlesWrapper.at(0).find(QuickNavigationHighlighter).props().text,
    ).toBe(symbolsMatchBlueprint[0].subMatchString);
    expect(
      matchTitlesWrapper.at(1).find(QuickNavigationHighlighter).props().matcherText,
    ).toBe(symbolsMatchBlueprint[1].input);
    expect(
      matchTitlesWrapper.at(1).find(QuickNavigationHighlighter).props().text,
    ).toBe(symbolsMatchBlueprint[1].subMatchString);
    expect(
      matchTitlesWrapper.at(2).find(QuickNavigationHighlighter).props().matcherText,
    ).toBe(symbolsMatchBlueprint[3].input);
    expect(
      matchTitlesWrapper.at(2).find(QuickNavigationHighlighter).props().text,
    ).toBe(symbolsMatchBlueprint[3].subMatchString);
  });

  it('it resets `selectedIndex` when `debounced input` changes', async () => {
    wrapper.vm.selectedIndex = 1;
    input.setValue(inputValue);
    expect(wrapper.vm.selectedIndex).toBe(0);
  });

  it('it debounces user input before filtering the symbols', () => {
    jest.useFakeTimers();
    input.setValue(inputValue);
    jest.advanceTimersByTime(500);
    expect(wrapper.vm.debouncedInput).toBe(inputValue);
    input.setValue(nonResultsInputValue);
    expect(wrapper.vm.debouncedInput).toBe(inputValue);
  });

  it('it triggers new filtering on every debounce input change', () => {
    const fuzzyMatch = jest.spyOn(wrapper.vm, 'fuzzyMatch');
    wrapper.setData({
      debouncedInput: inputValue,
    });
    wrapper.setData({
      debouncedInput: nonResultsInputValue,
    });
    wrapper.setData({
      debouncedInput: inputValue,
    });
    wrapper.setData({
      debouncedInput: nonResultsInputValue,
    });
    expect(fuzzyMatch).toHaveBeenCalledTimes(4);
  });

  it('it matches the smallest matching substring from a symbol title', () => {
    const customSymbols = [
      {
        title: 'foofooxyzbarbar',
        path: '',
        type: '',
      },
    ];
    wrapper = shallowMount(QuickNavigationModal, {
      propsData: {
        isModalOpen: false,
      },
      provide: {
        quickNavigationStore: {
          state: {
            flattenIndex: customSymbols,
          },
        },
      },
    });
    wrapper.setData({
      debouncedInput: 'foobar',
    });
    expect(wrapper.find(QuickNavigationHighlighter).props().text).toBe('fooxyzbar');
  });
});
