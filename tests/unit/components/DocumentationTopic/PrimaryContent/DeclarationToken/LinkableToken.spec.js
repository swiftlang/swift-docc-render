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
    expect(wrapper.element.tagName.toLowerCase() === 'span').toBe(true);
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

    const link = wrapper.findComponent(Reference);
    expect(link.exists()).toBe(true);
    expect(link.props('url')).toBe(foo.url);
    expect(link.text()).toBe(foo.title);
  });
});
