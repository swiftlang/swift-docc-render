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
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils';
import NavigationBar from 'docc-render/components/Tutorial/NavigationBar.vue';
import TopicStore from 'docc-render/stores/TopicStore';
import scrollToElement from 'docc-render/mixins/scrollToElement';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/mixins/scrollToElement');

scrollToElement.methods.scrollToElement.mockResolvedValue(true);

const {
  PrimaryDropdown,
  SecondaryDropdown,
  ChevronIcon,
  ReferenceUrlProvider,
  NavBase,
  MobileDropdown,
  NavTitleContainer,
} = NavigationBar.components;

describe('NavigationBar', () => {
  let wrapper;

  const technology = 'Augmented Reality';

  const chapters = [
    {
      title: 'Building Interactive AR Experiences',
      identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences',
      projects: [
        {
          title: 'Basic Augmented Reality App',
          identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App',
          path: '/tutorials/augmented-reality/basic-augmented-reality-app',
          sections: [],
        },
        {
          title: 'Lists and Data Flow',
          identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App',
          path: '/tutorials/augmented-reality/lists-and-data-flow',
          sections: [
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
            },
          ],
        },
      ],
    },
  ];

  const topic = chapters[0].projects[0].title;

  const references = {
    foo: { url: 'foo.com' },
  };

  const rootReference = 'foo';

  const mocks = {
    $route: {
      name: 'project-detail',
      params: {},
      path: chapters[0].projects[0].path,
    },
  };

  const mountOptions = {
    propsData: {
      technology,
      chapters,
      topic,
      technologyNavigation: ['overview', 'tutorials', 'resources'],
      rootReference,
    },
    provide: {
      store: TopicStore,
      references,
    },
    mocks,
    stubs: {
      'router-link': RouterLinkStub,
      ReferenceUrlProvider,
      NavBase,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the NavBase', () => {
    wrapper = shallowMount(NavigationBar, mountOptions);

    const container = wrapper.find(NavBase);
    expect(container.attributes()).toHaveProperty('aria-label', technology);
    expect(container.props()).toHaveProperty('hasSolidBackground', true);
    expect(container.exists()).toBe(true);
  });

  describe('with a current section', () => {
    beforeEach(() => {
      TopicStore.reset();
      TopicStore.addLinkableSection({
        anchor: 'introduction',
        title: 'Introduction',
      });
      TopicStore.addLinkableSection({
        anchor: 'create-a-new-ar-project',
        title: 'Create a new AR project',
      });
      TopicStore.addLinkableSection({
        anchor: 'initiate-arkit-plane-detection',
        title: 'Initiate ARKit plane detection',
      });
      TopicStore.addLinkableSection({
        anchor: 'check-your-understanding',
        title: 'Check your understanding',
      });

      wrapper = shallowMount(NavigationBar, mountOptions);
    });

    it('renders a .nav-title-content with technology title', () => {
      const title = wrapper.find(NavTitleContainer);
      expect(title.exists()).toBe(true);
      expect(title.text()).toContain('Augmented Reality');

      expect(title.props('to')).toEqual(references[rootReference].url);
    });

    it('renders a separator', () => {
      expect(wrapper.find('.separator').exists()).toBe(true);
    });

    it('appends already existing query params to the url', () => {
      wrapper = shallowMount(NavigationBar, {
        ...mountOptions,
        mocks: {
          ...mocks,
          $route: {
            ...mocks.$route,
            query: {
              changes: 'foo',
              context: 'bar',
            },
          },
        },
      });

      const titleDiv = wrapper.find('div.nav-title');
      const link = titleDiv.find(NavTitleContainer);
      expect(link.props('to')).toEqual(`${references[rootReference].url}?changes=foo&context=bar`);
    });

    it('does not return a `sectionIndicatorText` string by default', () => {
      expect(wrapper.vm.sectionIndicatorText).toBeUndefined();
    });

    it('renders a MobileDropdown element', () => {
      const dropdown = wrapper.find(MobileDropdown);
      expect(dropdown.exists()).toBe(true);
      expect(dropdown.props()).toEqual({
        options: chapters,
        currentOption: 'Introduction',
        sections: [
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#introduction',
            title: 'Introduction',
          },
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
            title: 'Create a new AR project',
          },
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
            title: 'Initiate ARKit plane detection',
          },
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
            title: 'Check your understanding',
          },
        ],
      });
    });

    it('scrolls to a section, on `@select-section`, on MobileDropdown', async () => {
      const dropdown = wrapper.find(MobileDropdown);
      dropdown.vm.$emit('select-section', 'path/to/item#section-foo');
      await flushPromises();
      expect(scrollToElement.methods.scrollToElement).toHaveBeenCalledTimes(1);
      expect(scrollToElement.methods.scrollToElement).toHaveBeenCalledWith('#section-foo');
    });

    it('scrolls to a section, on `@select-section`, on SecondaryDropdown', async () => {
      const dropdown = wrapper.find(SecondaryDropdown);
      dropdown.vm.$emit('select-section', 'path/to/item#section-foo');
      await flushPromises();
      expect(scrollToElement.methods.scrollToElement).toHaveBeenCalledTimes(1);
      expect(scrollToElement.methods.scrollToElement).toHaveBeenCalledWith('#section-foo');
    });

    it('renders a "Primary Dropdown" with chapters', () => {
      const primaryDropdown = wrapper.find('.primary-dropdown');
      expect(primaryDropdown.exists()).toBe(true);
      expect(primaryDropdown.is(PrimaryDropdown)).toBe(true);
      expect(primaryDropdown.props()).toEqual({
        currentOption: topic,
        options: chapters,
      });
    });

    it('shows a chevron icon', () => {
      const chevron = wrapper.find(ChevronIcon);
      expect(chevron.exists()).toBe(true);
      expect(chevron.classes('hidden')).toBe(false);
    });

    describe('when a (non-intro) section is visible', () => {
      beforeEach(() => {
        TopicStore.updateLinkableSection({
          anchor: 'initiate-arkit-plane-detection',
          visibility: 1,
        });
      });

      it('returns a `sectionIndicatorText` string', () => {
        expect(wrapper.vm.sectionIndicatorText).toBe('(2 of 3)');
      });
    });

    it('renders a "Secondary Dropdown"', () => {
      const secondaryDropdown = wrapper.find('.secondary-dropdown');
      expect(secondaryDropdown.exists()).toBe(true);
      expect(secondaryDropdown.is(SecondaryDropdown)).toBe(true);
      expect(secondaryDropdown.props('options')).toEqual([
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#introduction',
          title: 'Introduction',
        },
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
          title: 'Create a new AR project',
        },
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
          title: 'Initiate ARKit plane detection',
        },
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
          title: 'Check your understanding',
        },
      ]);
      expect(secondaryDropdown.props('currentOption'))
        .toBe('Introduction');
    });
  });
});
