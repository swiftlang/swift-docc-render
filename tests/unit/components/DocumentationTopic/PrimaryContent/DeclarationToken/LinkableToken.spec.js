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
import LinkableToken
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/LinkableToken.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';

describe('LinkableToken', () => {
  const foo = {
    identifier: 'foo',
    title: 'Foo',
    url: '/documentation/foo',
  };

  const propsData = {
    identifier: foo.identifier,
  };

  const slots = {
    default: foo.title,
  };

  const defaultOpts = {
    propsData,
    slots,
    mocks: {
      $route: {
        query: {},
      },
    },
    provide: {
      store: {
        state: {
          references: {},
        },
      },
    },
  };

  it('renders a span for unresolved references', () => {
    const wrapper = shallowMount(LinkableToken, defaultOpts);
    expect(wrapper.is('span')).toBe(true);
    expect(wrapper.text()).toBe(foo.title);
  });

  it('renders a link for resolved references', () => {
    const wrapper = shallowMount(LinkableToken, {
      ...defaultOpts,
      provide: {
        store: {
          state: {
            references: {
              [foo.identifier]: foo,
            },
          },
        },
      },
    });

    const link = wrapper.find(Reference);
    expect(link.exists()).toBe(true);
    expect(link.props('url')).toBe(foo.url);
    expect(link.text()).toBe(foo.title);
  });

  it('renders a span for inactive references', () => {
    const bar = {
      identifier: 'doc://Foo/documentation/foo/bar',
      title: 'Bar',
      url: '/documentation/foo/bar',
    };
    const references = { [bar.identifier]: bar };
    const wrapper = shallowMount(LinkableToken, {
      propsData: { identifier: bar.identifier },
      slots: { default: bar.title },
      provide: {
        store: {
          state: { references },
        },
      },
    });

    // active by default
    let reference = wrapper.find(Reference);
    expect(reference.exists()).toBe(true);
    expect(reference.props('url')).toBe(bar.url);
    expect(reference.text()).toBe(bar.title);

    // inactive when `includedArchiveIdentifiers` is non-empty and does not include id
    wrapper.setData({
      appState: {
        includedArchiveIdentifiers: ['Baz'],
      },
    });
    reference = wrapper.find(Reference);
    expect(reference.exists()).toBe(false);
    expect(wrapper.text()).toBe(bar.title);

    // active when `includedArchiveIdentifiers` is non-empty and includes id
    wrapper.setData({
      appState: {
        includedArchiveIdentifiers: ['Baz', 'Foo'],
      },
    });
    reference = wrapper.find(Reference);
    expect(reference.exists()).toBe(true);
    expect(reference.props('url')).toBe(bar.url);
    expect(reference.text()).toBe(bar.title);
  });
});
