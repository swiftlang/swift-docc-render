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
import ConditionalConstraints from 'docc-render/components/DocumentationTopic/ConditionalConstraints.vue';

const { ContentNode } = ConditionalConstraints.components;

describe('ConditionalConstraints', () => {
  const prefix = [
    {
      type: ContentNode.InlineType.text,
      code: 'Available when',
    },
  ];

  const constraints = [
    {
      type: ContentNode.InlineType.codeVoice,
      code: 'Foo',
    },
    {
      type: ContentNode.InlineType.text,
      text: ' is ',
    },
    {
      type: ContentNode.InlineType.codeVoice,
      code: 'Bar',
    },
  ];

  const propsData = {
    constraints,
    prefix,
  };

  it('renders a `ContentNode` with prefix/constraints joined by space node', () => {
    const wrapper = shallowMount(ConditionalConstraints, { propsData });
    expect(wrapper.classes('conditional-constraints')).toBe(true);

    const node = wrapper.find(ContentNode);
    expect(node.props('content')).toEqual([
      ...prefix,
      { type: ContentNode.InlineType.text, text: ' ' },
      ...constraints,
    ]);
  });
});
