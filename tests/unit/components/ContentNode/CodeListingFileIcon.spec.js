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
import CodeListingFileIcon from 'docc-render/components/ContentNode/CodeListingFileIcon.vue';
import SwiftFileIcon from 'theme/components/Icons/SwiftFileIcon.vue';
import GenericFileIcon from 'theme/components/Icons/GenericFileIcon.vue';

const mount = fileType => (
  shallowMount(CodeListingFileIcon, {
    propsData: { fileType },
  })
);

describe('CodeListingIcon', () => {
  it('renders the Swift icon for Swift files', () => {
    const wrapper = mount('swift');

    expect(wrapper.find(SwiftFileIcon).exists()).toBe(true);
    expect(wrapper.find(GenericFileIcon).exists()).toBe(false);
  });

  it('renders the generic icon for other file extensions', () => {
    const wrapper = mount('json');

    expect(wrapper.find(SwiftFileIcon).exists()).toBe(false);
    expect(wrapper.find(GenericFileIcon).exists()).toBe(true);
  });
});
