/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Pager from 'docc-render/components/Pager.vue';
import TopicsLinkCardGrid from '@/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import { shallowMount } from '@vue/test-utils';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';

const ref = n => ({ identifier: `ref${n}` });

const defaultProps = {
  items: [...Array(10).keys()].map(n => ref(n)),
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(TopicsLinkCardGrid, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('TopicsLinkCardGrid', () => {
  it('renders only a single page with every item by default', () => {
    const wrapper = createWrapper();

    const pager = wrapper.find(Pager);
    expect(pager.exists()).toBe(true);

    const pages = pager.props('pages');
    expect(pages.length).toBe(1);
    expect(pages[0]).toEqual(defaultProps.items);
  });

  describe('compactGrid with pages', () => {
    it('renders a pager with right number of pages per breakpoint', () => {
      const wrapper = createWrapper({
        propsData: {
          topicStyle: TopicSectionsStyle.compactGrid,
          usePager: true,
        },
      });

      // 10 items => 2 pages at large breakpoint (6 links per page)
      let pager = wrapper.find(Pager);
      expect(pager.exists()).toBe(true);
      expect(pager.props('pages').length).toBe(2);

      // 10 items => 3 pages at medium breakpoint (4 links per page)
      wrapper.setData({ breakpoint: BreakpointName.medium });
      pager = wrapper.find(Pager);
      expect(pager.exists()).toBe(true);
      expect(pager.props('pages').length).toBe(3);

      // 10 items => 10 pages at small breakpoint (1 links per page)
      wrapper.setData({ breakpoint: BreakpointName.small });
      pager = wrapper.find(Pager);
      expect(pager.exists()).toBe(true);
      expect(pager.props('pages').length).toBe(10);
    });
  });

  describe('detailedGrid with pages', () => {
    it('renders a pager with the right number of pages per breakpoint', () => {
      const wrapper = createWrapper({
        propsData: {
          topicStyle: TopicSectionsStyle.detailedGrid,
          usePager: true,
        },
      });

      // 10 items => 3 pages at large breakpoint (4 links per page)
      let pager = wrapper.find(Pager);
      expect(pager.exists()).toBe(true);
      expect(pager.props('pages').length).toBe(3);

      // 10 items => 5 pages at medium breakpoint (2 links per page)
      wrapper.setData({ breakpoint: BreakpointName.medium });
      pager = wrapper.find(Pager);
      expect(pager.exists()).toBe(true);
      expect(pager.props('pages').length).toBe(5);

      // 10 items => 10 pages at small breakpoint (1 links per page)
      wrapper.setData({ breakpoint: BreakpointName.small });
      pager = wrapper.find(Pager);
      expect(pager.exists()).toBe(true);
      expect(pager.props('pages').length).toBe(10);
    });
  });
});
