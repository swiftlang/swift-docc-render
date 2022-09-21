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
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';

const { TopicsTable } = Topics.components;

describe('Topics', () => {
  it('renders a `TopicsTable` with appropriate anchor/title', () => {
    const wrapper = shallowMount(Topics, {
      propsData: {
        sections: [],
        topicStyle: TopicSectionsStyle.list,
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
      topicStyle: TopicSectionsStyle.list,
    });
    table.setProps({ isSymbolDeprecated: true });
    expect(table.props('isSymbolDeprecated')).toBe(true);
    table.setProps({ isSymbolBeta: true });
    expect(table.props('isSymbolBeta')).toBe(true);
    table.setProps({ topicStyle: TopicSectionsStyle.compactGrid });
    expect(table.props('topicStyle')).toBe(TopicSectionsStyle.compactGrid);
  });
});
