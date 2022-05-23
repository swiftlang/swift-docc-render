/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import * as dataUtils from 'docc-render/utils/data';
import { shallowMount } from '@vue/test-utils';
import DocumentationTopic from 'docc-render/views/DocumentationTopic.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';
import AdjustableSidebarWidth from '@/components/AdjustableSidebarWidth.vue';
import NavigatorDataProvider from '@/components/Navigator/NavigatorDataProvider.vue';
import Language from '@/constants/Language';
import Navigator from '@/components/Navigator.vue';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/mixins/onPageLoadScrollToFragment');
jest.mock('docc-render/utils/FocusTrap');
jest.mock('docc-render/utils/changeElementVOVisibility');
jest.mock('docc-render/utils/scroll-lock');

const TechnologyWithChildren = {
  path: '/documentation/foo',
  children: [],
};

jest.spyOn(dataUtils, 'fetchIndexPathsData').mockResolvedValue({
  interfaceLanguages: {
    [Language.swift.key.url]: [TechnologyWithChildren, { path: 'another/technology' }],
  },
});

const { CodeTheme, Nav, Topic } = DocumentationTopic.components;

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

const topicData = {
  abstract: [],
  deprecationSummary: [],
  downloadNotAvailableSummary: [],
  identifier: {
    interfaceLanguage: 'swift',
    url: 'doc://com.example.documentation/documentation/fookit',
  },
  metadata: {
    roleHeading: 'Thing',
    role: 'article',
    title: 'FooKit',
    platforms: [
      {
        name: 'fooOS',
      },
      {
        name: 'barOS',
      },
    ],
    symbolKind: 'foo-type',
  },
  primaryContentSections: [],
  references: {
    'topic://foo': { title: 'FooTechnology', url: '/documentation/foo' },
    'topic://bar': { title: 'BarTechnology', url: '/documentation/bar' },
  },
  sampleCodeDownload: {},
  topicSections: [],
  hierarchy: {
    paths: [
      [
        'topic://foo',
        'topic://bar',
      ],
      [
        'topic://baz',
        'topic://baq',
      ],
    ],
  },
  variants: [
    {
      traits: [{ interfaceLanguage: 'occ' }],
      paths: ['documentation/objc'],
    },
    {
      traits: [{ interfaceLanguage: 'swift' }],
      paths: ['documentation/swift'],
    },
  ],
  schemaVersion: {
    major: 0,
    minor: 2,
    patch: 0,
  },
};

const schemaVersionWithSidebar = {
  major: 0,
  minor: 3,
  patch: 0,
};

const AdjustableSidebarWidthSmallStub = {
  render() {
    return this.$scopedSlots.aside({
      scrollLockID: AdjustableSidebarWidth.constants.SCROLL_LOCK_ID,
      breakpoint: BreakpointName.small,
    });
  },
};

describe('DocumentationTopic', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(DocumentationTopic, {
      mocks,
      stubs: {
        AdjustableSidebarWidth,
        NavigatorDataProvider,
      },
    });
  });

  afterEach(() => {
    window.renderedTimes = null;
  });

  it('provides a global store', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.store).toEqual(DocumentationTopicStore);
  });

  it('calls the onPageLoadScrollToFragment mixin', () => {
    expect(onPageLoadScrollToFragment.mounted).toHaveBeenCalled();
  });

  it('renders an CodeTheme without `topicData`', () => {
    wrapper.setData({ topicData: null });

    const codeTheme = wrapper.find(CodeTheme);
    expect(codeTheme.exists()).toBe(true);
    expect(codeTheme.isEmpty()).toBe(true);
  });

  it('renders the Navigator and AdjustableSidebarWidth when enabled', async () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
      },
    });
    const adjustableWidth = wrapper.find(AdjustableSidebarWidth);
    expect(adjustableWidth.classes())
      .toEqual(expect.arrayContaining(['full-width-container', 'topic-wrapper']));
    expect(adjustableWidth.props()).toEqual({
      openExternally: false,
    });
    const technology = topicData.references['topic://foo'];
    expect(wrapper.find(NavigatorDataProvider).props()).toEqual({
      interfaceLanguage: Language.swift.key.url,
      technology,
      apiChangesVersion: null,
    });
    // its rendered by default
    const navigator = wrapper.find(Navigator);
    expect(navigator.exists()).toBe(true);
    expect(navigator.props()).toEqual({
      errorFetching: false,
      isFetching: true,
      // assert we are passing the first set of paths always
      parentTopicIdentifiers: topicData.hierarchy.paths[0],
      references: topicData.references,
      scrollLockID: AdjustableSidebarWidth.constants.SCROLL_LOCK_ID,
      breakpoint: 'large',
      // assert we are passing the default technology, if we dont have the children yet
      technology,
      apiChanges: null,
    });
    expect(dataUtils.fetchIndexPathsData).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(navigator.props()).toEqual({
      errorFetching: false,
      isFetching: false,
      scrollLockID: AdjustableSidebarWidth.constants.SCROLL_LOCK_ID,
      breakpoint: 'large',
      parentTopicIdentifiers: topicData.hierarchy.paths[0],
      references: topicData.references,
      technology: TechnologyWithChildren,
      apiChanges: null,
    });
    // assert the nav is in wide format
    const nav = wrapper.find(Nav);
    expect(nav.props('isWideFormat')).toBe(true);
  });

  describe('if breakpoint is small', () => {
    beforeEach(() => {
      wrapper = shallowMount(DocumentationTopic, {
        mocks,
        stubs: {
          // renders sidebar on a small device
          AdjustableSidebarWidth: AdjustableSidebarWidthSmallStub,
          NavigatorDataProvider,
        },
      });
    });

    it('applies display none to Navigator if is closed', async () => {
      // renders a closed navigator
      wrapper.setData({
        topicData: {
          ...topicData,
          schemaVersion: schemaVersionWithSidebar,
        },
      });
      await wrapper.vm.$nextTick();
      // assert navigator has display: none
      expect(wrapper.find(Navigator).attributes('style')).toContain('display: none');
    });

    it('does not apply display none to Navigator if is open', async () => {
      // renders an open navigator
      wrapper.setData({
        topicData: {
          ...topicData,
          schemaVersion: schemaVersionWithSidebar,
        },
        isSideNavOpen: true,
      });
      await wrapper.vm.$nextTick();
      // assert navigator doesn't have display: none
      expect(wrapper.find(Navigator).attributes('style')).toBeFalsy();
    });
  });

  it('provides the selected api changes, to the NavigatorDataProvider', () => {
    wrapper.vm.store.state.selectedAPIChangesVersion = 'latest_major';
    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
      },
    });
    const dataProvider = wrapper.find(NavigatorDataProvider);
    expect(dataProvider.props('apiChangesVersion')).toEqual('latest_major');
  });

  it('renders the Navigator with data when no reference is found for a top-level collection', () => {
    const technologies = {
      id: 'topic://technologies',
      title: 'Technologies',
      url: '/technologies',
      kind: 'technologies',
    };
    wrapper.setData({
      topicData: {
        ...topicData,
        metadata: {
          ...topicData.metadata,
          role: 'collection',
        },
        references: {
          ...topicData.references,
          [technologies.id]: technologies,
        },
        hierarchy: {
          paths: [
            [technologies.id, ...topicData.hierarchy.paths[0]],
          ],
        },
        schemaVersion: schemaVersionWithSidebar,
      },
    });

    const navigator = wrapper.find(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technology')).toEqual({
      title: topicData.metadata.title,
      url: mocks.$route.path,
    });
  });

  it('renders the Navigator with data when no reference is found for a top-level item', () => {
    const technologies = {
      id: 'topic://not-existing',
      title: 'Technologies',
      url: '/technologies',
      kind: 'technologies',
    };
    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
        hierarchy: {
          paths: [
            [technologies.id, ...topicData.hierarchy.paths[0]],
          ],
        },
      },
    });

    const navigator = wrapper.find(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technology')).toEqual({
      title: topicData.metadata.title,
      url: mocks.$route.path,
    });
  });

  it('renders the Navigator with data when no reference is found, for any if if the breadcrumbs', () => {
    const technologies = {
      id: 'topic://not-existing',
      title: 'Technologies',
      url: '/technologies',
      kind: 'technologies',
    };
    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
        hierarchy: {
          paths: [
            [technologies.id, ...topicData.hierarchy.paths[0]],
          ],
        },
        // simulate reference data error
        references: {},
      },
    });

    const navigator = wrapper.find(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technology')).toEqual({
      title: topicData.metadata.title,
      url: mocks.$route.path,
    });
  });

  it('renders the Navigator with data when no hierarchy and reference is found for the current page', () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
        // remove the hierarchy items
        hierarchy: {},
        // remove the references as well, so it falls back to the last fallback
        references: {},
      },
    });

    const navigator = wrapper.find(Navigator);
    expect(navigator.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(navigator.props('technology')).toEqual({
      title: topicData.metadata.title,
      url: mocks.$route.path,
    });
  });

  it('renders without a sidebar', () => {
    wrapper.setData({ topicData });

    // assert the Nav
    const nav = wrapper.find(Nav);
    expect(nav.props()).toEqual({
      parentTopicIdentifiers: topicData.hierarchy.paths[0],
      title: topicData.metadata.title,
      isDark: false,
      hasNoBorder: false,
      currentTopicTags: [],
      references: topicData.references,
      isSymbolBeta: false,
      isSymbolDeprecated: false,
      isWideFormat: false,
      interfaceLanguage: topicData.identifier.interfaceLanguage,
      objcPath: topicData.variants[0].paths[0],
      swiftPath: topicData.variants[1].paths[0],
    });
    expect(nav.attributes()).toMatchObject({
      interfacelanguage: 'swift',
      objcpath: 'documentation/objc',
      swiftpath: 'documentation/swift',
    });

    // assert the sidebar
    expect(wrapper.find(AdjustableSidebarWidth).exists()).toBe(false);
    expect(wrapper.find(Navigator).exists()).toBe(false);
    // assert the proper container class is applied
    expect(wrapper.find('.topic-wrapper').classes()).toContain('static-width-container');
  });

  it('finds the parentTopicIdentifiers, that have the closest url structure to the current page', () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        references: {
          ...topicData.references,
          // add pages that match with the `mocks.$route.path`
          'topic://baz': { url: '/documentation/somepath' },
          'topic://baq': { url: '/documentation/somepath/page' },
        },
        schemaVersion: schemaVersionWithSidebar,
      },
    });
    expect(wrapper.find(Navigator).props('parentTopicIdentifiers'))
      .toEqual(topicData.hierarchy.paths[1]);
    expect(wrapper.find(Nav).props('parentTopicIdentifiers'))
      .toEqual(topicData.hierarchy.paths[1]);
  });

  it('handles the `@close`, on Navigator', async () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
      },
    });
    await flushPromises();
    const nav = wrapper.find(Nav);
    nav.vm.$emit('toggle-sidenav');
    const sidebar = wrapper.find(AdjustableSidebarWidth);
    expect(sidebar.props('openExternally')).toBe(true);
    await flushPromises();
    wrapper.find(Navigator).vm.$emit('close');
    expect(sidebar.props('openExternally')).toBe(false);
  });

  it('renders a `Topic` with `topicData`', () => {
    wrapper.setData({ topicData });

    const topic = wrapper.find(Topic);
    expect(topic.exists()).toBe(true);
    expect(topic.attributes('style')).toBeFalsy();
    expect(topic.props()).toEqual({
      ...wrapper.vm.topicProps,
      isSymbolBeta: false,
      isSymbolDeprecated: false,
      objcPath: topicData.variants[0].paths[0],
      swiftPath: topicData.variants[1].paths[0],
      languagePaths: {
        occ: ['documentation/objc'],
        swift: ['documentation/swift'],
      },
    });
  });

  it('provides an empty languagePaths, even if no variants', () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        variants: undefined,
      },
    });

    const topic = wrapper.find(Topic);
    expect(topic.exists()).toBe(true);
    expect(topic.props('languagePaths')).toEqual({});
  });

  it('computes isSymbolBeta', async () => {
    const platforms = [
      {
        introducedAt: '1.0',
        beta: true,
        name: 'fooOS',
      },
      {
        deprecatedAt: '2.0',
        introducedAt: '1.0',
        beta: true,
        name: 'barOS',
      },
    ];
    wrapper.setData({
      topicData: {
        ...topicData,
        metadata: {
          ...topicData.metadata,
          platforms,
        },
      },
    });

    await wrapper.vm.$nextTick();
    const topic = wrapper.find(Topic);
    expect(topic.props('isSymbolBeta')).toBe(true);

    // should not if only one is beta
    wrapper.setData({
      topicData: {
        ...topicData,
        metadata: {
          ...topicData.metadata,
          platforms: [
            {
              introducedAt: '1.0',
              name: 'fooOS',
              beta: true,
            },
            {
              introducedAt: '1.0',
              name: 'fooOS',
            },
          ],
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(topic.props('isSymbolBeta')).toBe(false);
  });

  it('computes isSymbolDeprecated if there is a deprecationSummary', async () => {
    wrapper.setData({ topicData });
    const topic = wrapper.find(Topic);
    expect(topic.props('isSymbolDeprecated')).toBeFalsy();
    wrapper.setData({
      topicData: {
        ...topicData,
        deprecationSummary: [{
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'This feature is deprecated and should not be used in modern macOS apps.',
            },
          ],
        }],
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(Topic).props('isSymbolDeprecated')).toBe(true);
    // cleanup
    topicData.deprecationSummary = [];
  });

  it('computes isSymbolDeprecated', async () => {
    const platforms = [
      {
        deprecatedAt: '1',
        name: 'fooOS',
      },
      {
        deprecatedAt: '1',
        name: 'barOS',
      },
    ];
    wrapper.setData({
      topicData: {
        ...topicData,
        metadata: {
          ...topicData.metadata,
          platforms,
        },
      },
    });
    await wrapper.vm.$nextTick();
    const topic = wrapper.find(Topic);
    expect(topic.props('isSymbolDeprecated')).toBe(true);

    // should not if only one is deprecated
    wrapper.setData({
      topicData: {
        ...topicData,
        metadata: {
          ...topicData.metadata,
          platforms: [
            {
              name: 'fooOS',
              deprecatedAt: '1',
            },
            {
              introducedAt: '1.0',
              name: 'fooOS',
              deprecatedAt: null,
            },
          ],
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(topic.props('isSymbolDeprecated')).toBe(false);
  });

  it('sends a rendered message', async () => {
    const sendMock = jest.fn();
    wrapper = shallowMount(DocumentationTopic, {
      mocks: {
        ...mocks,
        $bridge: {
          ...mocks.$bridge,
          send: sendMock,
        },
      },
      provide: {
        performanceMetricsEnabled: true,
      },
    });

    // Mimic receiving JSON data.
    wrapper.setData({
      topicData,
    });

    await wrapper.vm.$nextTick();
    expect(sendMock).toHaveBeenCalled();
  });

  it('writes app load time after updating topicData', async () => {
    wrapper = shallowMount(DocumentationTopic, {
      mocks,
      provide: {
        performanceMetricsEnabled: true,
      },
    });
    expect(window.renderedTimes).toBeFalsy();

    // Mimic receiving data.
    wrapper.setData({
      topicData,
    });

    await wrapper.vm.$nextTick();
    expect(window.renderedTimes.length).toBeGreaterThan(0);
  });

  it('updates the data after receiving a content update', () => {
    const data = {
      ...topicData,
      metadata: {
        ...topicData.metadata,
        title: 'BlahKit',
      },
    };

    wrapper = shallowMount(DocumentationTopic, {
      mocks: {
        ...mocks,
        $bridge: {
          ...mocks.$bridge,
          on(type, handler) {
            handler(data);
          },
        },
      },
    });

    expect(wrapper.vm.topicData).toEqual(data);
  });

  it('applies ObjC data when provided as overrides', () => {
    dataUtils.fetchDataForRouteEnter = jest.fn();

    const oldInterfaceLang = topicData.identifier.interfaceLanguage; // swift
    const newInterfaceLang = 'occ';

    const variantOverrides = [
      {
        traits: [{ interfaceLanguage: newInterfaceLang }],
        patch: [
          { op: 'replace', path: '/identifier/interfaceLanguage', value: newInterfaceLang },
        ],
      },
    ];
    wrapper.setData({
      topicData: { ...topicData, variantOverrides },
    });
    expect(wrapper.vm.topicData.identifier.interfaceLanguage).toBe(oldInterfaceLang);

    const from = mocks.$route;
    const to = {
      ...from,
      query: { language: 'objc' },
    };
    const next = jest.fn();
    // there is probably a more realistic way to simulate this
    DocumentationTopic.beforeRouteUpdate.call(wrapper.vm, to, from, next);

    // check that the provided override data has been applied after updating the
    // route with the "language=objc" query param and also ensure that new data
    // is not fetched
    expect(wrapper.vm.topicData.identifier.interfaceLanguage).not.toBe(oldInterfaceLang);
    expect(wrapper.vm.topicData.identifier.interfaceLanguage).toBe(newInterfaceLang);
    expect(dataUtils.fetchDataForRouteEnter).not.toBeCalled();
    expect(next).toBeCalled();
  });

  it('loads new data and applies ObjC data when provided as overrides', async () => {
    const newInterfaceLang = 'occ';
    const variantOverrides = [
      {
        traits: [{ interfaceLanguage: newInterfaceLang }],
        patch: [
          { op: 'replace', path: '/identifier/interfaceLanguage', value: newInterfaceLang },
        ],
      },
    ];
    const newTopicData = {
      ...topicData,
      variantOverrides,
    };

    dataUtils.fetchDataForRouteEnter = jest.fn().mockResolvedValue(newTopicData);
    wrapper.setData({ topicData });

    const to = {
      path: '/documentation/bar',
      query: { language: 'objc' },
    };
    const from = mocks.$route;
    const next = jest.fn();
    // there is probably a more realistic way to simulate this
    DocumentationTopic.beforeRouteUpdate.call(wrapper.vm, to, from, next);
    await flushPromises();

    // check that the provided override data has been applied after updating the
    // route with the "language=objc" query param and ensure that new data has
    // been fetched
    expect(dataUtils.fetchDataForRouteEnter).toBeCalled();
    expect(wrapper.vm.topicData.identifier.interfaceLanguage).toBe(newInterfaceLang);
    expect(next).toBeCalled();
  });

  describe('isTargetIDE', () => {
    const provide = { isTargetIDE: true };

    it('does not render a `Nav`', () => {
      wrapper = shallowMount(DocumentationTopic, {
        mocks,
        stubs: {
          AdjustableSidebarWidth,
          NavigatorDataProvider,
        },
        provide,
      });
      wrapper.setData({ topicData });
      expect(wrapper.contains(Nav)).toBe(false);
    });

    it('does not render an AdjustableSidebarWidth', () => {
      wrapper = shallowMount(DocumentationTopic, {
        mocks,
        stubs: {
          AdjustableSidebarWidth,
          NavigatorDataProvider,
        },
        provide,
      });
      wrapper.setData({ topicData });
      expect(wrapper.find(AdjustableSidebarWidth).exists()).toBe(false);
      expect(wrapper.find(Topic).exists()).toBe(true);
    });
  });
});
