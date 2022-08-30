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
import RestEndpoint from 'docc-render/components/DocumentationTopic/PrimaryContent/RestEndpoint.vue';

const {
  LinkableHeading,
} = RestEndpoint.components;

describe('RestEndpoint', () => {
  it('renders the component with source and a title', () => {
    const tokens = [
      { kind: 'method', text: 'POST' },
      { kind: 'text', text: ' ' },
      { kind: 'baseURL', text: 'https://example.com' },
    ];
    const wrapper = shallowMount(RestEndpoint, {
      propsData: {
        title: 'URL',
        tokens,
      },
    });
    expect(wrapper.find(LinkableHeading).text()).toContain('URL');

    const source = wrapper.find({ name: 'DeclarationSource' });
    expect(source.exists()).toBe(true);
    expect(source.props('tokens')).toEqual(tokens);
  });
});
