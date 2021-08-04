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
    ],
  };

  const provide = {
    store: { addOnThisPageSection: jest.fn() },
  };

  beforeEach(() => {
    provide.store.addOnThisPageSection.mockReset();
    wrapper = shallowMount(GenericContent, {
      propsData,
      provide,
    });
  });

  it('renders a `ContentNode`', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('calls `store.addOnThisPageSection` for each h2 on created', () => {
    const { mock } = provide.store.addOnThisPageSection;
    expect(mock.calls.length).toBe(1);

    expect(mock.calls[0][0]).toEqual({
      anchor: headings[0].anchor,
      title: headings[0].text,
    });
  });
});
