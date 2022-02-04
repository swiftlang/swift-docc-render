/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
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
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/mixins/onPageLoadScrollToFragment');
const TechnologyWithChildren = {
  path: 'path/to/foo',
  children: [],
};

jest.spyOn(dataUtils, 'fetchIndexPathsData').mockResolvedValue({
  languages: {
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
  $route: {},
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
    title: 'FooKit',
    platforms: [
      {
        name: 'fooOS',
      },
      {
        name: 'barOS',
      },
    ],
  },
  primaryContentSections: [],
  references: {
    'topic://foo': { title: 'FooTechnology', url: 'path/to/foo' },
    'topic://bar': { title: 'BarTechnology', url: 'path/to/bar' },
  },
  sampleCodeDownload: {},
  topicSections: [],
  hierarchy: {
    paths: [
      [
        'topic://foo',
        'topic://bar',
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
};

const { EXTRA_INFO_THRESHOLD } = DocumentationTopic.constants;

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

  it('renders the Navigator and AdjustableSidebarWidth', async () => {
    wrapper.setData({ topicData });
    expect(wrapper.find(AdjustableSidebarWidth).props()).toEqual({
      hideSidebar: false,
      maxWidthPercent: 60,
      minWidthPercent: 30,
      openExternally: false,
    });
    const technology = topicData.references['topic://foo'];
    expect(wrapper.find(NavigatorDataProvider).props()).toEqual({
      interfaceLanguage: Language.swift.key.url,
      technology,
    });
    // its rendered by default
    const navigator = wrapper.find(Navigator);
    expect(navigator.exists()).toBe(true);
    expect(navigator.props()).toEqual({
      isFetching: true,
      parentTopicIdentifiers: topicData.hierarchy.paths[0],
      references: topicData.references,
      showExtraInfo: false,
      // assert we are passing the default technology, if we dont have the children yet
      technology,
    });
    expect(dataUtils.fetchIndexPathsData).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(navigator.props()).toEqual({
      isFetching: false,
      parentTopicIdentifiers: topicData.hierarchy.paths[0],
      references: topicData.references,
      showExtraInfo: false,
      technology: TechnologyWithChildren,
    });
  });

  it('handles `@width-change`, on the AdjustableSidebarWidth', async () => {
    wrapper.setData({ topicData });
    await flushPromises();
    wrapper.find(AdjustableSidebarWidth).vm.$emit('width-change', EXTRA_INFO_THRESHOLD + 50);
    expect(wrapper.find(Navigator).props('showExtraInfo')).toBe(true);
  });

  it('renders a `Nav` component', () => {
    wrapper.setData({ topicData });

    const nav = wrapper.find(Nav);
    expect(nav.exists()).toBe(true);

    expect(nav.props()).toEqual({
      parentTopicIdentifiers: topicData.hierarchy.paths[0],
      title: topicData.metadata.title,
      isDark: false,
      hasNoBorder: false,
      currentTopicTags: [],
      references: topicData.references,
      isSymbolBeta: false,
      isSymbolDeprecated: false,
    });
    expect(nav.attributes()).toMatchObject({
      interfacelanguage: 'swift',
      objcpath: 'documentation/objc',
      swiftpath: 'documentation/swift',
    });
  });

  it('handles the `@close`, on Navigator', async () => {
    wrapper.setData({ topicData });
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
  });

  it('computes isSymbolBeta', () => {
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
    expect(topic.props('isSymbolBeta')).toBe(false);
  });

  it('computes isSymbolDeprecated if there is a deprecationSummary', () => {
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
    expect(topic.props('isSymbolDeprecated')).toBe(true);
    // cleanup
    topicData.deprecationSummary = [];
  });

  it('computes isSymbolDeprecated', () => {
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

    const to = {
      query: { language: 'objc' },
    };
    const from = mocks.$route;
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
  });
});
