/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import CodeBlock from 'docc-render/components/CodeBlock.vue';

describe('CodeBlock', () => {
  it('renders a <code> tag with a slot', () => {
    const wrapper = shallowMount(CodeBlock, {
      slots: { default: 'foobar' },
    });
    expect(wrapper.is('code')).toBe(true);
    expect(wrapper.text()).toBe('foobar');
  });

  describe('AX', () => {
    it('renders text about when a code block stars and ends for screen readers users', () => {
      const wrapper = shallowMount(CodeBlock);
      expect(wrapper.attributes('data-before-code')).toBe('accessibility.code.start');
      expect(wrapper.attributes('data-after-code')).toBe('accessibility.code.end');
    });

    it('renders tabindex attribute for keyboard navigation users to be able to scroll horizontally', () => {
      const wrapper = shallowMount(CodeBlock);
      expect(wrapper.attributes('tabindex')).toBe('0');
    });
  });
});
