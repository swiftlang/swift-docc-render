/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable camelcase */
import ar from './locales/ar.json';
import en_US from './locales/en-US.json';
import zh_CN from './locales/zh-CN.json';
import ja_JP from './locales/ja-JP.json';
import ko_KR from './locales/ko-KR.json';

// default locale
export const defaultLocale = process.env.VUE_APP_DEFAULT_LOCALE ?? 'en-US';
// translated locales
export const messages = {
  ar,
  'en-US': en_US,
  'zh-CN': zh_CN,
  'ja-JP': ja_JP,
  'ko-KR': ko_KR,
};
