/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import PossiblyChangedRequiredAttribute
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PossiblyChangedRequiredAttribute.vue';
import { shallowMount } from '@vue/test-utils';

const { RenderChanged } = PossiblyChangedRequiredAttribute.components;

const changes = {
  new: false,
  previous: true,
};

const defaultProps = {
  required: true,
};

const createWrapper = ({ propsData } = {}) => (shallowMount(PossiblyChangedRequiredAttribute, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  stubs: {
    RenderChanged,
  },
}));

describe('PossiblyChangedRequiredAttribute', () => {
  it('renders a `RenderChanged`', () => {
    const wrapper = createWrapper({
      propsData: {
        changes,
      },
    });
    expect(wrapper.find(RenderChanged).props()).toEqual(expect.objectContaining({
      changes,
      renderSingleChange: true,
      value: defaultProps.required,
    }));
    expect(wrapper.find('.property-required').exists()).toBe(true);
  });

  it('renders a text node, if value is false but has changes', () => {
    const wrapper = createWrapper({
      propsData: {
        required: false,
        changes,
      },
    });
    expect(wrapper.find('.property-required').exists()).toBe(true);
  });

  it('does not render a text node, if value is false and no changes', () => {
    const wrapper = createWrapper({
      propsData: {
        required: false,
      },
    });
    expect(wrapper.find('.property-required').exists()).toBe(false);
  });

  it('renders a `Required` text', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.property-required').element.textContent).toEqual('(Required) ');
  });
});
