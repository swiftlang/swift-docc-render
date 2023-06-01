/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Footer from 'docc-render/components/Footer.vue';

const { ColorSchemeToggle, LocaleSelector } = Footer.components;

describe('Footer', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Footer);
  });

  it('renders a <footer>', () => {
    expect(wrapper.is('footer.footer')).toBe(true);
  });

  it('renders a `ColorSchemeToggle`', () => {
    expect(wrapper.contains(ColorSchemeToggle)).toBe(true);
  });

  it('exposes a default slot', () => {
    let slotProps = null;
    wrapper = shallowMount(Footer, {
      scopedSlots: {
        default: (props) => {
          slotProps = props;
          return 'Slot Content';
        },
      },
    });
    expect(wrapper.find('.row').exists()).toBe(true);
    expect(slotProps).toEqual({
      className: 'row',
    });
    expect(wrapper.text()).toBe('Slot Content');
  });
});
