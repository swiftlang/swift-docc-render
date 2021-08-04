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
import Abstract from 'docc-render/components/DocumentationTopic/Description/Abstract.vue';

describe('Abstract', () => {
  const propsData = {
    content: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'foobar',
          },
        ],
      },
    ],
  };

  it('renders a `ContentNode`', () => {
    const wrapper = shallowMount(Abstract, { propsData });

    const { ContentNode } = Abstract.components;
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.classes('abstract')).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });
});
