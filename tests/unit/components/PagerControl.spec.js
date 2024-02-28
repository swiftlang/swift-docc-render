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
  it('renders a button with a chevron icon', () => {
    const wrapper = shallowMount(PagerControl, {
      propsData: {
        action: PagerControl.Action.next,
      },
    });
    expect(wrapper.classes()).toEqual(['pager-control', 'next']);

    const icon = wrapper.find(ChevronRoundedIcon);
    expect(icon.exists()).toBe(true);

    wrapper.setProps({ action: PagerControl.Action.previous });
    expect(wrapper.classes()).toEqual(['pager-control', 'previous']);
  });
});
