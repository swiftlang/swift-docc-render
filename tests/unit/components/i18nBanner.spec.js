/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import SuggestLang from 'docc-render/components/SuggestLang.vue';
import AppStore from 'docc-render/stores/AppStore';
import { getLocaleParam, getCodeForSlug } from 'docc-render/utils/i18n-utils';

jest.mock('docc-render/utils/i18n-utils', () => ({
  getCodeForSlug: jest.fn(value => value),
  getLocaleParam: jest.fn(() => ({
    locale: undefined,
  })),
}));

jest.mock('docc-render/stores/AppStore', () => ({
  setPreferredLocale: jest.fn(),
  state: {
    preferredLocale: '',
  },
}));

window.navigator = jest.fn().mockReturnValue({
  language: 'en-GB',
});

const params = {
  locale: undefined,
};

const {
  InlineChevronRightIcon,
  CloseIcon,
} = SuggestLang.components;

const matchingLocale = 'en-US';

const messages = {
  [matchingLocale]: { 'view-in': 'View in English' },
};

const currentLocale = 'zh-CN';

describe('SuggestLang', () => {
  let wrapper;
  let link;
  let closeIcon;

  beforeEach(() => {
    wrapper = shallowMount(SuggestLang, {
      stubs: { 'router-link': RouterLinkStub },
      mocks: {
        $i18n: {
          messages,
          locale: currentLocale,
        },
      },
    });

    link = wrapper.findComponent('.suggest-lang__link');
    closeIcon = wrapper.findComponent('.suggest-lang__close-icon-button');
  });

  it('renders a <SuggestLang> if preferredLocale is different to currentLocale', () => {
    expect(wrapper.is('.suggest-lang')).toBe(true);
  });

  it('renders a router link with the preferredLocale view-in text and lang tag using the matching locale', () => {
    expect(link.text()).toBe(messages[matchingLocale]['view-in']);
    expect(getCodeForSlug).toHaveBeenCalledWith(matchingLocale);
    expect(link.attributes('lang')).toBe(matchingLocale);
  });

  it('sets the preferred locale when router link is clicked', () => {
    link.trigger('click');

    expect(AppStore.setPreferredLocale).toHaveBeenCalledWith(matchingLocale);
  });

  it('takes you to the preferredLocale url when clicking in router link', () => {
    link.trigger('click');

    expect(getLocaleParam).toHaveBeenCalledWith(matchingLocale);
    expect(link.props('to')).toEqual(params);
  });

  it('renders a InlineChevronRightIcon', () => {
    expect(wrapper.findComponent(InlineChevronRightIcon).exists()).toBe(true);
  });

  it('renders a close icon', () => {
    expect(closeIcon.exists()).toBe(true);
    expect(wrapper.findComponent(CloseIcon).exists()).toBe(true);
    expect(closeIcon.attributes('aria-label')).toBe('continue-viewing');
  });

  it('set PreferredLocale as current locale when close icon is clicked', () => {
    closeIcon.trigger('click');
    expect(AppStore.setPreferredLocale).toHaveBeenCalledWith(currentLocale);
  });
});
