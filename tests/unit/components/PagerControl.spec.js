/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shallowMount } from '@vue/test-utils';
import ChevronRoundedIcon from 'theme/components/Icons/ChevronRoundedIcon.vue';
import PagerControl from 'docc-render/components/PagerControl.vue';

describe('PagerControl', () => {
  it('renders a button with a chevron icon', async () => {
    const wrapper = shallowMount(PagerControl, {
      propsData: {
        action: PagerControl.Action.next,
      },
    });
    expect(wrapper.classes()).toEqual(['pager-control', 'next']);
    expect(wrapper.attributes('aria-label')).toBe('pager.control.navigate-next');

    const icon = wrapper.findComponent(ChevronRoundedIcon);
    expect(icon.exists()).toBe(true);

    await wrapper.setProps({ action: PagerControl.Action.previous });
    expect(wrapper.classes()).toEqual(['pager-control', 'previous']);
    expect(wrapper.attributes('aria-label')).toBe('pager.control.navigate-previous');
  });
});
