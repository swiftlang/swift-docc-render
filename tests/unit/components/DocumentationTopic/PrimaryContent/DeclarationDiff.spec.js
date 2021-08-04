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
import DeclarationGroup from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationGroup.vue';

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
  it('renders a current and previous DeclarationGroup components', () => {
    const wrapper = shallowMount(DeclarationDiff, {
      propsData,
    });
    const labels = wrapper.findAll('.declaration-diff-version');
    expect(labels).toHaveLength(2);
    expect(labels.at(0).text()).toEqual('Current');
    expect(labels.at(1).text()).toEqual('Previous');

    const currentGroups = wrapper.find('.declaration-diff-current').findAll(DeclarationGroup);

    expect(currentGroups).toHaveLength(2);
    expect(currentGroups.at(0).props()).toEqual({
      declaration: propsData.changes.declaration.new[0],
      shouldCaption: true,
      changeType: 'modified',
    });
    expect(currentGroups.at(1).props()).toEqual({
      declaration: propsData.changes.declaration.new[1],
      shouldCaption: true,
      changeType: 'modified',
    });

    const previousGroups = wrapper.find('.declaration-diff-previous').findAll(DeclarationGroup);

    expect(previousGroups).toHaveLength(1);
    expect(previousGroups.at(0).props()).toEqual({
      declaration: propsData.changes.declaration.previous[0],
      shouldCaption: false, // false because we only have one declaration in the group
      changeType: 'modified',
    });
  });
});
