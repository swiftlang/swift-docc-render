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
import PossibleValues from 'docc-render/components/DocumentationTopic/PrimaryContent/PossibleValues.vue';

const { ContentNode, WordBreak } = PossibleValues.components;

const propsData = {
  values: [
    {
      name: 'A',
    },
    {
      name: 'B',
      content: [
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'Any i386 type of processor',
            },
          ],
        },
      ],
    },
  ],
};
describe('PossibleValues', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(PossibleValues, {
      propsData,
    });
  });

  it('renders the passed values', () => {
    const titles = wrapper.findAll('.param-name');
    expect(titles).toHaveLength(2);
    expect(titles.at(0).text()).toEqual('A');
    expect(titles.at(1).text()).toEqual('B');

    const content = wrapper.findAll('.value-content');
    expect(content).toHaveLength(1);
    const contentNode = wrapper.find(ContentNode);
    expect(contentNode.exists()).toBe(true);
    expect(contentNode.props('content')).toBe(propsData.values[1].content);
  });

  it('renders <WordBreak> with a <code> tag', () => {
    const wordBreaks = wrapper.findAll(WordBreak);
    expect(wordBreaks).toHaveLength(2);
    expect(wordBreaks.at(0).text()).toBe(propsData.values[0].name);
    expect(wordBreaks.at(0).attributes('tag')).toBe('code');
    expect(wordBreaks.at(1).text()).toBe(propsData.values[1].name);
  });
});
