/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  createLocalVue,
  mount,
} from '@vue/test-utils';
import hide from 'docc-render/directives/hide';
import SecondaryDropdown from 'docc-render/components/Tutorial/NavigationBar/SecondaryDropdown.vue';
import DropdownCustom from 'docc-render/components/DropdownCustom.vue';

const { OptionClass, ActiveOptionClass } = DropdownCustom.constants;

const navigate = jest.fn();

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to', 'custom'],
  render() {
    return this.$scopedSlots.default({
      navigate: () => navigate(this.to),
    });
  },
};

describe('SecondaryDropdown', () => {
  let wrapper;
  let btn;
  let firstLink;
  let optionElements;

  const options = [
    {
      title: 'Create a new AR project',
      identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Create-a-new-AR-project',
      path: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
    },
    {
      title: 'Initiate ARKit plane detection',
      identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Initiate-ARKit-plane-detection',
      path: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
    },
    {
      title: 'Check your understanding',
      identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Assessment',
      path: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
      kind: '',
    },
  ];

  const currentOption = options[0].title;
  const sectionTrackerText = '(1 of 2)';

  const query = {
    context: 'foo',
  };

  beforeEach(() => {
    const localVue = createLocalVue();
    localVue.directive('hide', hide);

    wrapper = mount(SecondaryDropdown, {
      localVue,
      propsData: {
        options,
        currentOption,
        sectionTracker: sectionTrackerText,
      },
      mocks: {
        $route: {
          hash: '#check-your-understanding',
          query,
        },
        $router: {
          push: jest.fn(),
        },
      },
      stubs: { 'router-link': RouterLinkStub },
    });
    btn = wrapper.find('.form-dropdown-toggle');
    optionElements = wrapper.findAll(`.${OptionClass}`);
    firstLink = optionElements.at(0);
  });

  it('renders a `DropdownCustom` at the root', () => {
    const node = wrapper.find(DropdownCustom);
    expect(node.exists()).toBe(true);
    expect(node.props()).toEqual({
      isSmall: true,
      value: currentOption,
      ariaLabel: 'Current section',
    });
  });

  it('renders a section number tracker inside the dropdown toggle', () => {
    // make sure it is inside the button
    const sectionTracker = btn.find('span.section-tracker');
    expect(sectionTracker.exists()).toBe(true);
    expect(sectionTracker.text()).toEqual('(1 of 2)');
  });

  it('renders a "ul" element as the options dropdown', () => {
    const node = wrapper.find('ul.options');
    expect(node.exists()).toBe(true);
    expect(node.classes()).toContain('form-dropdown-content');
    expect(node.attributes('role')).toBe('listbox');
  });

  it('changes the aria-expanded state to true when dropdown is open', () => {
    btn.trigger('click');

    expect(btn.attributes('aria-expanded')).toBe('true');
    const optionsDropdown = wrapper.find('ul.options');
    expect(optionsDropdown.exists()).toBe(true);
  });

  it('renders a "li" element as the option', () => {
    const option = wrapper.find('li');
    expect(option.classes()).toContain(OptionClass);
    const noneSelectedOption = wrapper.findAll(`.${OptionClass}`).at(1);
    const attrs = noneSelectedOption.attributes();
    expect(attrs).toHaveProperty('tabindex', '-1');
    expect(attrs).not.toHaveProperty('aria-selected');
    expect(attrs).not.toHaveProperty('aria-current');
    // ensure we pass the query and path to the `li` which is a `router-link`
    expect(wrapper.find(RouterLinkStub).props('to')).toEqual({
      path: options[0].path,
      query,
    });
  });

  it('makes the currently visible section option "active" inside the dropdown', () => {
    const activeOption = wrapper.find(`.${ActiveOptionClass}`);
    expect(activeOption.text()).toEqual(currentOption);
    const attrs = activeOption.attributes();
    expect(attrs).toHaveProperty('aria-selected', 'true');
    expect(attrs).toHaveProperty('aria-current', 'section');
  });

  describe('when the first link is clicked', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('click');
    });

    it('cals the navigate scoped slot property', () => {
      expect(navigate).toBeCalledWith({
        path: options[0].path,
        query,
      });
    });

    it('focuses back the button', async () => {
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toEqual(btn.element);
    });

    it('emits the "select-section" event', () => {
      expect(wrapper.emitted()['select-section'][0]).toEqual([options[0].path]);
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  describe('when the enter key is used on the first link', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('keydown.enter');
    });

    it('calls `navigate` scoped slot param', () => {
      expect(navigate).toBeCalledWith({
        path: options[0].path,
        query,
      });
    });

    it('emits the "select-section" event', () => {
      expect(wrapper.emitted()['select-section'][0]).toEqual([options[0].path]);
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  describe('when the esc key is used on the first link', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('keydown.esc');
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  describe('when the tab key is used on the first link', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('keydown.tab');
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  it('focuses the next element, when the down key is used on the first link', async () => {
    btn.trigger('click');
    await wrapper.vm.$nextTick();
    firstLink.trigger('keydown.down');
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toEqual(optionElements.at(1).element);
  });

  it('focuses the previous element, when the up key is used on the second link', async () => {
    btn.trigger('click');
    await wrapper.vm.$nextTick();
    firstLink.trigger('keydown.down');
    await wrapper.vm.$nextTick();
    const secondLink = optionElements.at(1);
    expect(document.activeElement).toEqual(secondLink.element);
    secondLink.trigger('keydown.up');
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toEqual(firstLink.element);
  });
});
