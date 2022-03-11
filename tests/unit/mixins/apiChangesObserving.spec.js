/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, createLocalVue } from '@vue/test-utils';
import apiChangesObserving from 'docc-render/mixins/apiChangesObserving';
import VueRouter from 'vue-router';
import { fetchAPIChangesForRoute } from 'docc-render/utils/data';
import { flushPromises } from '../../../test-utils';

const localVue = createLocalVue();
localVue.use(VueRouter);

jest.mock('docc-render/utils/data');
const response = { changes: 'foo' };

fetchAPIChangesForRoute.mockResolvedValue(response);
const availableOptions = new Set(['latest_major', 'latest_minor']);

const router = new VueRouter({
  routes: [{
    path: '/foo/*',
    name: 'foo-bar',
    component: {
      name: 'Foo',
      template: '<div>Foo</div>',
    },
  }],
});

const store = {
  setAPIChanges: jest.fn(),
  setSelectedAPIChangesVersion: jest.fn(),
};

const createWrapperWithQuery = (changeQuery) => {
  router.push({
    query: {
      changes: changeQuery,
    },
  });
  // make sure we reset the counter
  jest.clearAllMocks();
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
    localVue,
    router,
    sync: false,
  });
};

const pushSpy = jest.spyOn(router, 'push');

describe('apiChangesObserving', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    wrapper.destroy();
  });

  it('turns `shouldDisplayChangesNav` true only when `selectedAPIChangesVersion` has available options', async () => {
    const validChangeQuery = 'latest_major';
    const notValidChangeQuery = 'blah';

    wrapper = createWrapperWithQuery(notValidChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(null);
    wrapper.destroy();

    wrapper = createWrapperWithQuery(validChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);

    wrapper.vm.selectedAPIChangesVersion = notValidChangeQuery;
    await flushPromises();
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({
      query: {
        changes: notValidChangeQuery,
      },
    });
    await flushPromises();
    await flushPromises();
    // called with null, because the API change version is invalid
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(null);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    // make sure that if null is passed, the result is Boolean
    wrapper.vm.selectedAPIChangesVersion = null;
    await flushPromises();
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(null);
  });

  it('re-fetches, when navigating and turns `shouldDisplayChangesNav` true, on `$route` change, if there is a selected version', async () => {
    const validChangeQuery = 'latest_major';

    wrapper = createWrapperWithQuery(validChangeQuery);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    expect(pushSpy).toHaveBeenCalledTimes(0);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);
    expect(fetchAPIChangesForRoute).toHaveBeenLastCalledWith(router.currentRoute, validChangeQuery);
    await flushPromises();
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(1);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledWith(validChangeQuery);
    // navigate to another route, with the same changes
    await router.push({
      path: '/foo/foo',
      query: { changes: validChangeQuery },
    });
    await flushPromises();
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    // push is not called, because we have changes already
    expect(pushSpy).toHaveBeenCalledTimes(1);
    // assert we fetched again
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(2);
    expect(fetchAPIChangesForRoute).toHaveBeenLastCalledWith(router.currentRoute, validChangeQuery);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(2);
    expect(store.setAPIChanges).toHaveBeenLastCalledWith(response);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(2);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(validChangeQuery);
  });

  it('does not re-fetch, on `$route` change, if there is no version', async () => {
    wrapper = createWrapperWithQuery();
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    expect(pushSpy).toHaveBeenCalledTimes(0);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(0);
    // its called twice, because of the way we handle watching of the state
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(2);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(null);
    await flushPromises();
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(2);
    await router.push('/foo/baz');
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(false);
    // push is not called, because we have changes already
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(0);
    // its called 3 times. One on mount, one on change
    expect(store.setAPIChanges).toHaveBeenCalledTimes(3);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(3);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(null);
  });

  it('updates the route, if only the query changed', async () => {
    const change = 'latest_major';
    wrapper = createWrapperWithQuery(change);
    expect(wrapper.vm.shouldDisplayChangesNav).toBe(true);
    expect(pushSpy).toHaveBeenCalledTimes(0);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(0);
    await flushPromises();
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledTimes(0);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(1);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(1);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith(change);
    await router.push({
      query: {
        changes: 'latest_minor',
      },
    });
    await flushPromises();
    expect(fetchAPIChangesForRoute).toHaveBeenCalledTimes(2);
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(store.setAPIChanges).toHaveBeenCalledTimes(2);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenCalledTimes(2);
    expect(store.setSelectedAPIChangesVersion).toHaveBeenLastCalledWith('latest_minor');
  });
});
