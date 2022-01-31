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
import Vue from 'vue';
import { fetchAPIChangesForRoute } from 'docc-render/utils/data';
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/data');
let response = { changes: 'foo' };

fetchAPIChangesForRoute.mockResolvedValue(response);
const availableOptions = new Set(['latest_major', 'latest_minor']);

// mimic reactive $route
const $route = Vue.observable({
  path: 'foo/bar',
  query: {
    changes: null,
  },
});

const $router = {
  push: jest.fn(),
};

const store = {
  setAPIChanges: jest.fn(),
};

const createWrapperWithQuery = (changeQuery) => {
  $route.query.changes = changeQuery;
  return shallowMount({
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
      store,
    },
    mocks: {
      $route,
      $router,
    },
  });
};

describe('apiChangesObserving', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    wrapper.destroy();
  });
  it('turns `shouldDisplayChangesNav` true only when `selectedAPIChangesVersion` has available options', () => {
    const validChangeQuery = 'latest_major';
    const notValidChangeQuery = 'blah';

    wrapper = createWrapperWithQuery(notValidChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    wrapper.destroy();

    wrapper = createWrapperWithQuery(validChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);

    wrapper.vm.selectedAPIChangesVersion = notValidChangeQuery;
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);

    // make sure that if null is passed, the result is Boolean
    wrapper.vm.selectedAPIChangesVersion = null;
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);

    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);
  });

  it('turns `shouldDisplayChangesNav` true, on `$route.path` change, if there is a selected version', async () => {
    const validChangeQuery = 'latest_major';

    wrapper = createWrapperWithQuery(validChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    expect($router.push).toHaveBeenCalledTimes(0);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);
    expect(fetchAPIChangesForRoute).toHaveBeenLastCalledWith($route, validChangeQuery);
    $route.path = 'path/foo';
    await flushPromises();
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    // push is not called, because we have changes already
    expect($router.push).toHaveBeenCalledTimes(0);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(2);
    expect(fetchAPIChangesForRoute).toHaveBeenLastCalledWith($route, validChangeQuery);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(2);
    expect(store.setAPIChanges).toHaveBeenLastCalledWith(response);
  });

  it('does not fetch, on `path` change, if there is no version', async () => {
    wrapper = createWrapperWithQuery(null);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    expect($router.push).toHaveBeenCalledTimes(0);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(0);
    $route.path = 'path/bar';
    await flushPromises();
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    // push is not called, because we have changes already
    expect($router.push).toHaveBeenCalledTimes(0);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(0);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(0);
  });

  it('updates the route, if only the query changed', async () => {
    wrapper = createWrapperWithQuery('latest_major');
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    expect($router.push).toHaveBeenCalledTimes(0);
    await flushPromises();
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);
    expect($router.push).toHaveBeenCalledTimes(0);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(1);
    $route.query.changes = 'latest_minor';
    await flushPromises();
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(2);
    expect($router.push).toHaveBeenCalledTimes(1);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(2);
  });
});
