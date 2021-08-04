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
import FullWidth from 'docc-render/components/Article/Layouts/FullWidth.vue';

const {
  ContentNode,
  LinkableElement,
} = FullWidth.components;

describe('FullWidth', () => {
  let wrapper;

  const propsData = {
    content: [
      {
        type: 'text',
        text: 'foo',
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(FullWidth, { propsData });
  });

  it('renders a .full-width', () => {
    expect(wrapper.is('.full-width')).toBe(true);
  });

  it('renders a `ContentNode`', () => {
    const groups = wrapper.findAll('.group');
    expect(groups.length).toBe(1);

    const node = groups.at(0).find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('does not render a `LinkableElement` without headings', () => {
    expect(wrapper.contains(LinkableElement)).toBe(false);
  });

  describe('with headings', () => {
    const content = [
      {
        type: 'text',
        text: 'a',
      },
      {
        type: 'heading',
        anchor: 'b',
        level: 1,
        text: 'b',
      },
      {
        type: 'text',
        text: 'c',
      },
      {
        type: 'heading',
        anchor: 'd',
        level: 3,
        text: 'd',
      },
      {
        type: 'text',
        text: 'e',
      },
      {
        type: 'text',
        text: 'f',
      },
    ];

    beforeEach(() => {
      wrapper.setProps({ content });
    });

    it('groups headings and subsequent content with `LinkableElement`', () => {
      const groups = wrapper.findAll('.group');
      expect(groups.length).toBe(3);

      expect(groups.at(0).is('div')).toBe(true);
      expect(groups.at(0).find(ContentNode).props('content')).toEqual([
        content[0],
      ]);

      expect(groups.at(1).is(LinkableElement)).toBe(true);
      expect(groups.at(1).props()).toEqual({
        anchor: content[1].anchor,
        depth: 0,
        tag: 'div',
        title: content[1].text,
      });
      expect(groups.at(1).find(ContentNode).props('content')).toEqual([
        content[1],
        content[2],
      ]);

      expect(groups.at(2).is(LinkableElement)).toBe(true);
      expect(groups.at(2).props()).toEqual({
        anchor: content[3].anchor,
        depth: 1,
        tag: 'div',
        title: content[3].text,
      });
      expect(groups.at(2).find(ContentNode).props('content')).toEqual([
        content[3],
        content[4],
        content[5],
      ]);
    });
  });
});
