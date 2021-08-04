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
import CallToActionButton from 'docc-render/components/CallToActionButton.vue';

const { ButtonLink, DestinationDataProvider } = CallToActionButton.components;

describe('CallToActionButton', () => {
  const propsData = {
    action: {
      identifier: 'topic://com.example.foo/bar',
      isActive: true,
      overridingTitle: 'Get Started',
      type: 'reference',
    },
    isDark: true,
  };
  let wrapper;

  const provide = {
    references: {
      [propsData.action.identifier]: {
        title: 'Foo Bar',
        url: '/foo/bar',
      },
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(CallToActionButton, {
      propsData,
      stubs: { DestinationDataProvider },
      provide,
    });
  });

  it('renders a `ButtonLink`', () => {
    const btn = wrapper.find(ButtonLink);
    expect(btn.exists()).toBe(true);
    expect(btn.props('url')).toBe(provide.references[propsData.action.identifier].url);
    expect(btn.props('isDark')).toBe(propsData.isDark);
    expect(btn.text()).toBe(propsData.action.overridingTitle);
  });

  it('renders a `DestinationDataProvider`', () => {
    const provider = wrapper.find(DestinationDataProvider);
    expect(provider.exists()).toBe(true);
    expect(provider.props('destination')).toBe(propsData.action);
  });
});
