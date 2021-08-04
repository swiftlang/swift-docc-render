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
import { getSetting } from '@/utils/theme-settings';

let pageTitle = require('docc-render/mixins/pageTitle').default;

jest.mock('docc-render/utils/theme-settings', () => ({
  getSetting: jest.fn((val, fallback) => fallback),
}));

const createWrapper = params => shallowMount({
  name: 'ComponentWithPageTitle',
  mixins: [pageTitle],
  render() {
    return null;
  },
  computed: {
    pageTitle() {
      return 'Foobar';
    },
  },
}, params);

describe('pageTitle', () => {
  it('Uses the `VUE_APP_TITLE` ENV var', () => {
    const defaultPageTitle = 'Foo Docs';

    process.env.VUE_APP_TITLE = defaultPageTitle;
    const expectedTitle = `Foobar | ${defaultPageTitle}`;
    expect(document.title).not.toBe(expectedTitle);
    createWrapper();
    expect(document.title).toBe(expectedTitle);
  });

  it('sets the document title using the provided `theme-settings` title', () => {
    process.env.VUE_APP_TITLE = 'Bar';
    getSetting.mockImplementationOnce(() => 'Foo');
    const expectedTitle = 'Foobar | Foo';
    expect(document.title).not.toBe(expectedTitle);
    createWrapper();
    expect(document.title).toBe(expectedTitle);
  });

  it('does not set a page title suffix, if both `theme-settings` and `VUE_APP_TITLE` is falsy', () => {
    process.env.VUE_APP_TITLE = '';
    // eslint-disable-next-line
    pageTitle = require('docc-render/mixins/pageTitle').default;
    const expectedTitle = 'Foobar';
    expect(document.title).not.toBe(expectedTitle);
    createWrapper();
    expect(document.title).toBe(expectedTitle);
  });
});
