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
import ReferenceInternalSymbol from 'docc-render/components/ContentNode/ReferenceInternalSymbol.vue';
import CodeVoice from 'docc-render/components/ContentNode/CodeVoice.vue';

describe('ReferenceInternalSymbol', () => {
  it('renders a link in code voice', () => {
    const wrapper = shallowMount(ReferenceInternalSymbol, {
      propsData: { url: '/documentation/uikit/uiview', kind: 'symbol' },
      slots: { default: 'UIView' },
    });
    expect(wrapper.props('url')).toBe('/documentation/uikit/uiview');
    const code = wrapper.find(CodeVoice);
    expect(code.exists()).toBe(true);
    expect(code.text()).toBe('UIView');
  });
});
