/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ParameterAttributes
  from 'docc-render/components/DocumentationTopic/PrimaryContent/ParameterAttributes.vue';
import { mount } from '@vue/test-utils';

const { AttributeKind } = ParameterAttributes.constants;

const { ParameterMetaAttribute } = ParameterAttributes.components;

const defaultMetadata = { kind: AttributeKind.default, value: 3, title: 'Default' };
const minimumMetadata = { kind: AttributeKind.minimum, value: 20, title: 'Minimum Value' };
const maximumMetadata = { kind: AttributeKind.maximum, value: 50, title: 'Maximum Length' };
const minimumExclusiveMetadata = { kind: AttributeKind.minimumExclusive, value: 2, title: 'Minimum' };
const maximumExclusiveMetadata = { kind: AttributeKind.maximumExclusive, value: 5, title: 'Maximum' };
const allowedValuesMetadata = {
  kind: AttributeKind.allowedValues,
  values: ["'one'", "'two'"],
  title: 'Allowed Values',
};
const allowedTypesMetadata = {
  kind: AttributeKind.allowedTypes,
  values: [
    [{ kind: 'text', text: 'string' }],
    [{ kind: 'text', text: 'number' }],
  ],
  title: 'Allowed Types',
};

const mountComponent = propsData => mount(ParameterAttributes, {
  propsData,
});
const emptySpaceRE = /[\s\n]+/g;

describe('ParameterAttributes', () => {
  it('displays default metadata', () => {
    const wrapper = mountComponent({
      attributes: [
        defaultMetadata,
      ],
    });
    expect(wrapper.find('.property-metadata').text()).toBe('Default: 3');
  });

  it('displays minimum/maximum metadata', () => {
    const wrapper = mountComponent({
      attributes: [
        minimumMetadata,
        maximumMetadata,
      ],
    });
    const metadata = wrapper.findAll('.property-metadata');
    expect(
      metadata
        .at(0)
        .text(),
    ).toBe('Minimum Value: 20');
    expect(
      metadata
        .at(1)
        .text(),
    ).toBe('Maximum Length: 50');
  });

  it('displays exclusive min/max metadata', () => {
    const wrapper = mountComponent({
      attributes: [
        minimumExclusiveMetadata,
        maximumExclusiveMetadata,
      ],
    });
    const metadata = wrapper.findAll('.property-metadata');
    expect(
      metadata
        .at(0)
        .text(),
    ).toBe('Minimum: > 2');
    expect(
      metadata
        .at(1)
        .text(),
    ).toBe('Maximum: < 5');
  });

  it('displays possible types/values metadata', () => {
    const wrapper = mountComponent({
      attributes: [
        allowedValuesMetadata,
        allowedTypesMetadata,
      ],
    });
    const metadata = wrapper.findAll('.property-metadata');
    expect(
      metadata
        .at(0)
        .text()
        .replace(emptySpaceRE, ' '),
    ).toBe('Possible types: string, number');
    expect(
      metadata
        .at(0)
        .text()
        .replace(emptySpaceRE, ' '),
    ).toBe('Possible types: string, number');
    expect(
      metadata
        .at(1)
        .text()
        .replace(emptySpaceRE, ' '),
    ).toBe("Possible values: 'one', 'two'");
  });

  it('displays only one possible type and value metadata', () => {
    const wrapper = mountComponent({
      attributes: [
        {
          kind: AttributeKind.allowedValues,
          values: ['\'one\''],
        },
        {
          kind: AttributeKind.allowedTypes,
          values: [
            [{ kind: 'text', text: 'string' }],
          ],
        },
      ],
    });
    const metadata = wrapper.findAll('.property-metadata');
    expect(
      metadata
        .at(0)
        .text()
        .replace(emptySpaceRE, ' '),
    ).toBe('Type: string');
    expect(
      metadata
        .at(1)
        .text()
        .replace(emptySpaceRE, ' '),
    ).toBe('Value: \'one\'');
  });

  describe('with Changes', () => {
    it('passes changes to default metadata', () => {
      const changes = {
        [AttributeKind.default]: {
          new: { value: 4, title: 'Default' },
          previous: { value: 2, title: 'Default' },
        },
      };
      const wrapper = mountComponent({
        attributes: [
          defaultMetadata,
        ],
        changes,
      });
      expect(wrapper.find(ParameterMetaAttribute).props('changes')).toEqual(changes);

      const metadata = wrapper.findAll('.property-metadata');
      expect(metadata.at(0).text()).toEqual('Default: 4');
      expect(metadata.at(1).text()).toEqual('Default: 2');
    });

    it('passes changes to minimum/maximum metadata', () => {
      const changes = {
        [AttributeKind.minimum]: {
          new: { value: 4, title: 'Minimum' },
          previous: { value: 2, title: 'Minimum' },
        },
        [AttributeKind.maximum]: {
          new: { value: 10, title: 'Maximum' },
          previous: { value: 7, title: 'Maximum' },
        },
      };

      const wrapper = mountComponent({
        attributes: [
          minimumMetadata,
          maximumMetadata,
        ],
        changes,
      });
      expect(wrapper.findAll(ParameterMetaAttribute).at(0).props('changes')).toEqual(changes);
      expect(wrapper.findAll(ParameterMetaAttribute).at(1).props('changes')).toEqual(changes);

      const metadata = wrapper.findAll('.property-metadata');
      expect(
        metadata
          .at(0)
          .text(),
      ).toBe('Minimum: 4');
      expect(
        metadata
          .at(1)
          .text(),
      ).toBe('Minimum: 2');

      expect(metadata.at(2).text()).toBe('Maximum: 10');
      expect(metadata.at(3).text()).toBe('Maximum: 7');
    });

    it('passes changes to exclusive minimum/maximum metadata', () => {
      const changes = {
        [AttributeKind.minimumExclusive]: {
          new: { value: 4, title: 'Minimum' },
          previous: { value: 2, title: 'Minimum' },
        },
        [AttributeKind.maximumExclusive]: {
          new: { value: 10, title: 'Maximum' },
          previous: { value: 7, title: 'Maximum' },
        },
      };

      const wrapper = mountComponent({
        attributes: [
          minimumExclusiveMetadata,
          maximumExclusiveMetadata,
        ],
        changes,
      });
      expect(wrapper.findAll(ParameterMetaAttribute).at(0).props('changes')).toEqual(changes);
      expect(wrapper.findAll(ParameterMetaAttribute).at(1).props('changes')).toEqual(changes);

      const metadata = wrapper.findAll('.property-metadata');
      expect(
        metadata
          .at(0)
          .text(),
      ).toBe('Minimum: > 4');
      expect(
        metadata
          .at(1)
          .text(),
      ).toBe('Minimum: > 2');

      expect(metadata.at(2).text()).toBe('Maximum: < 10');
      expect(metadata.at(3).text()).toBe('Maximum: < 7');
    });

    it('displays possible types/values metadata', () => {
      const changes = {
        [AttributeKind.allowedValues]: {
          new: ["'one'", "'two'"],
          previous: ["'two'", "'one'"],
        },
        [AttributeKind.allowedTypes]: {
          new: [
            [{ kind: 'text', text: 'string' }],
            [{ kind: 'text', text: 'number' }],
          ],
          previous: [
            [{ kind: 'text', text: 'boolean' }],
            [{ kind: 'text', text: 'string' }],
          ],
        },
      };
      const wrapper = mountComponent({
        attributes: [
          allowedValuesMetadata,
          allowedTypesMetadata,
        ],
        changes,
      });
      const metadata = wrapper.findAll('.property-metadata');
      expect(
        metadata
          .at(0)
          .text()
          .replace(emptySpaceRE, ' '),
      ).toBe('Possible types: string, number');
      expect(
        metadata
          .at(1)
          .text()
          .replace(emptySpaceRE, ' '),
      ).toBe('Possible types: boolean, string');
      expect(
        metadata
          .at(2)
          .text()
          .replace(emptySpaceRE, ' '),
      ).toBe('Possible values: \'one\', \'two\'');
      expect(
        metadata
          .at(3)
          .text()
          .replace(emptySpaceRE, ' '),
      ).toBe('Possible values: \'two\', \'one\'');
    });
  });
});
