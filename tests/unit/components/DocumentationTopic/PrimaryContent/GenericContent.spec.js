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
import GenericContent from 'docc-render/components/DocumentationTopic/PrimaryContent/GenericContent.vue';

const { ContentNode } = GenericContent.components;

describe('GenericContent', () => {
  let wrapper;

  const headings = [
    {
      type: ContentNode.BlockType.heading,
      anchor: 'foo',
      level: 2,
      text: 'Foo',
    },
    {
      type: ContentNode.BlockType.heading,
      anchor: 'bar',
      level: 3,
      text: 'Bar',
    },
    {
      type: ContentNode.BlockType.heading,
      anchor: 'baz',
      level: 4,
      text: 'Baz',
    },
  ];

  const paragraphs = [
    {
      type: ContentNode.BlockType.paragraph,
      inlineContent: [
        {
          type: ContentNode.BlockType.text,
          text: 'a',
        },
      ],
    },
    {
      type: ContentNode.BlockType.paragraph,
      inlineContent: [
        {
          type: ContentNode.BlockType.text,
          text: 'b',
        },
      ],
    },
  ];

  const propsData = {
    content: [
      headings[0],
      paragraphs[0],
      headings[1],
      paragraphs[1],
      headings[2],
    ],
  };
  const store = { addOnThisPageSection: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(GenericContent, {
      propsData,
      provide: { store },
    });
  });

  it('renders a `ContentNode`', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('calls `store.addOnThisPageSection` for each `h2` and `h3`, on created', () => {
    expect(store.addOnThisPageSection).toHaveBeenCalledTimes(2);

    expect(store.addOnThisPageSection).toHaveBeenNthCalledWith(1, {
      anchor: headings[0].anchor,
      title: headings[0].text,
      level: headings[0].level,
    });

    expect(store.addOnThisPageSection).toHaveBeenNthCalledWith(2, {
      anchor: headings[1].anchor,
      title: headings[1].text,
      level: headings[1].level,
    });
  });
});
