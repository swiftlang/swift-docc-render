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
import SeeAlso from 'docc-render/components/DocumentationTopic/SeeAlso.vue';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';

const { TopicsTable } = SeeAlso.components;

describe('SeeAlso', () => {
  it('renders a `TopicsTable` with appropriate anchor/title', () => {
    const wrapper = shallowMount(SeeAlso, { propsData: { sections: [] } });

    const table = wrapper.find(TopicsTable);
    expect(table.exists()).toBe(true);
    expect(table.props()).toEqual({
      anchor: 'see-also',
      isSymbolDeprecated: false,
      isSymbolBeta: false,
      sections: [],
      title: 'See Also',
      wrapTitle: false,
      topicStyle: TopicSectionsStyle.list,
    });
  });
});
