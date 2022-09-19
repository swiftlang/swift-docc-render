/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import LinksBlock from '@/components/ContentNode/LinksBlock.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';
import TopicsLinkCardGrid from '@/components/DocumentationTopic/TopicsLinkCardGrid.vue';

const defaultProps = {
  items: ['foo', 'bar'],
  blockStyle: TopicSectionsStyle.compactGrid,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(LinksBlock, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('LinksBlock', () => {
  it('renders the LinksBlock', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(TopicsLinkCardGrid).props()).toEqual({
      identifiers: defaultProps.items,
      topicStyle: defaultProps.blockStyle,
    });
  });

  it('does not render anything, if a list style is used', () => {
    const wrapper = createWrapper({
      propsData: {
        items: defaultProps.items,
        blockStyle: TopicSectionsStyle.list,
      },
    });
    expect(wrapper.find(TopicsLinkCardGrid).exists()).toBe(false);
  });
});
