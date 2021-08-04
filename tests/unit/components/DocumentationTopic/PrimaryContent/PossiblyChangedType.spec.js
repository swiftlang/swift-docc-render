/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import PossiblyChangedType
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PossiblyChangedType.vue';
import { shallowMount } from '@vue/test-utils';

const { RenderChanged, DeclarationTokenGroup } = PossiblyChangedType.components;

const type = [{
  kind: 'text',
  text: 'integer',
}];
const changes = {
  previous: {
    values: [
      {
        kind: 'removed',
        tokens: [
          {
            kind: 'text',
            text: 'number',
          },
        ],
      },
    ],
  },
  new: {
    values: [
      {
        kind: 'added',
        tokens: [
          {
            kind: 'text',
            text: 'integer',
          },
        ],
      },
    ],
  },
};

const createWrapper = ({ propsData } = {}) => shallowMount(PossiblyChangedType, {
  propsData: {
    type,
    changes,
    ...propsData,
  },
  stubs: {
    RenderChanged,
  },
});

describe('PossiblyChangedType', () => {
  it('renders two `DeclarationTokenGroup`, one for each change', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(RenderChanged).props())
      .toEqual(expect.objectContaining({
        value: type,
        wrapChanges: false,
        changes,
      }));

    const groups = wrapper.findAll(DeclarationTokenGroup);
    expect(groups).toHaveLength(2);
    // assert that it is passing over the `values`
    expect(groups.at(0).props('type')).toEqual(changes.new.values);
    expect(groups.at(0).classes())
      .toEqual(expect.arrayContaining(['property-metadata', 'property-type']));
    expect(groups.at(1).props('type')).toEqual(changes.previous.values);
  });

  it('renders a single `DeclarationTokenGroup` if no changes are provided', () => {
    const wrapper = createWrapper({
      propsData: {
        changes: undefined,
      },
    });
    const groups = wrapper.findAll(DeclarationTokenGroup);
    expect(groups).toHaveLength(1);
    // assert type is directly passed through
    expect(groups.at(0).props('type')).toEqual(type);
  });
});
