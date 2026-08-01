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
import Article from 'docc-render/components/Article.vue';
import Topic from 'docc-render/views/Topic.vue';
import TopicStore from 'docc-render/stores/TopicStore';
import Tutorial from 'docc-render/components/Tutorial.vue';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';
import { fetchDataForRouteEnter, shouldFetchDataForRouteUpdate } from '@/utils/data';

vi.mock('docc-render/mixins/onPageLoadScrollToFragment');
vi.mock('@/utils/data');

fetchDataForRouteEnter.mockResolvedValue({});

const mocks = {
  $bridge: {
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  },
  $route: {},
};

describe('Topic', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(Topic, { mocks });
  });

  afterEach(() => {
    window.renderedTimes = null;
  });

  it('calls the onPageLoadScrollToFragment mixin', () => {
    expect(onPageLoadScrollToFragment.mounted).toHaveBeenCalled();
  });

  it('renders an empty div with no data', () => {
    expect(wrapper.element.tagName.toLowerCase() === 'div').toBe(true);
    expect(wrapper.element.childElementCount === 0).toBe(true);
  });

  it('provides a positive offset for `navigationBarHeight`', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm.$.provides.navigationBarHeight).toBe(52);
  });

  it('provides `TopicStore` as `store`', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm.$.provides.store).toEqual(TopicStore);
  });

  it('skips fetching data, if `meta.skipFetchingData` is `true`', async () => {
    const afterEnter = await Topic.beforeRouteEnter(
      { meta: { skipFetchingData: true } },
      {},
    );
    expect(afterEnter).toEqual(expect.any(Function));
    expect(fetchDataForRouteEnter).toHaveBeenCalledTimes(0);
    // now call without `skipFetchingData`
    const params = {
      to: { name: 'foo', meta: {}, params: {} },
      from: { name: 'bar' },
    };
    await Topic.beforeRouteEnter(params.to, params.from);
    expect(fetchDataForRouteEnter).toHaveBeenCalledTimes(1);
    expect(fetchDataForRouteEnter)
      .toHaveBeenCalledWith(params.to, params.from, expect.any(Function));
  });

  it('returns redirects rejected by the route data fetch', async () => {
    const redirect = '/documentation/redirected';
    fetchDataForRouteEnter.mockRejectedValueOnce(redirect);

    await expect(Topic.beforeRouteEnter({ meta: {} }, {})).resolves.toBe(redirect);
  });

  it('returns cancellations rejected while updating a route', async () => {
    shouldFetchDataForRouteUpdate.mockReturnValueOnce(true);
    fetchDataForRouteEnter.mockRejectedValueOnce(false);

    await expect(Topic.beforeRouteUpdate.call(wrapper.vm, {}, {})).resolves.toBe(false);
  });

  async function testRenderedMessageWithProvide(provide) {
    const sendMock = vi.fn();
    wrapper = shallowMount(Topic, {
      mocks: {
        ...mocks,
        $bridge: {
          ...mocks.$bridge,
          send: sendMock,
        },
      },
      provide,
    });

    // Mimic receiving JSON data.
    await wrapper.setData({
      topicData: {
        identifier: {
          interfaceLanguage: 'swift',
          url: 'foo',
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(sendMock).toHaveBeenCalled();
  }

  it('sends a rendered message with performance metrics', async () => {
    await testRenderedMessageWithProvide({ performanceMetricsEnabled: true });
  });

  it('sends a rendered message in IDE mode', async () => {
    await testRenderedMessageWithProvide({ isTargetIDE: true });
  });

  it('writes app load time after updating topicData with performance metrics', async () => {
    wrapper = shallowMount(Topic, {
      mocks,
      provide: {
        performanceMetricsEnabled: true,
      },
    });
    expect(window.renderedTimes).toBeFalsy();

    // Mimic receiving data.
    await wrapper.setData({
      topicData: {
        identifier: {
          interfaceLanguage: 'swift',
          url: 'foo',
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(window.renderedTimes.length).toBeGreaterThan(0);
  });

  it('updates the data after receiving a content update', async () => {
    const data = {
      identifier: 'myIdentifier',
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

  describe('with article data', () => {
    const props = {
      hierarchy: {},
      metadata: {},
      references: {},
      sections: [],
    };

    beforeEach(async () => {
      await wrapper.setData({
        topicData: {
          ...props,
          kind: 'article',
          identifier: {
            interfaceLanguage: 'swift',
            url: 'foo',
          },
        },
      });
    });

    it('renders an `Article`', () => {
      const article = wrapper.findComponent(Article);
      expect(article.exists()).toBe(true);
      expect(article.props()).toEqual({
        ...props,
        identifierUrl: 'foo',
        hierarchy: {
          technologyNavigation: ['overview', 'tutorials', 'resources'],
        },
      });
    });

    it('passes the hierarchy to Article', async () => {
      const hierarchy = { technologyNavigation: ['overview', 'tutorials'] };
      await wrapper.setData({
        topicData: {
          ...props,
          kind: 'article',
          hierarchy,
        },
      });

      const article = wrapper.findComponent(Article);
      expect(article.exists()).toBe(true);
      expect(article.props('hierarchy')).toEqual(hierarchy);
    });

    it('passes the default hierarchy to Article if none is provided', async () => {
      await wrapper.setData({
        topicData: {
          ...props,
          kind: 'article',
          hierarchy: null,
        },
      });

      const article = wrapper.findComponent(Article);
      expect(article.exists()).toBe(true);
      expect(article.props('hierarchy')).toEqual({
        technologyNavigation: ['overview', 'tutorials', 'resources'],
      });
    });
  });

  describe('with tutorial data', () => {
    const props = {
      hierarchy: {},
      metadata: {},
      references: {},
      sections: [],
    };

    beforeEach(async () => {
      await wrapper.setData({
        topicData: {
          ...props,
          kind: 'project',
          identifier: {
            interfaceLanguage: 'swift',
            url: 'foo',
          },
        },
      });
    });

    it('renders a `Tutorial`', () => {
      const tutorial = wrapper.findComponent(Tutorial);
      expect(tutorial.exists()).toBe(true);
      expect(tutorial.props()).toEqual({
        ...props,
        identifierUrl: 'foo',
        hierarchy: {
          technologyNavigation: ['overview', 'tutorials', 'resources'],
        },
      });
    });

    it('passes the hierarchy to Tutorial', async () => {
      const hierarchy = { technologyNavigation: ['overview', 'tutorials'] };
      await wrapper.setData({
        topicData: {
          ...props,
          hierarchy,
          kind: 'project',
        },
      });

      const tutorial = wrapper.findComponent(Tutorial);
      expect(tutorial.exists()).toBe(true);
      expect(tutorial.props('hierarchy')).toEqual(hierarchy);
    });

    it('passes the default hierarchy to Tutorial if none is provided', async () => {
      await wrapper.setData({
        topicData: {
          ...props,
          kind: 'project',
          hierarchy: null,
        },
      });

      const tutorial = wrapper.findComponent(Tutorial);
      expect(tutorial.exists()).toBe(true);
      expect(tutorial.props('hierarchy')).toEqual({
        technologyNavigation: ['overview', 'tutorials', 'resources'],
      });
    });
  });
});

describe('with `isTargetIDE', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Topic, {
      mocks,
      provide: {
        isTargetIDE: true,
      },
    });
  });

  it('provides a 0 offset for `navigationBarHeight`', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm.$.provides.navigationBarHeight).toBe(0);
  });
});
