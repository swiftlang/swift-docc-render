/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ParametersTable from 'docc-render/components/DocumentationTopic/PrimaryContent/ParametersTable.vue';
import { shallowMount } from '@vue/test-utils';

const { Row, Column } = ParametersTable.components;

const parameters = [{
  name: 'foo',
  value: 'fooValue',
}];
const changes = {
  foo: {
    change: 'modified',
    new: { value: 'newValue' },
    previous: { value: 'oldValue' },
  },
};

const defaultProps = {
  parameters, changes,
};

const scopedSlotProps = {
  symbol: [],
  description: [],
};

const createWrapper = ({ propsData } = {}) => (
  shallowMount(ParametersTable, {
    propsData: {
      ...defaultProps,
      ...propsData,
    },
    scopedSlots: {
      symbol: (props) => {
        scopedSlotProps.symbol.push(props);
        return '<div>Symbol Content</div>';
      },
      description: (props) => {
        scopedSlotProps.description.push(props);
        return '<div>Description Content</div>';
      },
    },
  })
);

describe('ParametersTable', () => {
  beforeEach(() => {
    scopedSlotProps.description.length = 0;
    scopedSlotProps.symbol.length = 0;
  });

  it('renders the ParametersTable with passed Row and Column', () => {
    const wrapper = createWrapper();

    const rows = wrapper.findAll(Row);
    const cols = wrapper.findAll(Column);

    expect(rows).toHaveLength(1);
    expect(cols).toHaveLength(2);
    expect(rows.at(0).classes()).toContain('param');

    expect(cols.at(0).props('span')).toEqual({ large: 3, small: 12 });
    expect(cols.at(0).classes()).toContain('param-symbol');
    expect(cols.at(1).props('span')).toEqual({ large: 9, small: 12 });
    expect(cols.at(1).classes()).toContain('param-content');
  });

  it('exposes each `parameter` in the `parameters` prop, as scoped slot props', () => {
    createWrapper();
    // match the first call to have all props of the first parameter
    expect(scopedSlotProps.symbol[0]).toEqual(expect.objectContaining(
      parameters[0],
    ));

    expect(scopedSlotProps.description[0]).toEqual(expect.objectContaining(
      parameters[0],
    ));
  });

  it('exposes the passed changes to the scoped slots props, for the corresponding parameter', () => {
    createWrapper();
    // match the first call to have all props of the first parameter
    expect(scopedSlotProps.symbol[0]).toEqual(expect.objectContaining({
      changes: changes.foo,
    }));

    expect(scopedSlotProps.description[0]).toEqual(expect.objectContaining({
      changes: changes.foo,
    }));
  });

  it('renders the appropriate `changes` classes on `.param`', () => {
    const wrapper = createWrapper();
    const param = wrapper.find('.param');
    expect(param.classes()).toContain('changed');
    expect(param.classes()).toContain('changed-modified');
  });

  it('renders without passing any changes', () => {
    const wrapper = createWrapper({
      propsData: {
        changes: undefined,
      },
    });
    const param = wrapper.find('.param');
    expect(param.classes()).not.toContain('changed');
    expect(param.classes()).not.toContain('changed-modified');
    expect(scopedSlotProps.description[0]).toHaveProperty('changes', {});
    expect(scopedSlotProps.symbol[0]).toHaveProperty('changes', {});
  });

  it('iterates over by the passed `key`, providing changes', () => {
    const keyBy = 'someRandomKey';
    const params = [{
      [keyBy]: 'foo',
      value: 'fooValue',
    }];

    const wrapper = createWrapper({
      propsData: {
        keyBy,
        parameters: params,
        changes,
      },
    });

    const param = wrapper.find('.param');

    expect(param.classes()).toContain('changed');
    expect(param.classes()).toContain('changed-modified');

    expect(scopedSlotProps.symbol[0]).toEqual(expect.objectContaining(
      params[0],
    ));
    expect(scopedSlotProps.symbol[0]).toEqual(expect.objectContaining({
      changes: changes.foo,
    }));

    expect(scopedSlotProps.description[0]).toEqual(expect.objectContaining({
      changes: changes.foo,
    }));
  });
});
