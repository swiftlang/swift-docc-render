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
import MobileCodeListing from 'docc-render/components/ContentNode/MobileCodeListing.vue';
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';

describe('MobileCodeListing', () => {
  const mountWithHighlights = highlights => (
    shallowMount(MobileCodeListing, {
      propsData: {
        syntax: 'swift',
        content: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        highlights,
      },
    })
  );

  it('sets `isFileNameActionable=true` on `CodeListing`', () => {
    const wrapper = mountWithHighlights([{ line: 1 }]);
    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('isFileNameActionable')).toBe(true);
  });

  it('re-emits `file-name-click` events', () => {
    const wrapper = mountWithHighlights([{ line: 1 }]);
    const codeListing = wrapper.find(CodeListing);

    codeListing.vm.$emit('file-name-click');
    expect(wrapper.emitted()['file-name-click']).toBeTruthy();
  });

  it('selects the correct lines', () => {
    const wrapper = mountWithHighlights([{ line: 4 }, { line: 5 }]);
    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('startLineNumber')).toEqual(2);
    expect(codeListing.props('content')).toEqual(['2', '3', '4', '5', '6', '7']);
  });

  it('selects the correct lines when highlighted lines are at the beginning', () => {
    const wrapper = mountWithHighlights([{ line: 2 }]);
    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('startLineNumber')).toEqual(1);
    expect(codeListing.props('content')).toEqual(['1', '2', '3', '4']);
  });

  it('selects the correct lines when highlighted lines are at the end', () => {
    const wrapper = mountWithHighlights([{ line: 10 }]);
    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('startLineNumber')).toEqual(8);
    expect(codeListing.props('content')).toEqual(['8', '9', '10']);
  });

  it('shows the entire code when `highlights=[]`', () => {
    const wrapper = mountWithHighlights([]);
    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('startLineNumber')).toEqual(1);
    expect(codeListing.props('content')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  });

  it('shows the entire code when there content only has one line and no highlights', () => {
    const wrapper = shallowMount(MobileCodeListing, {
      propsData: {
        syntax: 'swift',
        content: ['1'],
        highlights: [],
      },
    });

    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('startLineNumber')).toEqual(1);
    expect(codeListing.props('content')).toEqual(['1']);
  });

  it('shows the entire code when there content only has one line and highlights', () => {
    const wrapper = shallowMount(MobileCodeListing, {
      propsData: {
        syntax: 'swift',
        content: ['1'],
        highlights: [{ line: 1 }],
      },
    });

    const codeListing = wrapper.find(CodeListing);
    expect(codeListing.props('startLineNumber')).toEqual(1);
    expect(codeListing.props('content')).toEqual(['1']);
  });
});
