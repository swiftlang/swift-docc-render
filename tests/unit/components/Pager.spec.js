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
    const indicators = wrapper.findAll('.indicator');

    let pages = wrapper.findAll('.page');
    expect(pages.at(0).classes('active')).toBe(true);
    expect(pages.at(1).classes('active')).toBe(false);
    expect(pages.at(2).classes('active')).toBe(false);

    await indicators.at(1).trigger('click');

    pages = wrapper.findAll('.page');
    expect(pages.at(0).classes('active')).toBe(false);
    expect(pages.at(1).classes('active')).toBe(true);
    expect(pages.at(2).classes('active')).toBe(false);

    await indicators.at(2).trigger('click');

    pages = wrapper.findAll('.page');
    expect(pages.at(0).classes('active')).toBe(false);
    expect(pages.at(1).classes('active')).toBe(false);
    expect(pages.at(2).classes('active')).toBe(true);
  });

  it('renders page with no indicators with only a single page', () => {
    const wrapper = shallowMount(Pager, {
      propsData: {
        pages: ['foobar'],
      },
    });

    expect(wrapper.findAll('.page').length).toBe(1);
    expect(wrapper.findAll('.page.active').length).toBe(1);
    expect(wrapper.findAll('.indicator').length).toBe(0);
  });
});
