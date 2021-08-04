/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import TypeIdentifierLink
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/TypeIdentifierLink.vue';

describe('TypeIdentifierLink', () => {
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

  const stubs = {
    'router-link': RouterLinkStub,
  };

  const defaultOpts = {
    propsData,
    slots,
    stubs,
    mocks: {
      $route: {
        query: {},
      },
    },
  };

  it('renders a span for unresolved references', () => {
    const wrapper = shallowMount(TypeIdentifierLink, defaultOpts);
    expect(wrapper.is('span.type-identifier-link')).toBe(true);
    expect(wrapper.text()).toBe(foo.title);
  });

  it('renders a link for resolved references', () => {
    const wrapper = shallowMount(TypeIdentifierLink, {
      ...defaultOpts,
      provide: {
        references: {
          [foo.identifier]: foo,
        },
      },
    });

    expect(wrapper.is('.type-identifier-link')).toBe(true);
    const link = wrapper.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.classes('type-identifier-link')).toBe(true);
    expect(link.props('to')).toBe(foo.url);
    expect(link.text()).toBe(foo.title);
  });
});
