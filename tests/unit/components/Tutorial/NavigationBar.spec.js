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

scrollToElement.methods.handleFocusAndScroll.mockResolvedValue(true);

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
      reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences',
      projects: [
        {
          reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App',
          sections: [
            {
              reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Create-a-new-AR-project',
            },
            {
              reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Initiate-ARKit-plane-detection',
            },
            {
              reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Assessment',
            },
          ],
        },
      ],
    },
  ];

  const references = {
    foo: { url: 'foo.com' },
    'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App': {
      title: 'Basic Augmented Reality App',
    },
    'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Create-a-new-AR-project': {
      title: 'Create a new AR project',
      reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Create-a-new-AR-project',
      url: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
    },
    'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Initiate-ARKit-plane-detection': {
      title: 'Initiate ARKit plane detection',
      reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Initiate-ARKit-plane-detection',
      url: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
    },
    'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Assessment': {
      title: 'Check your understanding',
      reference: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Assessment',
      url: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
    },
  };

  const topic = references[chapters[0].projects[0].reference].title;

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
      identifierUrl: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App',
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

  it('renders a tray scoped slot', () => {
    let slotProps = {};
    wrapper = shallowMount(NavigationBar, {
      ...mountOptions,
      scopedSlots: {
        tray(props) {
          slotProps = props;
          return 'Tray Content';
        },
      },
    });
    expect(wrapper.text()).toContain('Tray Content');
    expect(slotProps).toEqual({
      siblings: chapters.length,
    });
  });

  describe('with a current section', () => {
    beforeEach(() => {
      TopicStore.reset();
      TopicStore.addLinkableSection({
        anchor: 'introduction',
        title: 'Introduction',
        depth: 0,
      });
      TopicStore.addLinkableSection({
        anchor: 'create-a-new-ar-project',
        title: 'Create a new AR project',
        depth: 0,
      });
      TopicStore.addLinkableSection({
        anchor: 'initiate-arkit-plane-detection',
        title: 'Initiate ARKit plane detection',
        depth: 0,
      });
      TopicStore.addLinkableSection({
        anchor: 'check-your-understanding',
        title: 'Check your understanding',
        depth: 0,
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
            path: '#introduction',
            title: 'Introduction',
            depth: 0,
          },
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
            title: 'Create a new AR project',
            depth: 0,
          },
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
            title: 'Initiate ARKit plane detection',
            depth: 0,
          },
          {
            path: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
            title: 'Check your understanding',
            depth: 0,
          },
        ],
      });
    });

    it('scrolls to a section, on `@select-section`, on MobileDropdown', async () => {
      const dropdown = wrapper.find(MobileDropdown);
      dropdown.vm.$emit('select-section', 'path/to/item#section-foo');
      await flushPromises();
      expect(scrollToElement.methods.handleFocusAndScroll).toHaveBeenCalledTimes(1);
      expect(scrollToElement.methods.handleFocusAndScroll).toHaveBeenCalledWith('section-foo');
    });

    it('scrolls to a section, on `@select-section`, on SecondaryDropdown', async () => {
      const dropdown = wrapper.find(SecondaryDropdown);
      dropdown.vm.$emit('select-section', 'path/to/item#section-foo');
      await flushPromises();
      expect(scrollToElement.methods.handleFocusAndScroll).toHaveBeenCalledTimes(1);
      expect(scrollToElement.methods.handleFocusAndScroll).toHaveBeenCalledWith('section-foo');
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
          path: '#introduction',
          title: 'Introduction',
          depth: 0,
        },
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
          title: 'Create a new AR project',
          depth: 0,
        },
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
          title: 'Initiate ARKit plane detection',
          depth: 0,
        },
        {
          path: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
          title: 'Check your understanding',
          depth: 0,
        },
      ]);
      expect(secondaryDropdown.props('currentOption'))
        .toBe('Introduction');
    });

    it('renders a tray scoped slot', () => {
      let slotProps = {};
      wrapper = shallowMount(NavigationBar, {
        ...mountOptions,
        scopedSlots: {
          tray(props) {
            slotProps = props;
            return 'Tray Content';
          },
        },
      });
      expect(wrapper.text()).toContain('Tray Content');
      expect(slotProps).toEqual({
        siblings: 5, // 1 chapter + 4 sections registered
      });
    });
  });
});
