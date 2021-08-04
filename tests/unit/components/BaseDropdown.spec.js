/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BaseDropdown from 'docc-render/components/BaseDropdown.vue';
import { shallowMount } from '@vue/test-utils';

const { InlineChevronDownIcon } = BaseDropdown.components;
const EmptyClass = 'form-dropdown-selectnone';

const createWrapper = ({ propsData, ...other } = {}) => {
  const config = {
    propsData: {
      value: 'foo',
      ...propsData,
    },
    ...other,
  };
  return shallowMount(BaseDropdown, config);
};

describe('BaseDropdown', () => {
  it('renders the BaseDropdown', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toEqual(['form-element']);
  });

  it('renders a `select` component', () => {
    const wrapper = createWrapper();
    // assert select is rendered with correct classes
    const select = wrapper.find('select');
    expect(select.exists()).toBe(true);
    expect(select.classes()).toContain('form-dropdown');
    wrapper.setProps({ value: '' });
    expect(select.classes()).toContain('form-dropdown-selectnone');
  });

  it('renders the `default` slot inside the `select`', () => {
    const value = 'foo';
    const wrapper = createWrapper({
      propsData: {
        value,
      },
      slots: {
        default: '<option value="foo">Foo</option>',
      },
    });
    const dropdown = wrapper.find('select.form-dropdown');
    // assert v-model is there
    expect(dropdown.element.value).toEqual(value);
    expect(dropdown.find('option').exists()).toBe(true);
  });

  it('emits `input` event on each select change', () => {
    const value = 'foo';
    const wrapper = createWrapper({
      slots: {
        default: `<option value="${value}">Foo</option>`,
      },
    });

    wrapper.find('select').setValue(value);
    expect(wrapper.emitted('input')).toEqual([[value]]);
  });

  it('passes all extra attrs to the `select` component', () => {
    const wrapper = createWrapper({
      attrs: {
        'aria-label': 'Some label',
        disabled: true,
      },
    });
    const attrs = wrapper.find('select').attributes();
    expect(attrs).toHaveProperty('aria-label', 'Some label');
    expect(attrs).toHaveProperty('disabled', 'disabled');
  });

  it('renders the `dropdown` scoped slot and provides the correct data', () => {
    let scopedSlotProps = {};
    const wrapper = createWrapper({
      slots: {
        default: '<div class="default">Default</div>',
      },
      scopedSlots: {
        dropdown(props) {
          scopedSlotProps = props;
          return this.$createElement('div', { class: 'foo' }, 'Foo');
        },
      },
    });
    // assert the `select` and it's default slot are not rendered
    expect(wrapper.find('selector').exists()).toBe(false);
    expect(wrapper.find('.default').exists()).toBe(false);
    // assert the new slot content is rendered
    expect(wrapper.find('.foo').text()).toEqual('Foo');
    expect(scopedSlotProps.value).toEqual('foo');
    expect(scopedSlotProps.dropdownClasses).toEqual(expect.arrayContaining(['form-dropdown']));
  });

  it('renders the after slot', () => {
    const wrapper = createWrapper({
      scopedSlots: {
        after: '<div class="after">Foo Text</div>',
      },
    });
    expect(wrapper.find('.after').text()).toContain('Foo Text');
  });

  it('renders an eyebrow slot', () => {
    // assert the component is not even being rendered
    expect(createWrapper().find('.form-label').exists()).toBe(false);
    // re-mount with the eyebrow slot
    const wrapper = createWrapper({
      slots: {
        eyebrow: 'Foo',
      },
    });
    expect(wrapper.find('.form-dropdown').classes()).not.toContain('no-eyebrow');
    // assert its rendered
    const label = wrapper.find('.form-label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toEqual('Foo');
    expect(label.attributes()).toHaveProperty('aria-hidden', 'true');
  });

  it('renders a chevron', () => {
    const wrapper = createWrapper();
    const icon = wrapper.find(InlineChevronDownIcon);
    expect(icon.exists()).toBe(true);
    expect(icon.attributes()).toHaveProperty('aria-hidden', 'true');
  });

  it('passes `form-dropdown-selectnone` if value is empty', () => {
    let scopedSlotProps = {};
    const wrapper = createWrapper({
      scopedSlots: {
        dropdown: (props) => {
          scopedSlotProps = props;
          return '<div class="foo">Foo</div>';
        },
      },
    });
    expect(scopedSlotProps.dropdownClasses)
      .toContainEqual({ [EmptyClass]: false, 'no-eyebrow': true });
    wrapper.setProps({
      value: '',
    });
    expect(scopedSlotProps.dropdownClasses)
      .toContainEqual({ [EmptyClass]: true, 'no-eyebrow': true });
  });
});
