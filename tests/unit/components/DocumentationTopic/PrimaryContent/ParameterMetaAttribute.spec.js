/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ParameterMetaAttribute
  from 'docc-render/components/DocumentationTopic/PrimaryContent/ParameterMetaAttribute.vue';
import { shallowMount } from '@vue/test-utils';

const { RenderChanged } = ParameterMetaAttribute.components;

const scopedProps = [];

const defaultPropsData = {
  kind: 'foo',
  attributes: {
    foo: { value: 'bar' },
  },
};

const createWrapper = ({ propsData = {} } = {}) => (
  shallowMount(ParameterMetaAttribute, {
    propsData: { ...defaultPropsData, ...propsData },
    scopedSlots: {
      default: (props) => {
        scopedProps.push(props);
        return 'Foo';
      },
    },
    stubs: {
      RenderChanged,
    },
  }));

describe('ParameterMetaAttribute', () => {
  beforeEach(() => {
    // reset the array
    scopedProps.length = 0;
  });
  it('exposes a default scoped slot with `attribute` as a prop', () => {
    const wrapper = createWrapper();
    // expect the class to be applied
    const metadata = wrapper.find('.property-metadata');
    expect(metadata.exists()).toBe(true);
    expect(metadata.text()).toEqual('Foo');

    expect(scopedProps[0]).toEqual({
      attribute: defaultPropsData.attributes[defaultPropsData.kind],
    });
  });

  it('renders two items when passed changes', () => {
    const changes = {
      foo: {
        new: { value: 'bar' },
        previous: { value: 'foo' },
      },
    };

    const wrapper = createWrapper({
      propsData: {
        changes,
      },
    });
    // expect the class to be applied
    const metadata = wrapper.find('.property-metadata');
    expect(metadata.exists()).toBe(true);
    expect(metadata.text()).toEqual('Foo');

    expect(scopedProps[0]).toEqual({
      attribute: changes[defaultPropsData.kind].new,
    });
    expect(scopedProps[1]).toEqual({
      attribute: changes[defaultPropsData.kind].previous,
    });
  });
});
