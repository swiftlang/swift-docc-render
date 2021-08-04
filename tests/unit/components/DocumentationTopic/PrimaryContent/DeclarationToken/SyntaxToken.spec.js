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
import SyntaxToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/SyntaxToken.vue';

describe('SyntaxToken', () => {
  it('renders a span.token-[kind]', () => {
    const wrapper = shallowMount(SyntaxToken, {
      propsData: {
        kind: 'keyword',
        text: 'var',
      },
    });

    expect(wrapper.is('span.token-keyword')).toBe(true);
    expect(wrapper.text()).toBe('var');
  });
});
