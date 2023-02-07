/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { localeIsValid, updateCurrentLocale } from '@/utils/i18n-utils';
import { updateLangTag } from 'docc-render/utils/metadata';

jest.mock('docc-render/lang/locales.json', () => (
  [
    {
      code: 'en',
      name: 'English',
    },
    {
      code: 'cn',
      name: '简体中文',
    },
  ]
));

jest.mock('docc-render/utils/metadata', () => ({
  updateLangTag: jest.fn(),
}));

const to = {
  params: {
    locale: 'cn',
  },
};

const env = {
  $i18n: {
    locale: 'en',
  },
};

describe('localeIsValid', () => {
  it('checks that locale is inside locales', () => {
    expect(localeIsValid('en')).toBe(true);
    expect(localeIsValid('es')).toBe(false);
  });
});

describe('updateCurrentLocale', () => {
  it('updates current global var for locale', () => {
    updateCurrentLocale(to, env);
    expect(env.$i18n.locale).toBe('cn');
    expect(updateLangTag).toHaveBeenCalledTimes(1);
  });
});
