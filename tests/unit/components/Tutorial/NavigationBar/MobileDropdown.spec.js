/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import MobileDropdown from 'docc-render/components/Tutorial/NavigationBar/MobileDropdown.vue';
import ReferenceUrlProvider from 'docc-render/components/ReferenceUrlProvider.vue';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';
import NavMenuItems from 'docc-render/components/NavMenuItems.vue';

describe('MobileDropdown', () => {
  let wrapper;

  const modules = [
    {
      projects: [
        {
          reference: 'doc://com.example.Test/tutorials/TechnologyX/Tutorial',
          sections: [],
        },
        {
          reference: 'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle',
          sections: [],
        },
      ],
      reference: 'doc://com.example.Test/tutorials/TechnologyX/Getting-Started',
    },
  ];

  const sections = [{
    depth: 0,
    path: '/tutorials/technologyx/tutorial#introduction',
    title: 'Introduction',
  }, {
    depth: 0,
    path: '/tutorials/technologyx/tutorial#Create-a-New-AR-Project',
    title: 'Create a New AR Project',
  }];

  const references = {
    'doc://com.example.Test/tutorials/TechnologyX/Getting-Started': {
      title: 'Getting Started',
      type: 'topic',
      url: '/tutorials/technologyx/getting-started',
    },
    'doc://com.example.Test/tutorials/TechnologyX/Tutorial': {
      title: 'Basic Augmented Reality App',
      type: 'topic',
      url: '/tutorials/technologyx/tutorial',
    },
    'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle': {
      title: 'Making an Augmented Reality App',
      type: 'topic',
      url: '/tutorials/technologyx/testtutorialarticle',
    },
    'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#A-Section': {
      title: 'A Section',
      type: 'section',
      url: '/tutorials/technologyx/testtutorialarticle#A-Section',
    },
    'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#This-is-an-H2': {
      title: 'This is an H2',
      type: 'section',
      url: '/tutorials/technologyx/testtutorialarticle#This-is-an-H2',
    },
    'doc://com.example.Test/tutorials/TechnologyX/TestTutorialArticle#This-is-an-H3': {
      title: 'This is an H3',
      type: 'section',
      url: '/tutorials/technologyx/testtutorialarticle#This-is-an-H3',
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(MobileDropdown, {
      mocks: {
        $route: {
          name: 'project-detail',
          params: {},
          query: {
            context: 'foo',
          },
          path: references['doc://com.example.Test/tutorials/TechnologyX/Tutorial'].url,
        },
      },
      propsData: {
        options: modules,
        currentOption: sections[0].title,
        sections,
      },
      stubs: { 'router-link': RouterLinkStub, ReferenceUrlProvider },
      provide: {
        references,
      },
    });
  });

  it('renders a ul.mobile-dropdown', () => {
    const node = wrapper.find(NavMenuItems);
    expect(node.classes()).toContain('mobile-dropdown');
  });

  it('renders a <p> with the name of each available module', () => {
    // assert the
    const chapter = wrapper.findAll(NavMenuItemBase);
    expect(chapter).toHaveLength(1);
    expect(chapter.at(0).classes()).toContain('chapter-list');
    expect(chapter.at(0).attributes('role')).toBe('group');

    const node = wrapper.find('p.chapter-name');
    expect(node.exists()).toBe(true);
    expect(node.text()).toBe('Getting Started');
  });

  it('renders a <ul> with a <li> that includes links to each project inside of a module', () => {
    const options = wrapper.findAll('ul.tutorial-list');
    expect(options).toHaveLength(modules.length); // just one module option
    expect(options.at(0).findAll('li.tutorial-list-item')).toHaveLength(modules[0].projects.length);
  });

  it('renders link elements with appropriate role attributes', () => {
    const link = wrapper.find('.tutorial');
    expect(link.is(RouterLinkStub)).toBe(true);
    expect(link.props('to'))
      // the first sub-link
      .toEqual(`${references['doc://com.example.Test/tutorials/TechnologyX/Tutorial'].url}?context=foo`);
    expect(link.attributes('value'))
      // the first sub-link title
      .toBe(references['doc://com.example.Test/tutorials/TechnologyX/Tutorial'].title);
  });

  it('renders for under the correct tutorial section with appropriate classes', () => {
    // only the first item has a section list
    const tutorials = wrapper.findAll('.tutorial-list-item');
    expect(tutorials.at(1).find('.section-list').exists()).toBe(false);

    const section = tutorials.at(0).find('.section-list');
    expect(section.exists()).toBe(true);
    expect(section.attributes('role')).toBe('listbox');

    const sectionComponents = wrapper.findAll('.section.depth0');
    expect(sectionComponents).toHaveLength(sectionComponents.length);

    const sectionLink = sectionComponents.at(0);
    expect(sectionLink.is(RouterLinkStub)).toBe(true);
    expect(sectionLink.props('to')).toEqual({
      path: sections[0].path,
      query: { context: 'foo' },
    });
    expect(sectionLink.attributes('value')).toEqual(sections[0].title);
  });
});
