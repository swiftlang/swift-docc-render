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
import PrimaryDropdown from 'docc-render/components/Tutorial/NavigationBar/PrimaryDropdown.vue';
import ReferenceUrlProvider from 'docc-render/components/ReferenceUrlProvider.vue';
import DropdownCustom from 'docc-render/components/DropdownCustom.vue';

const navigate = jest.fn();

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to', 'custom'],
  render() {
    return this.$scopedSlots.default({
      navigate: () => navigate(this.to),
      isActive: this.to === '/tutorials/technologyx/testtutorialarticle?context=foo', // simulate `isActive`
    });
  },
};

const { OptionClass, ActiveOptionClass } = DropdownCustom.constants;
const modules = [
  {
    projects: [
      {
        reference: 'doc://com.example.Test/tutorials/TechnologyX/Tutorial',
        sections: [],
      },
      {
        reference: 'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle',
        sections: [
          {
            kind: 'heading',
            reference: 'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#This-is-an-H2',
          },
          {
            kind: 'heading',
            reference: 'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#A-Section',
          },
          {
            kind: 'heading',
            reference: 'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#This-is-an-H3',
          },
        ],
      },
    ],
    reference: 'doc://com.example.Test/tutorials/TechnologyX/Getting-Started',
  },
];

const references = {
  'doc://com.example.Test/tutorials/TechnologyX/Getting-Started': {
    title: 'Getting Started',
    type: 'topic',
    url: '/tutorials/technologyx/getting-started',
  },
  'doc://com.example.Test/tutorials/TechnologyX/Tutorial': {
    title: 'Basic Augmented Reality App',
    type: 'topic',
    url: '/tutorials/technologyx/tutorial',
  },
  'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle': {
    title: 'Making an Augmented Reality App',
    type: 'topic',
    url: '/tutorials/technologyx/testtutorialarticle',
  },
  'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#A-Section': {
    title: 'A Section',
    type: 'section',
    url: '/tutorials/technologyx/testtutorialarticle#A-Section',
  },
  'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#This-is-an-H2': {
    title: 'This is an H2',
    type: 'section',
    url: '/tutorials/technologyx/testtutorialarticle#This-is-an-H2',
  },
  'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#This-is-an-H3': {
    title: 'This is an H3',
    type: 'section',
    url: '/tutorials/technologyx/testtutorialarticle#This-is-an-H3',
  },
};

const tutorial = references['doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle'].title;

describe('Primary Dropdown', () => {
  let wrapper;
  let btn;
  let firstLink;

  const query = {
    context: 'foo',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const localVue = createLocalVue();
    localVue.directive('hide', hide);

    wrapper = mount(PrimaryDropdown, {
      localVue,
      propsData: {
        currentOption: tutorial,
        options: modules,
      },
      mocks: {
        $router: {
          push: jest.fn(),
        },
        $route: {
          query,
        },
      },
      stubs: {
        'router-link': RouterLinkStub,
        ReferenceUrlProvider,
      },
      provide: {
        references,
      },
    });

    btn = wrapper.find('.form-dropdown-toggle');
    firstLink = wrapper.find(`.${OptionClass}`);
  });

  it('renders a `DropdownCustom` at the root', () => {
    const node = wrapper.find(DropdownCustom);
    expect(node.exists()).toBe(true);
    expect(node.props()).toEqual({
      isSmall: true,
      value: tutorial,
      ariaLabel: 'Current tutorial',
    });
  });

  it('Renders a the correct label', () => {
    expect(wrapper.find('.visuallyhidden').text()).toBe('Current tutorial');
  });

  it('renders chapters properly', () => {
    const chapters = wrapper.findAll('.chapter-list');
    expect(chapters).toHaveLength(1);
    expect(chapters.at(0).find('.chapter-name').text())
      .toEqual(references['doc://com.example.Test/tutorials/TechnologyX/Getting-Started'].title);
  });

  it('renders chapter tutorials properly', () => {
    // assert there are two tutorials, and hey apply the option class
    expect(wrapper.findAll(`.${OptionClass}`)).toHaveLength(2);
    const options = wrapper.find('ul[role="listbox"]').findAll(RouterLinkStub);
    // assert it gets the active option class applied
    expect(options.at(0).props('to')).toEqual('/tutorials/technologyx/tutorial?context=foo');
    expect(options.at(0).find('li').attributes()).toEqual({
      class: 'option',
      role: 'option',
      tabindex: '-1',
      value: 'Basic Augmented Reality App',
    });
    expect(options.at(1).props('to'))
      .toEqual('/tutorials/technologyx/testtutorialarticle?context=foo');
    expect(options.at(1).find('li').attributes()).toEqual({
      class: `option ${ActiveOptionClass}`,
      role: 'option',
      tabindex: '-1',
      value: 'Making an Augmented Reality App',
      'aria-current': 'tutorial',
      'aria-selected': 'true',
    });
  });

  it('opens the dropdown on key `down`', () => {
    btn.trigger('keydown.down');
    expect(wrapper.classes('is-open')).toBe(true);
  });

  it('opens the dropdown on key `up`', () => {
    btn.trigger('keydown.up');
    expect(wrapper.classes('is-open')).toBe(true);
  });

  it('focuses the next element, when `down` key is used on opened dropdown link', async () => {
    // open dropdown first using down key
    btn.trigger('keydown.down');
    // use the down key on the first link
    firstLink.trigger('keydown.down');
    await wrapper.vm.$nextTick();
    const secondOption = wrapper.findAll(`.${OptionClass}`).at(1).element;
    expect(document.activeElement).toEqual(secondOption);
  });

  it('focuses the previous element, when `up` key is used on opened dropdown link', async () => {
    // open dropdown first using down key
    btn.trigger('click');
    // find the second option
    const secondOption = wrapper.findAll(`.${OptionClass}`).at(1);
    // use the down key on the first link
    firstLink.trigger('keydown.down');
    await wrapper.vm.$nextTick();
    // assert it is focused
    expect(document.activeElement).toEqual(secondOption.element);
    // now click up on the active element
    secondOption.trigger('keydown.up');
    await wrapper.vm.$nextTick();
    // assert the first element is active now
    expect(document.activeElement).toEqual(firstLink.element);
  });

  describe('when `esc` key is used on opened dropdown link', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('keydown.esc');
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  describe('when `tab` key is used on opened dropdown link', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('keydown.tab');
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  describe('when opened dropdown link is clicked', () => {
    beforeEach(() => {
      firstLink.trigger('click');
    });

    it('pushes the link path onto the router', () => {
      expect(navigate).toBeCalledWith(`${references['doc://com.example.Test/tutorials/TechnologyX/Tutorial'].url}?context=foo`);
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });

  describe('when `enter` key is used on opened dropdown link', () => {
    beforeEach(() => {
      btn.trigger('click');
      firstLink.trigger('keydown.enter');
    });

    it('pushes the link path onto the router', () => {
      expect(navigate).toBeCalledWith(`${references['doc://com.example.Test/tutorials/TechnologyX/Tutorial'].url}?context=foo`);
    });

    it('closes the dropdown', () => {
      expect(wrapper.classes('is-open')).toBe(false);
    });
  });
});
