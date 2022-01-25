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
import { addMetadata } from 'docc-render/utils/metadata';
import metadata from 'docc-render/mixins/metadata';

jest.mock('docc-render/utils/metadata', () => ({
  addMetadata: jest.fn(),
}));

const pageData = {
  title: 'Title',
  description: 'Description',
  path: '/path',
};

const createWrapper = ({ title, description, path }) => (
  shallowMount({
    name: 'TestComponent',
    mixins: [metadata],
    render() {
      return '<div/>';
    },
    computed: {
      pageTitle: () => title,
      pageDescription: () => description,
    },
  }, {
    mocks: {
      $route: {
        path,
      },
    },
  })
);

describe('metadata', () => {
  it('calls addMetadata function when component is created', () => {
    createWrapper(pageData);
    expect(addMetadata).toHaveBeenCalledTimes(1);
    expect(addMetadata).toHaveBeenCalledWith(pageData);
  });
});
