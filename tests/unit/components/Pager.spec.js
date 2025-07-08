/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shallowMount } from '@vue/test-utils';
import Pager from 'docc-render/components/Pager.vue';
import { BreakpointAttributes } from 'docc-render/utils/breakpoints';

const GUTTERS_WIDTH = 174;

describe('Pager', () => {
  const propsData = {
    pages: [
      'foo',
      'bar',
      'qux',
    ],
  };

  beforeEach(() => {
    window.IntersectionObserver = jest.fn().mockReturnValue({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    });
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => fn());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  it('renders a root container with containers and indicators for each page', () => {
    const wrapper = shallowMount(Pager, { propsData });

    const pages = wrapper.findAll('.page');
    expect(pages.length).toBe(propsData.pages.length);

    const indicators = wrapper.findAll('.indicator');
    expect(indicators.length).toBe(propsData.pages.length);
  });

  it('collapses the controllers if contentWidth is smaller than the large contentWidth + the gutters width in large viewport', async () => {
    // set large viewport
    window.innerWidth = BreakpointAttributes.default.large.minWidth + 1;
    const wrapper = shallowMount(Pager, { propsData });
    wrapper.setData({
      appState: {
        contentWidth: BreakpointAttributes.default.large.contentWidth + GUTTERS_WIDTH + 10,
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).not.toContain('with-compact-controls');

    wrapper.setData({
      appState: {
        contentWidth: BreakpointAttributes.default.large.contentWidth + GUTTERS_WIDTH - 10,
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).toContain('with-compact-controls');
  });

  it('collapses the controllers if contentWidth is smaller than the medium contentWidth + the gutters width in medium viewport', async () => {
    // set medium viewport
    window.innerWidth = BreakpointAttributes.default.medium.maxWidth - 1;
    const wrapper = shallowMount(Pager, { propsData });

    wrapper.setData({
      appState: {
        contentWidth: BreakpointAttributes.default.medium.contentWidth + GUTTERS_WIDTH + 10,
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).not.toContain('with-compact-controls');

    wrapper.setData({
      appState: {
        contentWidth: BreakpointAttributes.default.medium.contentWidth + GUTTERS_WIDTH - 10,
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).toContain('with-compact-controls');
  });

  it('collapses the controllers in small viewports', () => {
    // set small viewport
    window.innerWidth = BreakpointAttributes.default.small.minWidth;
    const wrapper = shallowMount(Pager, { propsData });

    wrapper.setData({
      appState: {
        contentWidth: BreakpointAttributes.default.small.minWidth,
      },
    });

    expect(wrapper.classes()).toContain('with-compact-controls');
  });

  it('renders each page using provided slots', () => {
    const wrapper = shallowMount(Pager, {
      propsData,
      scopedSlots: {
        page: `
          <p>test: {{props.page}}</p>
        `,
      },
    });

    const pages = wrapper.findAll('.page p');
    expect(pages.length).toBe(propsData.pages.length);

    expect(pages.at(0).text()).toBe('test: foo');
    expect(pages.at(1).text()).toBe('test: bar');
    expect(pages.at(2).text()).toBe('test: qux');
  });

  it('renders with the first page active, which can be changed using indicators', async () => {
    const wrapper = shallowMount(Pager, { propsData });

    let pages = wrapper.findAll('.page');
    let indicators = wrapper.findAll('.indicator');
    expect(pages.at(0).classes()).toContain('active');
    expect(indicators.at(0).attributes('aria-current')).toBeTruthy();
    expect(pages.at(1).classes()).not.toContain('active');
    expect(indicators.at(1).attributes('aria-current')).toBeFalsy();
    expect(pages.at(2).classes()).not.toContain('active');
    expect(indicators.at(2).attributes('aria-current')).toBeFalsy();

    await indicators.at(1).trigger('click');

    pages = wrapper.findAll('.page');
    indicators = wrapper.findAll('.indicator');
    expect(pages.at(0).classes()).not.toContain('active');
    expect(indicators.at(0).attributes('aria-current')).toBeFalsy();
    expect(pages.at(1).classes()).toContain('active');
    expect(indicators.at(1).attributes('aria-current')).toBeTruthy();
    expect(pages.at(2).classes()).not.toContain('active');
    expect(indicators.at(2).attributes('aria-current')).toBeFalsy();

    await indicators.at(2).trigger('click');

    pages = wrapper.findAll('.page');
    indicators = wrapper.findAll('.indicator');
    expect(pages.at(0).classes()).not.toContain('active');
    expect(indicators.at(0).attributes('aria-current')).toBeFalsy();
    expect(pages.at(1).classes()).not.toContain('active');
    expect(indicators.at(1).attributes('aria-current')).toBeFalsy();
    expect(pages.at(2).classes()).toContain('active');
    expect(indicators.at(2).attributes('aria-current')).toBeTruthy();
  });

  it('renders only the page slot with a single page', () => {
    const wrapper = shallowMount(Pager, {
      propsData: {
        pages: ['foobar'],
      },
      scopedSlots: {
        page: `
          <p>test: {{props.page}}</p>
        `,
      },
    });

    expect(wrapper.findAll('.page').length).toBe(0);
    expect(wrapper.findAll('.page.active').length).toBe(0);
    expect(wrapper.findAll('.indicator').length).toBe(0);

    const p = wrapper.findComponent('.pager p');
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe('test: foobar');
  });
});
