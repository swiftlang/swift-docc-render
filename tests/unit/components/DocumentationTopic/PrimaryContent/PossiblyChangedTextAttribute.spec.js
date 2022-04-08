/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import PossiblyChangedTextAttribute
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PossiblyChangedTextAttribute.vue';
import { shallowMount } from '@vue/test-utils';

const { RenderChanged } = PossiblyChangedTextAttribute.components;

const changes = {
  new: false,
  previous: true,
};

const defaultProps = {
  value: true,
};

const createWrapper = ({ propsData, slots } = {}) => (shallowMount(PossiblyChangedTextAttribute, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  slots: {
    default: '(Required) ',
    ...slots,
  },
  stubs: {
    RenderChanged,
  },
}));

describe('PossiblyChangedTextAttribute', () => {
  it('renders a `RenderChanged`', () => {
    const wrapper = createWrapper({
      propsData: {
        changes,
      },
    });
    expect(wrapper.find(RenderChanged).props()).toEqual(expect.objectContaining({
      changes,
      renderSingleChange: true,
      value: defaultProps.value,
    }));
    expect(wrapper.find('.property-text').exists()).toBe(true);
  });

  it('renders a text node, if value is false but has changes', () => {
    const wrapper = createWrapper({
      propsData: {
        value: false,
        changes,
      },
    });
    expect(wrapper.find('.property-text').exists()).toBe(true);
  });

  it('does not render a text node, if value is false and no changes', () => {
    const wrapper = createWrapper({
      propsData: {
        value: false,
      },
    });
    expect(wrapper.find('.property-text').exists()).toBe(false);
  });

  it('renders a `Required` text', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.property-text').element.textContent).toEqual('(Required) ');
  });

  it('renders slot content', () => {
    const wrapper = createWrapper({
      slots: {
        default: '(Read only) ',
      },
    });
    expect(wrapper.find('.property-text').element.textContent).toEqual('(Read only) ');
  });
});
