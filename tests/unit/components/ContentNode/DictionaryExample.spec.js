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
import DictionaryExample from 'docc-render/components/ContentNode/DictionaryExample.vue';

const { CollapsibleCodeListing } = DictionaryExample.components;

const propsData = {
  example: {
    type: 'file',
    content: [{ collapsible: false, code: ['{', '  "name" : "Info.plist"', '}'] }],
  },
};

describe('DictionaryExample', () => {
  it('renders the DictionaryExample without a summary', () => {
    const wrapper = shallowMount(DictionaryExample, {
      propsData,
    });
    const codeListing = wrapper.find(CollapsibleCodeListing);
    expect(codeListing.props('content')).toEqual(propsData.example.content);
    expect(codeListing.props('showLineNumbers')).toEqual(true);
  });

  it('renders data via default slot', () => {
    const wrapper = shallowMount(DictionaryExample, {
      propsData,
      slots: {
        default: 'Default content',
      },
    });
    expect(wrapper.text()).toEqual('Default content');
  });
});
