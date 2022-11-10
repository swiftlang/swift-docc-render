/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TopicsLinkCardGrid from '@/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';
import Row from '@/components/ContentNode/Row.vue';
import Column from '@/components/ContentNode/Column.vue';
import TopicsLinkCardGridItem from '@/components/DocumentationTopic/TopicsLinkCardGridItem.vue';

const ref1 = { identifier: 'ref1' };
const ref2 = { identifier: 'ref2' };

const defaultProps = {
  items: [ref1, ref2],
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(TopicsLinkCardGrid, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('TopicsLinkCardGrid', () => {
  it('renders the TopicsLinkCardGrid', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(Row).props()).toEqual({
      columns: { large: 3, medium: 2 }, // compact grid is a 3 column setup
    });
    const cols = wrapper.findAll(Column);
    expect(cols).toHaveLength(2);
    expect(cols.at(0).find(TopicsLinkCardGridItem).props()).toEqual({
      item: ref1,
      compact: true,
    });
  });

  it('renders as a `detailedGrid`', () => {
    const wrapper = createWrapper({
      propsData: {
        ...defaultProps,
        topicStyle: TopicSectionsStyle.detailedGrid,
      },
    });
    expect(wrapper.find(Row).props()).toEqual({
      columns: { large: 2, medium: 2 }, // detailed grid is a 2 column setup
    });
    expect(wrapper.find(TopicsLinkCardGridItem).props('compact')).toBe(false);
  });
});
