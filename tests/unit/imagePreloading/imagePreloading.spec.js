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
  createLocalVue,
  mount,
  RouterLinkStub,
} from '@vue/test-utils';
import fs from 'fs';
import path from 'path';
import Router from 'vue-router';

import hide from 'docc-render/directives/hide';

import Topic from 'docc-render/views/Topic.vue';
import createRouterInstance from 'docc-render/setup-utils/SwiftDocCRenderRouter';

const router = createRouterInstance();

jest.mock('docc-render/utils/theme-settings');

const topicData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tutorial.json')));

const localVue = createLocalVue();
localVue.directive('hide', hide);
localVue.use(Router);

// Mock DOM APIs.
window.matchMedia = jest.fn(() => ({
  addListener: jest.fn(),
  addEventListener: jest.fn(),
  matches: true,
}));
window.MediaSource = jest.fn(() => ({
  isTypeSupported: jest.fn(),
  addEventListener: jest.fn(),
}));
window.URL.createObjectURL = jest.fn();
window.HTMLMediaElement.prototype.addNextTrack = jest.fn();

// Retrieves all the image URLs from the references dictionary.
const allImageURLsFrom = references => (
  Object.values(references)
    .filter(({ type }) => type === 'image')
    .map(({ variants }) => variants.map(({ url }) => url))
    .map(([url]) => url)
);

// Util function to collect all elements from a `WrapperArray` into an Array.
const elementsFromWrapperArray = wrapperArray => (
  [...Array(wrapperArray.length).keys()]
    .map(index => wrapperArray.at(index))
);

describe('image preloading', () => {
  const assertHasAllImages = async (wrapper, references) => {
    await wrapper.vm.$nextTick();

    const domImageURLs = elementsFromWrapperArray(wrapper.findAll('img'))
      .map(image => image.attributes('src'));

    const referenceImageURLs = allImageURLsFrom(references);

    referenceImageURLs.forEach((url) => {
      if (!domImageURLs.includes(url)) {
        throw new Error(`Image ${url} is not in the DOM.`);
      }
    });
  };

  const mountOptions = {
    localVue,
    router,
    provide: {
      isTargetIDE: false,
    },
    mocks: {
      $bridge: {
        on: jest.fn(),
        off: jest.fn(),
        send: jest.fn(),
      },
    },
    stubs: {
      'router-link': RouterLinkStub,
      BreakpointEmitter: true,
    },
  };

  it('has all the images in the DOM on load in tutorial pages', async (done) => {
    const wrapper = mount(Topic, mountOptions);
    wrapper.setData({ topicData });
    await assertHasAllImages(wrapper, topicData.references);
    done();
  });
});
