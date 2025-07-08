/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import DocumentationTopic from 'docc-render/components/DocumentationTopic.vue';
import QuickNavigationPreview from 'docc-render/components/Navigator/QuickNavigationPreview.vue';

const { PreviewState, PreviewStore } = QuickNavigationPreview.constants;

const createWrapper = propsData => shallowMount(QuickNavigationPreview, {
  propsData,
});

describe('QuickNavigationPreview', () => {
  it('renders a simple div when loading', () => {
    const wrapper = createWrapper({ state: PreviewState.loading });
    expect(wrapper.findComponent(DocumentationTopic).exists()).toBe(false);
    expect(wrapper.find('.loading').exists()).toBe(false);
    expect(wrapper.find('.unavailable').exists()).toBe(false);
  });

  it('renders a minimized `DocumentationTopic` for success', () => {
    const json = {
      abstract: [{ type: 'text', text: 'a' }],
      identifier: {
        interfaceLanguage: 'swift',
        url: 'doc://com.example.Test/documentation/foo',
      },
      kind: 'symbol',
      metadata: {
        role: 'symbol',
        title: 'Foo',
      },
    };
    const wrapper = createWrapper({
      json,
      state: PreviewState.success,
    });
    expect(wrapper.find('.loading').exists()).toBe(false);
    expect(wrapper.find('.unavailable').exists()).toBe(false);
    const topic = wrapper.findComponent(DocumentationTopic);
    expect(topic.exists()).toBe(true);
    expect(topic.props('enableMinimized')).toBe(true);
    expect(topic.props('title')).toBe(json.metadata.title);
    expect(topic.props('abstract')).toEqual(json.abstract);
  });

  it('provides a PreviewStore', async () => {
    const json = {
      abstract: [{ type: 'text', text: 'a' }],
      identifier: {
        interfaceLanguage: 'swift',
        url: 'doc://com.example.Test/documentation/foo',
      },
      kind: 'symbol',
      metadata: {
        role: 'symbol',
        title: 'Foo',
      },
      references: {
        foo: 'a',
        bar: 'b',
      },
    };
    const wrapper = createWrapper({
      json,
      state: PreviewState.success,
    });
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided).toHaveProperty('store', PreviewStore);
  });

  it('renders a "Preview unavailable" message for errors', () => {
    const wrapper = createWrapper({ state: PreviewState.error });
    expect(wrapper.findComponent(DocumentationTopic).exists()).toBe(false);
    expect(wrapper.find('.loading').exists()).toBe(false);

    const unavailable = wrapper.findComponent('.unavailable p');
    expect(unavailable.text()).toBe('quicknav.preview-unavailable');
  });

  it('renders loading UI when loading slowly', () => {
    const wrapper = createWrapper({ state: PreviewState.loadingSlowly });
    expect(wrapper.findComponent(DocumentationTopic).exists()).toBe(false);
    expect(wrapper.find('.unavailable').exists()).toBe(false);

    const loading = wrapper.findComponent('.loading');
    expect(loading.exists()).toBe(true);
    const rows = loading.findAll('.loading-row');
    expect(rows.length).toBe(3);
    expect(rows.at(0).attributes('style')).toContain('width: 30%');
    expect(rows.at(1).attributes('style')).toContain('width: 80%');
    expect(rows.at(2).attributes('style')).toContain('width: 50%');
  });

  describe('with tutorial page json', () => {
    it('derives abstract prop from hero content', () => {
      const json = {
        identifier: {
          interfaceLanguage: 'swift',
          url: 'doc://com.example.Test/tutorials/foo/bar',
        },
        kind: 'project',
        metadata: {
          role: 'project',
          title: 'Bar',
        },
        sections: [
          {
            chapter: 'Essentials',
            content: [
              {
                type: 'paragraph',
                inlineContent: [
                  {
                    type: 'text',
                    text: 'b',
                  },
                ],
              },
            ],
            estimatedTimeInMinutes: 42,
            kind: 'hero',
            title: 'Foobar',
          },
        ],
      };
      const wrapper = createWrapper({
        json,
        state: PreviewState.success,
      });
      const topic = wrapper.findComponent(DocumentationTopic);
      expect(topic.exists()).toBe(true);
      expect(topic.props('enableMinimized')).toBe(true);
      expect(topic.props('title')).toBe(json.metadata.title);
      expect(topic.props('abstract')).toEqual(json.sections[0].content);
    });
  });
});
