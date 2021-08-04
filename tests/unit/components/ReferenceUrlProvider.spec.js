/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ReferenceUrlProvider from 'docc-render/components/ReferenceUrlProvider.vue';
import { shallowMount } from '@vue/test-utils';

const references = {
  'doc://com.example.Test/tutorials/TechnologyX/Getting-Started': {
    title: 'Getting Started',
    type: 'topic',
    url: '/tutorials/technologyx/getting-started',
  },
};

const propsData = {
  reference: 'doc://com.example.Test/tutorials/TechnologyX/Getting-Started',
};

const $route = {
  query: {
    context: 'foo',
  },
};

describe('ReferenceUrlProvider', () => {
  it('renders the ReferenceUrlProvider and provides url and title to scoped slot', () => {
    let assertProps;

    shallowMount(ReferenceUrlProvider, {
      propsData,
      provide: { references },
      scopedSlots: {
        default: (props) => {
          assertProps = props;
          return '';
        },
      },
      mocks: {
        $route,
      },
    });

    const reference = references['doc://com.example.Test/tutorials/TechnologyX/Getting-Started'];

    expect(assertProps).toEqual({
      title: reference.title,
      url: reference.url,
      urlWithParams: `${reference.url}?context=foo`,
      reference,
    });
  });
});
