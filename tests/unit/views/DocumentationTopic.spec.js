/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import DocumentationTopic from 'docc-render/views/DocumentationTopic.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';

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
});
