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
import ServerError from 'docc-render/views/ServerError.vue';

const { GenericError } = ServerError.components;

describe('ServerError', () => {
  it('renders a `GenericError`', () => {
    const wrapper = shallowMount(ServerError);
    const error = wrapper.findComponent(GenericError);
    expect(error.exists()).toBe(true);
  });
});
