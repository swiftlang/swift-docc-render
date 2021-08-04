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
import ContentNode from 'docc-render/components/Article/ContentNode.vue';

const { BaseContentNode } = ContentNode.components;
const { BlockType } = BaseContentNode;

describe('ContentNode', () => {
  let wrapper;

  const codeListing = {
    type: BlockType.codeListing,
    syntax: 'swift',
    code: ['let foo = "foo"'],
  };

  const heading = {
    type: BlockType.heading,
    anchor: 'foobar',
    level: 2,
    text: 'Foobar',
  };

  beforeEach(() => {
    wrapper = shallowMount(ContentNode, {
      propsData: {
        content: [
          codeListing,
          heading,
        ],
      },
    });
  });

  it('renders a `BaseContentNode', () => {
    expect(wrapper.is(BaseContentNode)).toBe(true);
  });

  // This needs to be directly tested in `articleContent` directly for now due
  // to a possible bug with vue/test-utils. The `BaseContentNode.content` prop
  // doesn't seem to be updated correctly only in the test (possibly due to the
  // same component name used in the base?)
  it('adds `showLineNumbers` prop to code listings', () => {
    expect(wrapper.vm.articleContent[0]).toEqual({
      ...codeListing,
      showLineNumbers: true,
    });
  });

  it('removes `anchor` prop from headings', () => {
    expect(wrapper.vm.articleContent[1]).toEqual({
      type: BlockType.heading,
      level: heading.level,
      text: heading.text,
    });
    expect(wrapper.vm.articleContent[1].anchor).toBeUndefined();
  });
});
