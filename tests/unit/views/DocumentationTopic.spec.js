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
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/mixins/onPageLoadScrollToFragment');

const { CodeTheme } = DocumentationTopic.components;

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
  },
  primaryContentSections: [],
  references: {},
  sampleCodeDownload: {},
  topicSections: [],
};

describe('DocumentationTopic', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(DocumentationTopic, { mocks });
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

  it('renders an empty CodeTheme without `topicData`', () => {
    wrapper.setData({ topicData: null });

    const codeTheme = wrapper.find(CodeTheme);
    expect(codeTheme.exists()).toBe(true);
    expect(codeTheme.isEmpty()).toBe(true);
  });

  it('renders a `Topic` with `topicData`', () => {
    wrapper.setData({ topicData });

    const { Topic } = DocumentationTopic.components;
    const topic = wrapper.find(Topic);
    expect(topic.exists()).toBe(true);
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
});
