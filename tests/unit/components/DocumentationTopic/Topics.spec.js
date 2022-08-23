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
import Topics from 'docc-render/components/DocumentationTopic/Topics.vue';
import { TopicStyles } from '@/constants/TopicStyles';
import TopicsGrid from '@/components/DocumentationTopic/TopicsGrid.vue';

const { TopicsTable } = Topics.components;

describe('Topics', () => {
  it('renders a `TopicsTable` with appropriate anchor/title', () => {
    const wrapper = shallowMount(Topics, {
      propsData: {
        sections: [],
        topicStyle: TopicStyles.list,
      },
    });

    const table = wrapper.find(TopicsTable);
    expect(table.exists()).toBe(true);
    expect(table.props()).toEqual({
      anchor: 'topics',
      isSymbolDeprecated: false,
      isSymbolBeta: false,
      sections: [],
      title: 'Topics',
      wrapTitle: false,
    });
    table.setProps({ isSymbolDeprecated: true });
    expect(table.props('isSymbolDeprecated')).toBe(true);
    table.setProps({ isSymbolBeta: true });
    expect(table.props('isSymbolBeta')).toBe(true);
  });

  it('renders a `TopicsGrid`, if the `topicStyle` is not `list`', () => {
    const wrapper = shallowMount(Topics, {
      propsData: {
        sections: [],
        topicStyle: TopicStyles.detailedGrid,
      },
    });
    expect(wrapper.find(TopicsTable).exists()).toBe(false);
    const grid = wrapper.find(TopicsGrid);
    expect(grid.exists()).toBe(true);
    expect(grid.props()).toEqual({
      sections: [],
      topicStyle: TopicStyles.detailedGrid,
    });
  });
});
