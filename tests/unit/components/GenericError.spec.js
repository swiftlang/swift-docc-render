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
import GenericError from 'docc-render/components/GenericError.vue';

describe('GenericError', () => {
  let wrapper;

  const slotText = 'Here is more text.';

  beforeEach(() => {
    wrapper = shallowMount(GenericError, {
      slots: {
        default: `<p>${slotText}</p>`,
      },
    });
  });

  it('renders a .generic-error container', () => {
    expect(wrapper.element.matches('.generic-error')).toBe(true);
  });

  it('renders a default message', () => {
    const title = wrapper.findComponent('.title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('error.unknown');
  });

  it('exposes a slot', () => {
    const content = wrapper.findComponent('.container p');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe(slotText);
  });

  it('renders a custom message', async () => {
    const message = 'Whoops!';
    await wrapper.setProps({ message });

    const title = wrapper.findComponent('.title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(message);
  });
});
