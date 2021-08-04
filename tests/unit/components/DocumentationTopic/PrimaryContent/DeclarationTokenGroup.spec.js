/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeclarationTokenGroup
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationTokenGroup.vue';
import { shallowMount } from '@vue/test-utils';

const { DeclarationToken } = DeclarationTokenGroup.components;
const propsData = {
  type: [
    { kind: 'identifier', text: 'Foo' },
    { kind: 'Text', text: 'Bar' },
  ],
};

describe('DeclarationTokenGroup', () => {
  it('renders a list of DeclarationTokens', () => {
    const wrapper = shallowMount(DeclarationTokenGroup, { propsData });
    expect(wrapper.findAll(DeclarationToken)).toHaveLength(2);
  });

  it('does not render anything if `type` is not provided', () => {
    const wrapper = shallowMount(DeclarationTokenGroup);
    expect(wrapper.html()).toBe(undefined);
  });

  it('does not render anything if `type` is an empty array', () => {
    const wrapper = shallowMount(DeclarationTokenGroup, { propsData: { type: [] } });
    expect(wrapper.html()).toBe(undefined);
  });
});
