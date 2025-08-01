/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';
import DocumentationNav from 'docc-render/components/DocumentationTopic/DocumentationNav.vue';
import NavBase from 'docc-render/components/NavBase.vue';
import AdjustableSidebarWidth from '@/components/AdjustableSidebarWidth.vue';
import Language from '@/constants/Language';
import Navigator from '@/components/Navigator.vue';
import { storage } from '@/utils/storage';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import DocumentationLayout from 'docc-render/components/DocumentationLayout.vue';
import { getSetting } from 'docc-render/utils/theme-settings';
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/mixins/onPageLoadScrollToFragment');
jest.mock('docc-render/utils/FocusTrap');
jest.mock('docc-render/utils/scroll-lock');
jest.mock('docc-render/utils/storage');
jest.mock('docc-render/utils/theme-settings');

const swiftChildren = [
  'swiftChildrenMock',
];
const objcChildren = [
  'objcChildrenMock',
];

const swiftProps = {
  technology: 'swift',
  technologyPath: '/documentation/swift',
  isTechnologyBeta: false,
};

jest.mock('docc-render/stores/IndexStore', () => ({
  state: {
    flatChildren: {
      swift: swiftChildren,
    },
    references: { foo: {} },
    apiChanges: {
      interfaceLanguages: {
        swift: [],
      },
    },
    includedArchiveIdentifiers: ['foo', 'bar'],
    errorFetching: false,
    technologyProps: {
      swift: swiftProps,
    },
  },
}));

storage.get.mockImplementation((key, value) => value);
getSetting.mockReturnValue(false);

const {
  Nav,
  QuickNavigationModal,
} = DocumentationLayout.components;
const { NAVIGATOR_HIDDEN_ON_LARGE_KEY } = DocumentationLayout.constants;

const TechnologiesRootIdentifier = 'topic://technologies';

const references = {
  [TechnologiesRootIdentifier]: { kind: 'technologies', url: '/documentation/technologies' },
  'topic://foo': { title: 'FooTechnology', url: '/documentation/foo' },
  'topic://bar': { title: 'BarTechnology', url: '/documentation/bar' },
};

const mocks = {
  $bridge: {
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
  $route: {
    path: '/documentation/somepath',
    params: {
      locale: 'en-US',
    },
    query: {
      changes: 'latest_minor',
    },
  },
};

const propsData = {
  interfaceLanguage: 'swift',
  isSymbolDeprecated: false,
  isSymbolBeta: false,
  parentTopicIdentifiers: [
    'topic://foo',
    'topic://bar',
  ],
  references,
  technology: references['topic://foo'],
  enableNavigator: false,
  objcPath: 'documentation/objc',
  swiftPath: 'documentation/swift',
  selectedAPIChangesVersion: '',
  navigatorFixedWidth: 400,
};

const AdjustableSidebarWidthSmallStub = {
  render() {
    return this.$scopedSlots.aside({
      scrollLockID: AdjustableSidebarWidth.constants.SCROLL_LOCK_ID,
      breakpoint: BreakpointName.small,
    });
  },
};

const stubs = {
  AdjustableSidebarWidth,
  DocumentationLayout,
};

const provide = { isTargetIDE: false, store: DocumentationTopicStore };

const createWrapper = props => shallowMount(DocumentationLayout, {
  propsData,
  stubs,
  provide,
  mocks,
  ...props,
  slots: {
    content: '<div class="content">Content</div>',
    title: '<div class="title">Title</div>',
  },
});

describe('DocumentationLayout', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    window.renderedTimes = null;
  });

  it('renders slot for content', () => {
    const slot = wrapper.findComponent('.content');
    expect(slot.text()).toBe('Content');
  });

  it('calls the onPageLoadScrollToFragment mixin', () => {
    expect(onPageLoadScrollToFragment.mounted).toHaveBeenCalled();
  });

  it('renders the Navigator and AdjustableSidebarWidth when enabled', async () => {
    await wrapper.setProps({
      enableNavigator: true,
    });

    const adjustableWidth = wrapper.findComponent(AdjustableSidebarWidth);
    expect(adjustableWidth.classes())
      .toEqual(expect.arrayContaining(['full-width-container', 'topic-wrapper']));
    expect(adjustableWidth.props()).toEqual({
      shownOnMobile: false,
      hiddenOnLarge: false,
      enableNavigator: true,
      fixedWidth: propsData.navigatorFixedWidth,
    });

    // its rendered by default
    const navigator = wrapper.findComponent(Navigator);
    expect(navigator.exists()).toBe(true);
    expect(navigator.props()).toEqual({
      isFetching: false,
      scrollLockID: AdjustableSidebarWidth.constants.SCROLL_LOCK_ID,
      renderFilterOnTop: false,
      references,
      apiChanges: null,
      flatChildren: swiftChildren,
      navigatorReferences: { foo: {} },
      errorFetching: false,
      parentTopicIdentifiers: propsData.parentTopicIdentifiers,
      technologyProps: swiftProps,
    });
    // assert the nav is in wide format
    const nav = wrapper.findComponent(Nav);
    expect(nav.props('displaySidenav')).toBe(true);
  });

  it('renders QuickNavigation if enableQuickNavigation is true', async () => {
    getSetting.mockReturnValueOnce(true);
    wrapper = createWrapper({
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });

    await wrapper.setProps({
      enableNavigator: true,
    });

    const quickNavigationModalComponent = wrapper.findComponent(QuickNavigationModal);
    expect(quickNavigationModalComponent.exists()).toBe(true);
  });

  it('does not render QuickNavigation if enableQuickNavigation is false', async () => {
    wrapper = createWrapper({
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });

    await wrapper.setProps({
      enableNavigator: true,
    });

    const quickNavigationModalComponent = wrapper.findComponent(QuickNavigationModal);
    expect(quickNavigationModalComponent.exists()).toBe(false);
  });

  it('does not render QuickNavigation and MagnifierIcon if enableNavigation is false', () => {
    getSetting.mockReturnValueOnce(true);
    wrapper = createWrapper({
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });

    const quickNavigationModalComponent = wrapper.findComponent(QuickNavigationModal);
    expect(quickNavigationModalComponent.exists()).toBe(false);
  });

  it('does not render QuickNavigation if enableQuickNavigation is true but IDE is being targeted', async () => {
    getSetting.mockReturnValueOnce(true);
    wrapper = createWrapper({
      provide: { ...provide, isTargetIDE: true },
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });

    await wrapper.setProps({
      enableNavigator: true,
    });

    const quickNavigationModalComponent = wrapper.findComponent(QuickNavigationModal);
    expect(quickNavigationModalComponent.exists()).toBe(false);
  });

  it('QuickNavigation renders Swift items', async () => {
    getSetting.mockReturnValueOnce(true);
    wrapper = createWrapper({
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });
    await wrapper.setProps({
      enableNavigator: true,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QuickNavigationModal).props('children')).toEqual(swiftChildren);
  });

  it('QuickNavigation falls back to swift items, if no objc items', async () => {
    getSetting.mockReturnValueOnce(true);
    wrapper = createWrapper({
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });
    await wrapper.setProps({
      enableNavigator: true,
      interfaceLanguage: Language.objectiveC.key.url,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QuickNavigationModal).props('children')).toEqual(swiftChildren);
  });

  it('QuickNavigation renders objc items', async () => {
    getSetting.mockReturnValueOnce(true);
    wrapper = createWrapper({
      stubs: {
        ...stubs,
        Nav: DocumentationNav,
        NavBase,
      },
    });
    await wrapper.setProps({
      enableNavigator: true,
      interfaceLanguage: Language.objectiveC.key.url,
    });
    await wrapper.setData({
      indexState: {
        flatChildren: {
          [Language.swift.key.url]: swiftChildren,
          [Language.objectiveC.key.url]: objcChildren,
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QuickNavigationModal).props('children')).toEqual(objcChildren);
  });

  describe('if breakpoint is small', () => {
    beforeEach(() => {
      wrapper = createWrapper({
        stubs: {
          AdjustableSidebarWidth: AdjustableSidebarWidthSmallStub,
        },
      });
    });

    it('applies display none to Navigator if is closed', async () => {
      // renders a closed navigator
      await wrapper.setProps({
        enableNavigator: true,
      });
      await wrapper.vm.$nextTick();
      // assert navigator has display: none
      expect(wrapper.findComponent(Navigator).attributes('style')).toContain('display: none');
    });

    it('reverses the filter position of the navigator', async () => {
      // renders a closed navigator
      await wrapper.setProps({
        enableNavigator: true,
      });
      await wrapper.vm.$nextTick();
      // assert navigator has display: none
      expect(wrapper.findComponent(Navigator).props('renderFilterOnTop')).toBe(true);
    });

    it('does not apply display none to Navigator if is open', async () => {
      // renders an open navigator
      await wrapper.setData({
        sidenavVisibleOnMobile: true,
      });
      await wrapper.setProps({
        enableNavigator: true,
      });
      await wrapper.vm.$nextTick();
      // assert navigator doesn't have display: none
      expect(wrapper.findComponent(Navigator).attributes('style')).toBeFalsy();
    });
  });

  it('renders the Navigator with data when no reference is found for a top-level item', async () => {
    const technologies = {
      id: 'topic://not-existing',
      title: 'Technologies',
      url: '/technologies',
      kind: 'technologies',
    };

    await wrapper.setProps({
      enableNavigator: true,
      parentTopicIdentifiers: [
        technologies.id,
        'topic://bar',
      ],
    });

    const navigator = wrapper.findComponent(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technologyProps')).toEqual(swiftProps);
  });

  it('renders the Navigator with data when no reference is found, even when there is a reference data error', async () => {
    const technologies = {
      id: 'topic://not-existing',
      title: 'Technologies',
      url: '/technologies',
      kind: 'technologies',
    };

    await wrapper.setProps({
      enableNavigator: true,
      parentTopicIdentifiers: [
        technologies.id,
        'topic://bar',
      ],
      // simulate reference data error
      references: {},
    });

    const navigator = wrapper.findComponent(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technologyProps')).toEqual(swiftProps);
  });

  it('renders the Navigator with data when no hierarchy and reference is found for the current page', async () => {
    await wrapper.setProps({
      enableNavigator: true,
      parentTopicIdentifiers: [],
      references: {},
    });

    const navigator = wrapper.findComponent(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technologyProps')).toEqual(swiftProps);
  });

  it('renders without a sidebar', () => {
    // assert the Nav
    const nav = wrapper.findComponent(Nav);
    expect(nav.props()).toEqual({
      isDark: false,
      hasNoBorder: false,
      displaySidenav: false,
      interfaceLanguage: propsData.interfaceLanguage,
      objcPath: propsData.objcPath,
      swiftPath: propsData.swiftPath,
    });
    expect(nav.attributes()).toMatchObject({
      interfacelanguage: 'swift',
      objcpath: propsData.objcPath,
      swiftpath: propsData.swiftPath,
    });

    // assert the sidebar
    const adjustableSidebarWidth = wrapper.findComponent(AdjustableSidebarWidth);
    expect(adjustableSidebarWidth.exists()).toBe(true);
    expect(wrapper.findComponent('.sidebar').exists()).toBe(false);
    expect(wrapper.findComponent(Navigator).exists()).toBe(false);
    // assert the proper container class is applied
    expect(adjustableSidebarWidth.classes())
      .toEqual(expect.arrayContaining(['topic-wrapper', 'full-width-container']));
  });

  it('handles the `@close`, on Navigator, for Mobile breakpoints', async () => {
    await wrapper.setProps({
      enableNavigator: true,
    });
    await flushPromises();
    const navigator = wrapper.findComponent(Navigator);
    const nav = wrapper.findComponent(Nav);
    // toggle the navigator from the Nav component, in Small breakpoint
    nav.vm.$emit('toggle-sidenav', BreakpointName.small);
    const sidebar = wrapper.findComponent(AdjustableSidebarWidth);
    // set the breakpoint to small on the sidebar
    sidebar.vm.breakpoint = BreakpointName.small;
    await wrapper.vm.$nextTick();
    expect(sidebar.props('shownOnMobile')).toBe(true);
    await flushPromises();
    navigator.vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(sidebar.props('shownOnMobile')).toBe(false);
    // Test that Medium works with the same set of props/events
    // toggle the navigator from the Nav component, in Medium breakpoint
    nav.vm.$emit('toggle-sidenav', BreakpointName.medium);
    await wrapper.vm.$nextTick();
    expect(sidebar.props('shownOnMobile')).toBe(true);
    sidebar.vm.breakpoint = BreakpointName.medium;
    navigator.vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(sidebar.props('shownOnMobile')).toBe(false);
    expect(storage.set).toHaveBeenCalledTimes(0);
  });

  it('handles the `@close`, on Navigator, for `Large` breakpoints', async () => {
    await wrapper.setProps({
      enableNavigator: true,
    });
    await flushPromises();
    const sidebar = wrapper.findComponent(AdjustableSidebarWidth);
    const nav = wrapper.findComponent(Nav);
    // close the navigator
    wrapper.findComponent(Navigator).vm.$emit('close');
    await wrapper.vm.$nextTick();
    // assert its closed on Large
    expect(sidebar.props('hiddenOnLarge')).toBe(true);
    // now toggle it back from the Nav
    nav.vm.$emit('toggle-sidenav', BreakpointName.large);
    await flushPromises();
    // assert its no longer hidden
    expect(sidebar.props('hiddenOnLarge')).toBe(false);
  });

  it('handles `@toggle-sidenav` on Nav, for `Large` breakpoint', async () => {
    // assert that the storage was called to get the navigator closed state from LS
    expect(storage.get).toHaveBeenCalledWith(NAVIGATOR_HIDDEN_ON_LARGE_KEY, false);

    await wrapper.setProps({
      enableNavigator: true,
    });
    await flushPromises();
    const nav = wrapper.findComponent(Nav);
    const sidebar = wrapper.findComponent(AdjustableSidebarWidth);
    // assert the hidden prop is false
    expect(sidebar.props('hiddenOnLarge')).toBe(false);
    // Now close from the sidebar
    sidebar.vm.$emit('update:hiddenOnLarge', true);
    await wrapper.vm.$nextTick();
    expect(sidebar.props('hiddenOnLarge')).toBe(true);
    expect(storage.set).toHaveBeenLastCalledWith(NAVIGATOR_HIDDEN_ON_LARGE_KEY, true);
    // now toggle it back, from within the Nav button
    nav.vm.$emit('toggle-sidenav', BreakpointName.large);
    await wrapper.vm.$nextTick();
    // assert we are storing the updated values
    expect(sidebar.props('hiddenOnLarge')).toBe(false);
    expect(storage.set).toHaveBeenLastCalledWith(NAVIGATOR_HIDDEN_ON_LARGE_KEY, false);
  });

  describe('isTargetIDE', () => {
    const provideWithIDETarget = { ...provide, isTargetIDE: true };

    it('does not render a `Nav`', () => {
      wrapper = createWrapper({ provide: provideWithIDETarget });
      expect(wrapper.findComponent(Nav).exists()).toBe(false);
    });

    it('does not render a sidebar', () => {
      wrapper = createWrapper({ provide: provideWithIDETarget });
      expect(wrapper.findComponent('.sidebar').exists()).toBe(false);
      expect(wrapper.findComponent(Navigator).exists()).toBe(false);
    });
  });
});
