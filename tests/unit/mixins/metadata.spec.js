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
import { addOrUpdateMetadata } from 'docc-render/utils/metadata';
import metadata from 'docc-render/mixins/metadata';

jest.mock('docc-render/utils/metadata', () => ({
  addOrUpdateMetadata: jest.fn(),
}));

const pageData = {
  title: 'Title',
  description: 'Description',
  path: '/path',
};
const expectedMetadata = {
  title: pageData.title,
  description: pageData.description,
  url: `http://localhost${pageData.path}`,
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
  it('calls addOrUpdateMetadata function when component is created', () => {
    createWrapper(pageData);
    expect(addOrUpdateMetadata).toHaveBeenCalledTimes(1);
    expect(addOrUpdateMetadata).toHaveBeenCalledWith(expectedMetadata);
  });

  describe('.extractFirstParagraphText', () => {
    it('returns the first paragraph of plaintext for a given content tree', () => {
      // A content node tree corresponding to the following markdown:
      // a _*b*_ c
      const content = [
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'a ',
            },
            {
              type: 'emphasis',
              inlineContent: [
                {
                  type: 'strong',
                  inlineContent: [
                    {
                      type: 'text',
                      text: 'b',
                    },
                  ],
                },
              ],
            },
            {
              type: 'text',
              text: ' c',
            },
          ],
        },
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'blah',
            },
          ],
        },
      ];
      const wrapper = createWrapper(pageData);
      expect(wrapper.vm.extractFirstParagraphText(content)).toBe('a b c');
      expect(wrapper.vm.extractFirstParagraphText([])).toBe('');
    });
  });
});
