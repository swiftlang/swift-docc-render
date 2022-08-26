/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TopicsGrid from '@/components/DocumentationTopic/TopicsGrid.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicStyles } from '@/constants/TopicStyles';
import ContentTableSection from '@/components/DocumentationTopic/ContentTableSection.vue';
import TopicsLinkCardGrid from '@/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import ContentTable from '@/components/DocumentationTopic/ContentTable.vue';

const defaultProps = {
  sections: [
    {
      title: 'Foo',
      identifiers: ['foo', 'bar'],
    },
    {
      title: 'Bar',
      identifiers: ['baz', 'baq'],
    },
  ],
  topicStyle: TopicStyles.compactGrid,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(TopicsGrid, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('TopicsGrid', () => {
  it('renders the TopicsGrid', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(ContentTable).props()).toEqual({
      anchor: 'topics',
      title: 'Topics',
    });
    const sections = wrapper.findAll(ContentTableSection);
    expect(sections).toHaveLength(2);
    expect(sections.at(0).props()).toEqual({
      title: defaultProps.sections[0].title,
    });
    expect(sections.at(1).props()).toEqual({
      title: defaultProps.sections[1].title,
    });
    // assert contents
    expect(sections.at(0).find(TopicsLinkCardGrid).props()).toEqual({
      identifiers: defaultProps.sections[0].identifiers,
      topicStyle: defaultProps.topicStyle,
    });
  });

  it('does not crash with sections without a title', () => {
    const wrapper = createWrapper({
      propsData: {
        topicStyle: TopicStyles.compactGrid,
        sections: [{
          identifiers: ['bal'],
        }],
      },
    });
    const sections = wrapper.findAll(ContentTableSection);
    expect(sections).toHaveLength(1);
    expect(sections.at(0).props()).toEqual({
      title: '',
    });
    expect(sections.at(0).find(TopicsLinkCardGrid).exists()).toBe(true);
  });
});
