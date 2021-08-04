/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import CodeListingFilename from 'docc-render/components/ContentNode/CodeListingFilename.vue';
import CodeListingFileIcon from 'docc-render/components/ContentNode/CodeListingFileIcon.vue';

const mount = (fileName, isActionable) => (
  shallowMount(CodeListingFilename, {
    propsData: {
      isActionable,
      fileType: 'swift',
    },
    slots: { default: fileName },
  })
);

describe('CodeListingFilename', () => {
  const fileName = 'myfile';

  it('renders a span when `isFileNameActionable=false`', () => {
    const wrapper = mount(fileName, false);

    const span = wrapper.find('span');
    expect(span.exists()).toBe(true);
    expect(span.text()).toBe(fileName);
  });

  it('renders an anchor when `isFileNameActionable=true` and emits an event when clicked', () => {
    const wrapper = mount(fileName, true);

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe(fileName);

    link.trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();
  });

  it('renders a file icon', () => {
    const wrapper = mount(fileName, false);

    const fileIcon = wrapper.find(CodeListingFileIcon);
    expect(fileIcon.exists()).toBe(true);
    expect(fileIcon.props('fileType')).toBe('swift');
  });
});
