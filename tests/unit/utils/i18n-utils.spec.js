/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { localeIsValid, updateLocale, getLocaleParam } from '@/utils/i18n-utils';
import { updateLangTag } from 'docc-render/utils/metadata';

jest.mock('theme/lang/locales.json', () => (
  [
    {
      code: 'en-US',
      name: 'English',
      slug: 'en',
    },
    {
      code: 'zh-CN',
      name: '简体中文',
      slug: 'cn',
    },
  ]
));

jest.mock('docc-render/utils/metadata', () => ({
  updateLangTag: jest.fn(),
}));

jest.mock('theme/lang/index.js', () => ({
  defaultLocale: 'en',
}));

const params = slug => ({
  params: {
    locale: slug,
  },
});

const to = params('cn');

const env = {
  $i18n: {
    locale: 'en',
  },
};

describe('localeIsValid', () => {
  it('checks that locale is inside locales', () => {
    expect(localeIsValid('en')).toBe(true);
    expect(localeIsValid('es-ES')).toBe(false);
  });
});

describe('updateLocale', () => {
  it('updates current global var for locale', () => {
    updateLocale(to.params.locale, env);
    expect(env.$i18n.locale).toBe('cn');
    expect(updateLangTag).toHaveBeenCalledTimes(1);
  });
});

describe('getLocaleParam', () => {
  it('returns a params object', () => {
    expect(getLocaleParam('cn')).toEqual(params('cn'));
    expect(getLocaleParam('en')).toEqual(params(undefined));
  });
});
