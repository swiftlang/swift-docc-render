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
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import OnThisPageNav from 'docc-render/components/DocumentationTopic/Summary/OnThisPageNav.vue';

const {
  List,
  ListItem,
  Section,
  Title,
  InlineChevronDownCircleIcon,
} = OnThisPageNav.components;

describe('OnThisPageNav', () => {
  let wrapper;
  let nav;
  let list;

  const propsData = {
    sections: [
      {
        anchor: 'foo',
        title: 'Foo',
      },
      {
        anchor: 'bar',
        title: 'Bar',
      },
    ],
  };

  const stubs = {
    'router-link': RouterLinkStub,
  };

  const mocks = {
    $route: {
      query: {},
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(OnThisPageNav, {
      propsData,
      stubs,
      mocks,
    });
    nav = wrapper.find('nav');
    list = nav.find(List);
  });

  it('renders a `Section` root with a <nav>', () => {
    expect(wrapper.is('.on-this-page')).toBe(true);

    const section = wrapper.find(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes('on-this-page')).toBe(true);

    expect(section.contains('nav[aria-labelledby="on-this-page-title"]')).toBe(true);
  });

  it('renders a `Title` in the nav', () => {
    const title = nav.find(Title);
    expect(title.exists()).toBe(true);
    expect(title.attributes('id')).toBe('on-this-page-title');
    expect(title.text()).toBe('On This Page');
  });

  it('renders a `List` in the nav', () => {
    expect(nav.contains(List)).toBe(true);
  });

  it('renders a `ListItem` and link to each section anchor', () => {
    const items = list.findAll(ListItem);
    expect(items.length).toBe(propsData.sections.length);

    const firstLink = items.at(0).find(RouterLinkStub);
    expect(firstLink.exists()).toBe(true);
    expect(firstLink.props('to')).toBe('#foo');
    expect(firstLink.text()).toBe('Foo');

    const lastLink = items.at(1).find(RouterLinkStub);
    expect(lastLink.exists()).toBe(true);
    expect(lastLink.props('to')).toBe('#bar');
    expect(lastLink.text()).toBe('Bar');
  });

  it('renders an icon holder with nbsp in it', () => {
    const iconHolder = wrapper.find('.icon-holder');
    // make sure we have an nbsp in there
    expect(iconHolder.element.textContent).toEqual('\u00a0');
    const icon = iconHolder.find('.link-icon');
    expect(icon.exists()).toBe(true);
    expect(icon.is(InlineChevronDownCircleIcon)).toBe(true);
  });

  it('it includes query parameters in the section URLs', () => {
    wrapper = shallowMount(OnThisPageNav, {
      propsData,
      stubs,
      mocks: {
        ...mocks,
        $route: {
          query: {
            language: 'awesome-language',
          },
        },
      },
    });

    const firstItem = wrapper.find(RouterLinkStub);
    expect(firstItem.props('to')).toBe('?language=awesome-language#foo');
  });
});
