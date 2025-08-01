/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeclarationDiff from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationDiff.vue';
import { shallowMount } from '@vue/test-utils';
import DeclarationList from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationList.vue';

const propsData = {
  changeType: 'modified',
  changes: {
    change: 'modified',
    declaration: {
      new: [{ platforms: ['a'], tokens: [] }, { platforms: ['b'], tokens: [] }],
      previous: [{ platforms: ['b'], tokens: [] }],
    },
  },
};

describe('DeclarationDiff', () => {
  it('renders a current and previous DeclarationList components', () => {
    const wrapper = shallowMount(DeclarationDiff, {
      propsData,
    });
    const labels = wrapper.findAll('.declaration-diff-version');
    expect(labels).toHaveLength(2);
    expect(labels.at(0).text()).toEqual('Current');
    expect(labels.at(1).text()).toEqual('Previous');

    const currentLists = wrapper.findComponent('.declaration-diff-current').findAllComponents(DeclarationList);

    expect(currentLists).toHaveLength(2);
    expect(currentLists.at(0).props()).toEqual({
      declaration: propsData.changes.declaration.new[0],
      shouldCaption: true,
      declListExpanded: false,
    });
    expect(currentLists.at(1).props()).toEqual({
      declaration: propsData.changes.declaration.new[1],
      shouldCaption: true,
      declListExpanded: false,
    });

    const previousLists = wrapper.findComponent('.declaration-diff-previous').findAllComponents(DeclarationList);

    expect(previousLists).toHaveLength(1);
    expect(previousLists.at(0).props()).toEqual({
      declaration: propsData.changes.declaration.previous[0],
      shouldCaption: false, // false because we only have one declaration in the group
      declListExpanded: false,
    });
  });
});
