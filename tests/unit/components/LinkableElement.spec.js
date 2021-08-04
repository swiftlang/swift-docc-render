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

import LinkableElement from 'docc-render/components/LinkableElement.vue';
import TopicStore from 'docc-render/stores/TopicStore';

describe('LinkableElement', () => {
  let wrapper;

  beforeEach(() => {
    TopicStore.reset();
    wrapper = shallowMount(LinkableElement, {
      propsData: {
        anchor: 'foo',
        title: 'Foo',
      },
      provide: {
        store: TopicStore,
      },
      slots: {
        default: '<p>bar</p>',
      },
    });
  });

  it('renders a div with an id', () => {
    expect(wrapper.is('div#foo')).toBe(true);
  });

  it('renders with an optionally provided top level tag', () => {
    wrapper.setProps({ tag: 'h2' });
    expect(wrapper.is('h2#foo')).toBe(true);
  });

  it('renders slot content', () => {
    expect(wrapper.contains('p'));
    expect(wrapper.text()).toBe('bar');
  });

  it('shrinks the bottom intersection root margin by 50%', () => {
    expect(wrapper.vm.intersectionRootMargin).toBe('0% 0% -50% 0%');
  });

  describe('created', () => {
    it('updates the store', () => {
      expect(TopicStore.state.linkableSections).toEqual([
        {
          anchor: 'foo',
          depth: 0,
          sectionNumber: 0,
          title: 'Foo',
          visibility: 0,
        },
      ]);
    });
  });

  describe('onIntersect', () => {
    beforeEach(() => {
      wrapper.vm.onIntersect({ intersectionRatio: 0.42 });
    });

    it('updates the visibility of the section in the store', () => {
      expect(TopicStore.state.linkableSections).toEqual([
        {
          anchor: 'foo',
          depth: 0,
          sectionNumber: 0,
          title: 'Foo',
          visibility: 0.42,
        },
      ]);
    });
  });
});

describe('with navbar', () => {
  it('shrinks the top intersection root margin by the height of the navbar', () => {
    const wrapper = shallowMount(LinkableElement, {
      propsData: {
        anchor: 'foo',
        title: 'Foo',
      },
      provide: {
        navigationBarHeight: 52,
      },
    });
    expect(wrapper.vm.intersectionRootMargin).toBe('-52px 0% -50% 0%');
  });
});
