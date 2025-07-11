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
import RawText from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/RawText.vue';

describe('RawText', () => {
  const propsData = { text: 'foo' };

  it('renders a span', () => {
    const wrapper = shallowMount(RawText, { propsData });
    expect(wrapper.element.tagName.toLowerCase() === 'span').toBe(true);
    expect(wrapper.text()).toBe(propsData.text);
  });
});
