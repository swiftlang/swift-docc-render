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
} from '@vue/test-utils';
import Nav from 'docc-render/components/TutorialsOverview/Nav.vue';
import TutorialsNavigation from 'docc-render/components/TutorialsOverview/TutorialsNavigation.vue';
import NavMenuItemBase from '@/components/NavMenuItemBase.vue';

const { SectionKind } = Nav.constants;
const {
  NavBase,
  NavTitleContainer,
} = Nav.components;

describe('nav', () => {
  let wrapper;

  const mocks = { $route: { path: '/tutorials/swiftui', query: { context: 'foo' } } };
  const slots = { default: 'SwiftUI' };

  const propsData = {
    sections: [
      {
        kind: SectionKind.volume,
        chapters: [
          { name: 'A' },
          { name: 'B' },
        ],
      },
      {
        kind: SectionKind.volume,
        chapters: [{ name: 'C' }],
      },
      {
        kind: SectionKind.resources,
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(Nav, {
      mocks,
      propsData,
      slots,
    });
  });

  it('renders a `NavBase`', () => {
    const nav = wrapper.find(NavBase);
    expect(nav.exists()).toBe(true);
  });

  it('renders the title inside `NavTitleContainer`', () => {
    const title = wrapper.find(NavTitleContainer);
    expect(title.exists()).toBe(true);
    expect(title.props('to')).toEqual('/tutorials/swiftui?context=foo');

    expect(title.text()).toBe('SwiftUI Tutorials');
  });

  it('renders TutorialsNavigation and passes all sections to it', () => {
    const itemBase = wrapper.find(NavMenuItemBase);
    expect(itemBase.classes()).toContain('in-page-navigation');
    const navigation = itemBase.find(TutorialsNavigation);
    expect(navigation.props('sections')).toEqual(propsData.sections);
  });
});
