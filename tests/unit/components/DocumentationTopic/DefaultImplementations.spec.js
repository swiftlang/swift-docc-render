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
import DefaultImplementations from 'docc-render/components/DocumentationTopic/DefaultImplementations.vue';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';

const { TopicsTable } = DefaultImplementations.components;

describe('DefaultImplementations', () => {
  it('renders a `TopicsTable` with the appropriate anchor/title', () => {
    const propsData = {
      sections: [
        {
          title: 'Foobar',
          identifiers: [
            'foo',
            'bar',
          ],
        },
        {
          title: 'Baz',
          identifiers: ['baz'],
        },
      ],
    };
    const wrapper = shallowMount(DefaultImplementations, { propsData });

    const table = wrapper.find(TopicsTable);
    expect(table.exists()).toBe(true);
    expect(table.props()).toEqual({
      anchor: 'default-implementations',
      sections: propsData.sections,
      isSymbolDeprecated: false,
      isSymbolBeta: false,
      title: 'Default Implementations',
      wrapTitle: true,
      topicStyle: TopicSectionsStyle.list,
    });
  });
});
