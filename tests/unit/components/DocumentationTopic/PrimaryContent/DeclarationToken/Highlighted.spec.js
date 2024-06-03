/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shallowMount } from '@vue/test-utils';
import Highlighted from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/Highlighted.vue';

describe('Highlighted', () => {
  it('renders slotted content using strong.highlighted', () => {
    const slots = { default: 'hello, world' };
    const wrapper = shallowMount(Highlighted, { slots });

    const strong = wrapper.find('strong.highlighted');
    expect(strong.exists()).toBe(true);
    expect(strong.text()).toBe(slots.default);
  });
});
