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
import { pathJoin } from 'docc-render/utils/assets';
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

  const relativePath = '/foo/bar';
  const absolutePath = 'http://example.com/foo/bar';

  let wrapper;

  const createProvide = references => ({
    store: {
      state: { references },
    },
  });

  const createReferences = ({ url }) => ({
    [propsData.action.identifier]: {
      title: 'Foo Bar',
      url,
    },
  });

  const createWrapper = ({ provide } = {}) => (
    shallowMount(CallToActionButton, {
      propsData,
      stubs: { DestinationDataProvider },
      provide: provide || createProvide(createReferences({ url: relativePath })),
    })
  );

  const baseUrl = '/base-prefix';

  it('renders a `ButtonLink` with relative path', () => {
    wrapper = createWrapper();
    const btn = wrapper.findComponent(ButtonLink);
    expect(btn.exists()).toBe(true);
    expect(btn.props('url')).toBe(relativePath);
    expect(btn.props('isDark')).toBe(propsData.isDark);
    expect(btn.text()).toBe(propsData.action.overridingTitle);
  });

  it('prefixes `ButtonLink` URL if baseUrl is provided', () => {
    window.baseUrl = baseUrl;
    wrapper = createWrapper();

    const btn = wrapper.findComponent(ButtonLink);
    expect(btn.props('url')).toBe(pathJoin([baseUrl, relativePath]));
  });

  it('does not prefix `ButtonLink` URL if baseUrl is provided but path is absolute', () => {
    window.baseUrl = baseUrl;
    wrapper = createWrapper({ provide: createProvide(createReferences({ url: absolutePath })) });
    expect(wrapper.findComponent(ButtonLink).props('url')).toBe(absolutePath);
  });

  it('renders a `DestinationDataProvider`', () => {
    wrapper = createWrapper();
    const provider = wrapper.findComponent(DestinationDataProvider);
    expect(provider.exists()).toBe(true);
    expect(provider.props('destination')).toBe(propsData.action);
  });
});
