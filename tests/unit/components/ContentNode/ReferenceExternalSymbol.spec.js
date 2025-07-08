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
import ReferenceExternalSymbol from 'docc-render/components/ContentNode/ReferenceExternalSymbol.vue';
import CodeVoice from 'docc-render/components/ContentNode/CodeVoice.vue';

describe('ReferenceExternalSymbol', () => {
  it('renders a link in code voice', () => {
    const wrapper = shallowMount(ReferenceExternalSymbol, {
      propsData: { url: 'https://example.com/foo' },
      slots: { default: 'Foo' },
    });
    expect(wrapper.props('url')).toBe('https://example.com/foo');
    const code = wrapper.findComponent(CodeVoice);
    expect(code.exists()).toBe(true);
    expect(code.text()).toBe('Foo');
  });
});
