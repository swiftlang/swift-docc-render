/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import * as dataUtils from 'docc-render/utils/data';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import DocumentationTopic from 'docc-render/views/DocumentationTopic.vue';
import DocumentationNav from 'docc-render/components/DocumentationTopic/DocumentationNav.vue';
import NavBase from 'docc-render/components/NavBase.vue';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';
import BaseNavigatorView from 'docc-render/views/BaseNavigatorView.vue';
import onThisPageRegistrator from '@/mixins/onThisPageRegistrator';
import { getSetting } from 'docc-render/utils/theme-settings';
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/mixins/onThisPageRegistrator');
jest.mock('docc-render/utils/theme-settings');

const defaultLocale = 'en-US';

getSetting.mockReturnValue(false);
const routeEnterMock = jest.spyOn(dataUtils, 'fetchDataForRouteEnter').mockResolvedValue();

const {
  Topic,
} = DocumentationTopic.components;

const rootLink = {
  path: '/documentation/technologies',
  query: {
    changes: 'latest_minor',
  },
};

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
  remoteSource: {
    url: 'foo.com',
  },
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

const stubs = {
  Nav: DocumentationNav,
  NavBase,
  BaseNavigatorView,
  'router-link': RouterLinkStub,
};

const createWrapper = props => shallowMount(DocumentationTopic, {
  stubs,
  mocks,
  ...props,
});

describe('DocumentationTopic', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    window.renderedTimes = null;
  });

  it('sets enableNavigator to true if schemaVersion is compatible', async () => {
    wrapper = createWrapper();
    wrapper.setData({ topicData });

    expect(wrapper.find(BaseNavigatorView).props('enableNavigator')).toBe(false);

    wrapper.setData({
      topicData: {
        ...topicData,
        schemaVersion: schemaVersionWithSidebar,
      },
    });

    expect(wrapper.find(BaseNavigatorView).props('enableNavigator')).toBe(true);
  });

  it('passes a technology to the BaseNavigatorView when no reference is found for a top-level collection', () => {
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

    const baseNavigatorViewComponent = wrapper.find(BaseNavigatorView);
    expect(baseNavigatorViewComponent.exists()).toBe(true);
    // assert the technology is the last fallback
    expect(baseNavigatorViewComponent.props('technology')).toEqual({
      title: topicData.metadata.title,
      url: mocks.$route.path,
    });
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
      },
    });
    expect(wrapper.find(BaseNavigatorView).props('parentTopicIdentifiers'))
      .toEqual(topicData.hierarchy.paths[1]);
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
      enableOnThisPageNav: true, // enabled by default
      enableMinimized: false, // disabled by default
      topicSectionsStyle: TopicSectionsStyle.list, // default value
      disableHeroBackground: false,
      hierarchyItems: topicData.hierarchy.paths[0],
    });
  });

  it('renders an inactive link, when no technologies root paths', () => {
    wrapper = createWrapper();

    wrapper.setData({ topicData });

    const title = wrapper.find('span.nav-title-link');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('documentation.title');
  });

  it('renders the title "Documentation" link, if there is root link', () => {
    wrapper = createWrapper();

    wrapper.setData({
      topicData: {
        ...topicData,
        hierarchy: {
          paths: [
            [TechnologiesRootIdentifier, ...topicData.hierarchy.paths[0]],
          ],
        },
        references,
      },
    });

    const title = wrapper.find(RouterLinkStub);
    expect(title.exists()).toBe(true);
    expect(title.props('to')).toEqual(rootLink);
    expect(title.text()).toBe('documentation.title');
  });

  it('renders a `Topic` with `topicData` without the first hierarchy item if there is root link', () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        hierarchy: {
          paths: [
            [TechnologiesRootIdentifier, ...topicData.hierarchy.paths[0]],
          ],
        },
        references,
      },
    });

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
      enableOnThisPageNav: true, // enabled by default
      enableMinimized: false, // disabled by default
      topicSectionsStyle: TopicSectionsStyle.list, // default value
      disableHeroBackground: false,
      hierarchyItems: topicData.hierarchy.paths[0],
    });
  });

  it('calls `extractOnThisPageSections` when `topicData` changes', () => {
    // called once on mounted
    expect(onThisPageRegistrator.methods.extractOnThisPageSections).toHaveBeenCalledTimes(1);
    wrapper.setData({ topicData });
    // assert its called again
    expect(onThisPageRegistrator.methods.extractOnThisPageSections).toHaveBeenCalledTimes(2);
  });

  it('passes `enableOnThisPageNav` as `false`, if in IDE', () => {
    wrapper.destroy();
    getSetting.mockReturnValue(false);
    wrapper = createWrapper({
      provide: { isTargetIDE: true },
    });
    wrapper.setData({ topicData });
    expect(wrapper.find(Topic).props('enableOnThisPageNav')).toBe(false);
  });

  it('sets `enableOnThisPageNav` as `false`, if `disabled` in theme settings', async () => {
    getSetting.mockReturnValue(true);
    wrapper.setData({ topicData });
    await flushPromises();
    expect(wrapper.find(Topic).props('enableOnThisPageNav')).toBe(false);
    expect(getSetting).toHaveBeenCalledWith(['features', 'docs', 'onThisPageNavigator', 'disable'], false);
  });

  it('passes `topicSectionsStyle`', () => {
    wrapper.setData({
      topicData: {
        ...topicData,
        topicSectionsStyle: TopicSectionsStyle.detailedGrid,
      },
    });

    const topic = wrapper.find(Topic);
    expect(topic.props('topicSectionsStyle')).toEqual(TopicSectionsStyle.detailedGrid);
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

    expect(mocks.$bridge.on).toHaveBeenNthCalledWith(1, 'contentUpdate', expect.any(Function));
    // invoke the callback on the $bridge
    mocks.$bridge.on.mock.calls[0][1](data);
    // assert the data is stored
    expect(wrapper.vm.topicData).toEqual(data);
    // destroy the instance
    wrapper.destroy();
    expect(mocks.$bridge.off).toHaveBeenNthCalledWith(1, 'contentUpdate', expect.any(Function));
  });

  it('applies ObjC data when provided as overrides', () => {
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
    expect(routeEnterMock).not.toBeCalled();
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

    routeEnterMock.mockResolvedValue(newTopicData);
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
    expect(routeEnterMock).toBeCalled();
    expect(wrapper.vm.topicData.identifier.interfaceLanguage).toBe(newInterfaceLang);
    expect(next).toBeCalled();
  });

  it('skips fetching data, if `meta.skipFetchingData` is `true`', () => {
    const next = jest.fn();
    DocumentationTopic.beforeRouteEnter({ meta: { skipFetchingData: true } }, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(dataUtils.fetchDataForRouteEnter).toHaveBeenCalledTimes(0);
    // now call without `skipFetchingData`
    const params = {
      to: { name: 'foo', meta: {}, params: { locale: defaultLocale } },
      from: { name: 'bar' },
      next: jest.fn(),
    };
    DocumentationTopic.beforeRouteEnter(params.to, params.from, params.next);
    expect(dataUtils.fetchDataForRouteEnter).toHaveBeenCalledTimes(1);
    expect(dataUtils.fetchDataForRouteEnter)
      .toHaveBeenCalledWith(params.to, params.from, params.next);
  });
});
