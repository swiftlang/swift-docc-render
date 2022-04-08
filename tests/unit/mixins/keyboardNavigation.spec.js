/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';

const totalItemsToNavigate = 10;
const createWrapper = () => (
  shallowMount({
    name: 'TestComponent',
    mixins: [keyboardNavigation],
    template: `
      <div
        @keydown.meta.up.prevent="focusFirst"
        @keydown.meta.down.prevent="focusLast"
        @keydown.up.exact.prevent="focusPrev"
        @keydown.down.exact.prevent="focusNext"
      />
    `,
    computed: {
      totalItemsToNavigate: () => totalItemsToNavigate,
    },
  })
);

describe('keyboardNavigation', () => {
  it('renders focus index at 0', () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.focusedIndex).toBe(0);
  });

  it('allows the user to navigate to the last item on the list when pressing cmd + down key', async () => {
    const wrapper = createWrapper();
    wrapper.trigger('keydown', {
      key: 'ArrowDown',
      metaKey: true,
    });
    // assert that focusedIndex is restore
    expect(wrapper.vm.focusedIndex).toBe(null);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.focusedIndex).toBe(totalItemsToNavigate - 1);
  });

  it('allows the user to navigate to the first item on the list when pressing cmd + up key', async () => {
    const wrapper = createWrapper();
    // simulate going down a few times
    wrapper.trigger('keydown', {
      key: 'ArrowDown',
    });
    wrapper.trigger('keydown', {
      key: 'ArrowDown',
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.focusedIndex).toBe(2);
    // now go to the top
    wrapper.trigger('keydown', {
      key: 'ArrowUp',
      metaKey: true,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.focusedIndex).toBe(0);
  });

  it('allows the user to navigate through arrow keys', () => {
    const wrapper = createWrapper();
    wrapper.trigger('keydown.down');
    expect(wrapper.vm.focusedIndex).toBe(1);

    wrapper.trigger('keydown.up');
    expect(wrapper.vm.focusedIndex).toBe(0);
  });

  it('resets the `externalFocusChange` property', () => {
    const wrapper = createWrapper();
    wrapper.setData({ externalFocusChange: true });
    wrapper.trigger('keydown.down');
    expect(wrapper.vm.focusedIndex).toBe(1);
    expect(wrapper.vm.externalFocusChange).toBe(false);

    wrapper.setData({ externalFocusChange: true });
    wrapper.trigger('keydown.up');
    expect(wrapper.vm.focusedIndex).toBe(0);
    expect(wrapper.vm.externalFocusChange).toBe(false);

    wrapper.setData({ externalFocusChange: true });
    wrapper.trigger('keydown', {
      key: 'ArrowUp',
      metaKey: true,
    });
    expect(wrapper.vm.externalFocusChange).toBe(false);
  });

  it('prevents the user to navigate when meta, ctrl or shift keys are pressed', () => {
    const wrapper = createWrapper();
    wrapper.trigger('keydown', {
      key: 'down',
      metaKey: true,
    });
    expect(wrapper.vm.focusedIndex).toBe(0);

    wrapper.trigger('keydown', {
      key: 'down',
      ctrlKey: true,
    });
    expect(wrapper.vm.focusedIndex).toBe(0);

    wrapper.trigger('keydown', {
      key: 'down',
      shiftKey: true,
    });
    expect(wrapper.vm.focusedIndex).toBe(0);
  });
});
