/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import LocaleSelector from 'docc-render/components/LocaleSelector.vue';
import { updateLocale, getLocaleParam } from 'docc-render/utils/i18n-utils';
import AppStore from 'docc-render/stores/AppStore';

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
    {
      code: 'ja-JP',
      name: '日本語',
      slug: 'ja',
    },
    {
      code: 'ko-KR',
      name: '한국어',
      slug: 'ko-KR',
    },
  ]
));

jest.mock('docc-render/utils/i18n-utils', () => ({
  updateLocale: jest.fn(),
  getLocaleParam: jest.fn(),
}));

jest.mock('docc-render/stores/AppStore', () => ({
  setPreferredLocale: jest.fn(),
  state: { availableLocales: ['en-US', 'zh-CN'] },
}));

const { ChevronThickIcon } = LocaleSelector.components;
const availableLocales = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR'];

describe('LocaleSelector', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(LocaleSelector, {
      mocks: {
        $router: {
          push: jest.fn(),
        },
      },
      propsData: {
        availableLocales,
      },
    });
  });

  it('renders the locale selector', () => {
    expect(wrapper.element.matches('div.locale-selector')).toBe(true);
    expect(wrapper.findComponent('select').exists()).toBe(true);
  });

  it('updates router when option is selected', () => {
    const cnOption = wrapper.findAll('option').at(1);
    const slug = cnOption.attributes('value');
    cnOption.trigger('change');

    expect(updateLocale).toHaveBeenCalledTimes(1);
    expect(getLocaleParam).toHaveBeenCalledTimes(1);
    expect(getLocaleParam).toHaveBeenCalledWith(slug);
    expect(AppStore.setPreferredLocale).toHaveBeenCalledTimes(1);
    expect(AppStore.setPreferredLocale).toHaveBeenCalledWith(slug);
  });

  it('renders the icon', () => {
    expect(wrapper.findComponent(ChevronThickIcon).exists()).toBe(true);
  });

  it('only renders available locales for options', () => {
    const options = wrapper.findAll('option');
    expect(options).toHaveLength(2);
    expect(options.at(0).text()).toBe('English');
    expect(options.at(0).attributes('value')).toBe('en');
    expect(options.at(0).attributes('lang')).toBe('en-US');

    expect(options.at(1).text()).toBe('简体中文');
    expect(options.at(1).attributes('value')).toBe('cn');
    expect(options.at(1).attributes('lang')).toBe('zh-CN');
  });
});
