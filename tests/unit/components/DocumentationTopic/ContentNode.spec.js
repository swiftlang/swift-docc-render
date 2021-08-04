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
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';

const { BaseContentNode } = ContentNode.components;

describe('ContentNode', () => {
  it('renders a `BaseContentNode`', () => {
    const propsData = { content: [] };
    const wrapper = shallowMount(ContentNode, { propsData });

    const base = wrapper.find(BaseContentNode);
    expect(base.exists()).toBe(true);
    expect(base.props('content')).toEqual(propsData.content);
  });
});
