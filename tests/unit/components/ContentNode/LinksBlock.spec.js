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
import TopicsLinkBlock from '@/components/DocumentationTopic/TopicsLinkBlock.vue';

const defaultProps = {
  identifiers: ['foo', 'bar', 'baz'],
  blockStyle: TopicSectionsStyle.compactGrid,
};

const references = {
  foo: { identifier: 'foo' },
  bar: { identifier: 'bar' },
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(LinksBlock, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  stubs: { TopicsLinkBlock: { props: ['topic'], template: '<div/>' } },
  provide: { references },
  ...others,
});

describe('LinksBlock', () => {
  it('renders the LinksBlock', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(TopicsLinkCardGrid).props()).toEqual({
      items: [references.foo, references.bar],
      topicStyle: defaultProps.blockStyle,
    });
  });

  it('renders `TopicsLinkBlock` if `blockStyle` is a `list`', () => {
    const wrapper = createWrapper({
      propsData: {
        items: defaultProps.items,
        blockStyle: TopicSectionsStyle.list,
      },
    });
    expect(wrapper.find(TopicsLinkCardGrid).exists()).toBe(false);
    expect(wrapper.find('.links-block').exists()).toBe(true);
    // they are two, because one does not have a reference object
    const linkBlocks = wrapper.findAll(TopicsLinkBlock);
    expect(linkBlocks).toHaveLength(2);
    expect(linkBlocks.at(0).props('topic')).toEqual(references.foo);
    expect(linkBlocks.at(1).props('topic')).toEqual(references.bar);
  });
});
