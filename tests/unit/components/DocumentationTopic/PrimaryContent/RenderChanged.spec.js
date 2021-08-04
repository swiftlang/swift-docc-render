/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import RenderChanged from 'docc-render/components/DocumentationTopic/PrimaryContent/RenderChanged.vue';
import { shallowMount } from '@vue/test-utils';

const { ChangedClasses } = RenderChanged.constants;

const changes = {
  new: {
    foo: 'newFoo',
  },
  previous: {
    foo: 'oldFoo',
  },
};
const value = {
  foo: 'foo',
};

const defaultProps = {
  changes,
  value,
};

const scopedProps = [];

const createWrapper = ({ propsData, scopedSlots, ...others } = {}) => (
  shallowMount(RenderChanged, {
    propsData: {
      ...defaultProps,
      ...propsData,
    },
    scopedSlots: {
      default(props) {
        scopedProps.push(props);
        return this.$createElement('div', {}, `Default ${props.value.foo}`);
      },
      ...scopedSlots,
    },
    ...others,
  })
);

describe('RenderChanged', () => {
  beforeEach(() => {
    scopedProps.length = 0;
  });

  it('renders the first element in the default slot', () => {
    const wrapper = shallowMount(RenderChanged, {
      slots: {
        default: '<div class="defaultSlot">Default Slot</div><div class="secondDefault">Second</div>',
      },
    });

    expect(wrapper.find('.defaultSlot').exists()).toBe(true);
    expect(wrapper.find('.secondDefault').exists()).toBe(false);
  });

  it('renders the default scoped slot when `changes: undefined`', () => {
    const wrapper = createWrapper({
      propsData: {
        changes: undefined,
      },
    });
    // assert there is only one slot rendered
    expect(wrapper.text()).toEqual('Default foo');
    expect(scopedProps).toHaveLength(1);
    expect(scopedProps[0]).toEqual({ value });
  });

  it('renders the `default` scoped slot two times, once per change, if `changes` is passed', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Default newFoo');
    expect(wrapper.text()).toContain('Default oldFoo');

    // make sure the default slot is called two times
    expect(scopedProps).toHaveLength(2);
    expect(scopedProps[0]).toEqual({ value: changes.new });
    expect(scopedProps[1]).toEqual({ value: changes.previous });
  });

  describe('renderSingleChange', () => {
    it('renders the `new` val slot, if `new:true` and `previous:false` when `renderSingleChange:true`', () => {
      const wrapper = createWrapper({
        propsData: {
          changes: {
            new: true,
            previous: false,
          },
        },
        scopedSlots: {
          default: '<div>foo {{ props.value }}</div>',
        },
      });
      expect(wrapper.text()).toBe('foo true');
      expect(wrapper.contains(ChangedClasses.added));
    });

    it('renders the `new` val slot, if `new:false` and `previous:true` when `renderSingleChange:true`', () => {
      const wrapper = createWrapper({
        propsData: {
          changes: {
            new: false,
            previous: true,
          },
        },
        scopedSlots: {
          default: '<div>foo {{ props.value }}</div>',
        },
      });
      expect(wrapper.text()).toBe('foo true');
      expect(wrapper.contains(ChangedClasses.removed));
    });
  });

  describe('wrapChanges', () => {
    it('renders by wrapping changes in a specific class when `wrapChanges: false`', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(ChangedClasses.added).exists()).toBeFalsy();
      expect(wrapper.find(ChangedClasses.removed).exists()).toBeFalsy();
    });

    it('renders without wrapping changes in classes when `wrapChanges: true`', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(`.${ChangedClasses.added}`).text()).toContain('Default newFoo');
      expect(wrapper.find(`.${ChangedClasses.removed}`).text()).toContain('Default oldFoo');
    });
  });
});
