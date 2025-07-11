/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import CollapsibleCodeListing from 'docc-render/components/ContentNode/CollapsibleCodeListing.vue';

const {
  CodeBlock,
} = CollapsibleCodeListing.components;

describe('CollapsibleCodeListing', () => {
  let wrapper;

  const propsData = {
    content: [
      {
        collapsible: false,
        code: [
          'foo',
          'bar',
        ],
      },
      {
        collapsible: true,
        code: [
          'baz',
        ],
      },
      {
        collapsible: false,
        code: [
          'qux',
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(CollapsibleCodeListing, { propsData });
  });

  it('renders a .collapsible-code-listing root with <pre><code>', () => {
    expect(wrapper.element.matches('.collapsible-code-listing')).toBe(true);
    const pre = wrapper.findComponent('pre');
    expect(pre.exists()).toBe(true);
    expect(pre.findComponent(CodeBlock).exists()).toBe(true);
  });

  it('renders code in .code-line elements', () => {
    const lines = wrapper.findAll('.code-line');
    expect(lines.length).toBe(4);
    expect(lines.wrappers.map(line => line.text())).toEqual([
      'foo',
      'bar',
      'baz',
      'qux',
    ]);
  });

  it('renders containers for code lines with collapsible/collapsed classes', () => {
    const containers = wrapper.findAll('.container-general');
    expect(containers.length).toBe(propsData.content.length);

    expect(containers.at(0).find('.code-line-container').exists()).toBe(true);
    expect(containers.at(0).classes('collapsible')).toBe(false);
    expect(containers.at(0).classes('collapsed')).toBe(false);
    expect(containers.at(0).find('.code-number').exists()).toBe(true);
    expect(containers.at(0).find('.code-line').exists()).toBe(true);

    expect(containers.at(1).find('.code-line-container').exists()).toBe(true);
    expect(containers.at(1).classes('collapsible')).toBe(true);
    expect(containers.at(1).classes('collapsed')).toBe(false);
    expect(containers.at(1).find('.code-number').exists()).toBe(true);
    expect(containers.at(1).find('.code-line').exists()).toBe(true);

    expect(containers.at(2).find('.code-line-container').exists()).toBe(true);
    expect(containers.at(2).classes('collapsible')).toBe(false);
    expect(containers.at(2).classes('collapsed')).toBe(false);
    expect(containers.at(2).find('.code-number').exists()).toBe(true);
    expect(containers.at(2).find('.code-line').exists()).toBe(true);
  });

  it('adds collapsed class to all collapsible containers when collapsed', async () => {
    expect(wrapper.findAll('.collapsed').length).toBe(0);
    await wrapper.setProps({ collapsed: true });
    expect(wrapper.findAll('.collapsed').length).toBe(1);
  });

  it('does not show line numbers when showLineNumbers is false', async () => {
    let number = wrapper.element.querySelector('.code-number');
    expect(number.style.display).toBe('');
    await wrapper.setProps({ showLineNumbers: false });
    number = wrapper.element.querySelector('.code-number');
    expect(number.style.display).toBe('none');
  });

  it('adds a class `single-line` if only one line of code is provided', async () => {
    expect(wrapper.classes()).not.toContain('single-line');

    await wrapper.setProps({
      content: [
        {
          collapsible: false,
          code: [
            'foo',
          ],
        },
      ],
    });

    expect(wrapper.classes()).toContain('single-line');
  });
});
