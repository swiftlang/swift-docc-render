/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeclarationSourceLink
  from '@/components/DocumentationTopic/PrimaryContent/DeclarationSourceLink.vue';
import { shallowMount } from '@vue/test-utils';
import SwiftFileIcon from '@/components/Icons/SwiftFileIcon.vue';
import WordBreak from '@/components/WordBreak.vue';

const defaultProps = {
  url: 'foo.com',
  fileName: 'Foo.swift',
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(DeclarationSourceLink, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('DeclarationSourceLink', () => {
  it('renders the DeclarationSourceLink with a swift icon', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(SwiftFileIcon).exists()).toBe(true);
    expect(wrapper.find(WordBreak).text()).toContain(defaultProps.fileName);
    expect(wrapper.find('a').attributes('href')).toBe(defaultProps.url);
  });

  it('does not render the Swift icon for none-swift files', () => {
    const wrapper = createWrapper({
      propsData: {
        fileName: 'foo.js',
      },
    });
    expect(wrapper.find(SwiftFileIcon).exists()).toBe(false);
    expect(wrapper.text()).toContain('foo.js');
  });
});
