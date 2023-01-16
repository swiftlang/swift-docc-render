/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Vue from 'vue';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import OnThisPageNav from '@/components/OnThisPageNav.vue';
import { AppTopID } from '@/constants/AppTopID';
import WordBreak from '@/components/WordBreak.vue';
import { createEvent, flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/throttle', () => jest.fn(v => v));
jest.mock('docc-render/utils/loading', () => ({ waitFrames: jest.fn() }));
const sections = [
  { title: 'Title', level: 1, anchor: AppTopID },
  { title: 'First', level: 2, anchor: 'first' },
  { title: 'Second', level: 3, anchor: 'second' },
  { title: 'Third', level: 2, anchor: 'third' },
];
const store = {
  state: Vue.observable({
    onThisPageSections: sections,
    currentPageAnchor: 'first',
  }),
  setCurrentPageSection: jest.fn((anchor) => {
    store.state.currentPageAnchor = anchor;
  }),
};

// some initial values to make math easy
const innerHeight = 500;
const scrollHeight = 1000;
const titleTop = 0; // very top
const firstTop = 100; // not at the top directly
const secondTop = 450;
const thirdTop = 900;
const intersectionPoint = innerHeight * 0.3;

window.scrollY = 0;
window.innerHeight = innerHeight;
Object.defineProperty(document.body, 'scrollHeight', {
  value: scrollHeight,
});
let wrapper;
jest.spyOn(document, 'getElementById').mockImplementation((anchor) => {
  switch (anchor) {
  case AppTopID:
    return { offsetTop: titleTop };
  case 'first':
    return { offsetTop: firstTop };
  case 'second':
    return { offsetTop: secondTop };
  default:
    return { offsetTop: thirdTop };
  }
});

const $route = {
  query: {
    language: 'objc',
  },
};

const createWrapper = () => {
  wrapper = shallowMount(OnThisPageNav, {
    provide: {
      store,
    },
    stubs: {
      RouterLink: RouterLinkStub,
    },
    mocks: {
      $route,
    },
  });
};
const scrollWindowBy = async (px) => {
  window.scrollY = px;
  window.dispatchEvent(createEvent('scroll'));
  await flushPromises();
};
describe('OnThisPageNav', () => {
  beforeEach(() => {
    if (wrapper) wrapper.destroy();
    jest.clearAllMocks();
    window.scrollY = 0;
  });
  it('renders the OnThisPageNav, as flat list of items', () => {
    createWrapper();
    const parents = wrapper.findAll('.parent-item');
    // assert parents
    expect(parents).toHaveLength(3);
    // assert first parent
    const firstParent = parents.at(0);
    const parentLink1 = firstParent.find('.base-link');
    // assert first parent is active
    expect(firstParent.classes()).not.toContain('active');
    expect(parentLink1.props('to')).toEqual(`?language=objc#${sections[0].anchor}`);
    expect(parentLink1.find(WordBreak).text()).toBe(sections[0].title);
    // assert second parent
    const secondParent = parents.at(1);
    expect(secondParent.classes()).toContain('active');
    expect(secondParent.find(RouterLinkStub).props('to')).toEqual(`?language=objc#${sections[1].anchor}`);
    expect(secondParent.find(WordBreak).text()).toBe(sections[1].title);
    // assert "children" items
    const children = wrapper.findAll('.child-item');
    expect(children).toHaveLength(1);
    // assert child is not active
    expect(children.at(0).classes()).not.toContain('active');
    const childLink = children.at(0).find(RouterLinkStub);
    expect(childLink.classes()).toEqual(['base-link']);
    expect(childLink.props('to')).toEqual(`?language=objc#${sections[2].anchor}`);
    // assert third parent
    const thirdParent = parents.at(2);
    expect(thirdParent.classes()).not.toContain('active');
    expect(thirdParent.find(RouterLinkStub).props('to')).toEqual(`?language=objc#${sections[3].anchor}`);
    expect(thirdParent.find('.children').exists()).toBe(false);
  });

  it('sets the first item as active, if at the top', async () => {
    createWrapper();
    await flushPromises();
    expect(store.setCurrentPageSection).toHaveBeenCalledTimes(1);
    expect(store.setCurrentPageSection)
      .toHaveBeenCalledWith(sections[0].anchor);
  });

  it('sets the last item as active, if at the bottom', async () => {
    window.scrollY = scrollHeight;
    createWrapper();
    await flushPromises();
    expect(store.setCurrentPageSection).toHaveBeenCalledTimes(1);
    expect(store.setCurrentPageSection)
      .toHaveBeenCalledWith(sections[3].anchor);
  });

  it('updates the active item on scroll', async () => {
    createWrapper();
    await flushPromises();
    const parents = wrapper.findAll('.parent-item');
    const child = wrapper.find('.child-item');

    expect(store.setCurrentPageSection).toHaveBeenCalledTimes(1);
    // intersection point would be 250(150+100), which is not reaching second item
    await scrollWindowBy(firstTop);
    expect(store.setCurrentPageSection).toHaveBeenCalledTimes(2);
    expect(store.setCurrentPageSection).toHaveBeenLastCalledWith(sections[1].anchor);
    expect(parents.at(0).classes()).not.toContain('active');
    expect(parents.at(1).classes()).toContain('active');
    expect(parents.at(2).classes()).not.toContain('active');
    // intersection point would be 600(150+450), which is passed 450 for the second,
    // but not near third
    await scrollWindowBy(secondTop);
    expect(store.setCurrentPageSection).toHaveBeenLastCalledWith(sections[2].anchor);
    // assert the parent is not set as active by default
    expect(parents.at(0).classes()).not.toContain('active');
    expect(parents.at(1).classes()).not.toContain('active');
    expect(child.classes()).toContain('active');
    expect(parents.at(2).classes()).not.toContain('active');
    // scroll to 900, which is beyond the third
    await scrollWindowBy(thirdTop - intersectionPoint);
    expect(store.setCurrentPageSection).toHaveBeenLastCalledWith(sections[3].anchor);
    // assert active items
    expect(parents.at(0).classes()).not.toContain('active');
    expect(parents.at(1).classes()).not.toContain('active');
    expect(child.classes()).not.toContain('active');
    expect(parents.at(2).classes()).toContain('active');
    await scrollWindowBy(titleTop);
    expect(store.setCurrentPageSection).toHaveBeenLastCalledWith(sections[0].anchor);
  });
});
