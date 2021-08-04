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
import PropertyListKeyType from 'docc-render/components/DocumentationTopic/PrimaryContent/PropertyListKeyType.vue';

const mountWithProps = propsData => shallowMount(PropertyListKeyType, { propsData });
const mountWithTypes = (types = []) => mountWithProps({ types });

describe('PropertyListKeyType', () => {
  it('renders a div.type', () => {
    const wrapper = mountWithTypes();
    expect(wrapper.is('div.type')).toBe(true);
    expect(wrapper.text()).toBe('');
  });

  it('pluralizes array types correctly', () => {
    expect(mountWithTypes([
      { arrayMode: true, baseType: 'dictionary' },
      { arrayMode: true, baseType: 'array' },
      { arrayMode: true, baseType: 'number' },
      { arrayMode: true, baseType: 'string' },
      { arrayMode: true, baseType: 'other' },
    ]).text()).toBe(
      'array of dictionaries, array of arrays, array of numbers, array of strings, or array of other',
    );
  });

  it('adds commas correctly depending on number of types', () => {
    const types = [
      { baseType: 'string' },
      { baseType: 'number' },
      { baseType: 'boolean' },
    ];

    expect(mountWithTypes([
      types[0],
    ]).text()).toBe('string');
    expect(mountWithTypes([
      types[0],
      types[1],
    ]).text()).toBe('string or number');
    expect(mountWithTypes([
      types[0],
      types[1],
      types[2],
    ]).text()).toBe('string, number, or boolean');
  });

  it('uses "*" as a wildcard placeholder for the base type', () => {
    expect(mountWithTypes([
      {},
      { arrayMode: true },
    ]).text()).toBe('* or array of *');
  });
});
