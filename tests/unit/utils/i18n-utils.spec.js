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
      code: 'en-US',
      name: 'English',
    },
    {
      code: 'zh-CN',
      name: '简体中文',
    },
  ]
));

jest.mock('docc-render/utils/metadata', () => ({
  updateLangTag: jest.fn(),
}));

const to = {
  params: {
    locale: 'zh-CN',
  },
};

const env = {
  $i18n: {
    locale: 'en-US',
  },
};

describe('localeIsValid', () => {
  it('checks that locale is inside locales', () => {
    expect(localeIsValid('en-US')).toBe(true);
    expect(localeIsValid('es-ES')).toBe(false);
  });
});

describe('updateCurrentLocale', () => {
  it('updates current global var for locale', () => {
    updateCurrentLocale(to, env);
    expect(env.$i18n.locale).toBe('zh-CN');
    expect(updateLangTag).toHaveBeenCalledTimes(1);
  });
});
