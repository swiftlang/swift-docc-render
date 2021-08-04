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
import apiChangesObserving from 'docc-render/mixins/apiChangesObserving';

const availableOptions = new Set(['latest_major', 'latest_minor']);

const createWrapperWithQuery = changeQuery => (
  shallowMount({
    name: 'TestComponentForapiChangesObserving',
    mixins: [apiChangesObserving],
    render() {
      return '<div/>';
    },
    computed: {
      availableOptions: () => availableOptions,
    },
  }, {
    provide: {
      store: {
        setAPIChanges: jest.fn(),
      },
    },
    mocks: {
      $route: {
        query: {
          changes: changeQuery,
        },
      },
      $router: {
        push: jest.fn(),
      },
    },
  })
);

describe('apiChangesObserving', () => {
  let wrapper;

  it('turns `shouldDisplayChangesNav` true only when `selectedAPIChangesVersion` has available options', () => {
    const validChangeQuery = 'latest_major';
    const notValidChangeQuery = 'blah';

    wrapper = createWrapperWithQuery(notValidChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);

    wrapper = createWrapperWithQuery(validChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);

    wrapper.vm.selectedAPIChangesVersion = notValidChangeQuery;
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);

    // make sure that if null is passed, the result is Boolean
    wrapper.vm.selectedAPIChangesVersion = null;
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
  });
});
