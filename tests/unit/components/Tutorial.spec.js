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
import Assessments from 'docc-render/components/Tutorial/Assessments.vue';
import Hero from 'docc-render/components/Tutorial/Hero.vue';
import Tutorial from 'docc-render/components/Tutorial.vue';
import SectionList from 'docc-render/components/Tutorial/SectionList.vue';
import NavigationBar from 'docc-render/components/Tutorial/NavigationBar.vue';
import TopicStore from 'docc-render/stores/TopicStore';

const { Section, BreakpointEmitter, PortalTarget } = Tutorial.components;

const sections = [
  {
    kind: 'hero',
    title: 'Fooing the Bar',
    estimatedTimeInMinutes: 42,
    backgroundImage: 'foo.jpg',
    projectFiles: 'download.zip',
    content: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'Property wrappers...',
          },
        ],
      },
    ],
  },
  {
    kind: 'tasks',
    tasks: [],
  },
  {
    kind: 'assessments',
    anchor: 'Check-your-understanding',
    assessments: [],
  },
];

const hierarchy = {
  reference: 'foo',
  technologyNavigation: ['overview', 'tutorials', 'resources'],
  modules: [
    {
      title: 'Building Interactive AR Experiences',
      identifier: 'topic://com.example.ARKit.Building-Interactive-AR-Experiences',
      projects: [
        {
          title: 'Basic Augmented Reality App',
          identifier:
            'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App',
          path: '/tutorials/augmented-reality/basic-augmented-reality-app',
          sections: [
            {
              title: 'Create a new AR project',
              identifier:
                'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Create-a-new-AR-project',
              path: '/tutorials/augmented-reality/basic-augmented-reality-app#create-a-new-ar-project',
            },
            {
              title: 'Initiate ARKit plane detection',
              identifier:
                'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Initiate-ARKit-plane-detection',
              path: '/tutorials/augmented-reality/basic-augmented-reality-app#initiate-arkit-plane-detection',
            },
            {
              title: 'Check your understanding',
              identifier:
                'topic://com.example.ARKit.Building-Interactive-AR-Experiences.Basic-Augmented-Reality-App.Assessment',
              path: '/tutorials/augmented-reality/basic-augmented-reality-app#check-your-understanding',
            },
          ],
        },
      ],
    },
  ],
};

const mocks = {
  $bridge: {
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
  $route: {},
};

describe('Section', () => {
  it('renders an `Assessments` for `kind="assessments"`', () => {
    const { kind, ...sectionProps } = sections[2];
    const wrapper = shallowMount(Section, {
      propsData: {
        section: {
          ...sectionProps,
          kind,
        },
      },
      provide: {
        isTargetIDE: false,
        store: TopicStore,
      },
      mocks,
    });

    const assessment = wrapper.find(Assessments);
    expect(assessment.exists()).toBe(true);
    expect(assessment.props()).toEqual(sectionProps);
  });

  it('renders a `Hero` for `kind="hero"`', () => {
    const { kind, ...sectionProps } = sections[0];
    const wrapper = shallowMount(Section, {
      propsData: {
        section: {
          ...sectionProps,
          kind,
        },
      },
      provide: {
        isTargetIDE: false,
        store: TopicStore,
      },
      mocks,
    });

    const hero = wrapper.find(Hero);
    expect(hero.exists()).toBe(true);
    expect(hero.props()).toEqual(sectionProps);
  });

  it('renders a `SectionList` for `kind="tasks"`', () => {
    const { kind, ...sectionProps } = sections[1];
    const wrapper = shallowMount(Section, {
      propsData: {
        section: {
          ...sectionProps,
          kind,
        },
      },
      provide: {
        isTargetIDE: false,
        store: TopicStore,
      },
      mocks,
    });

    const sectionList = wrapper.find(SectionList);
    expect(sectionList.exists()).toBe(true);
    expect(sectionList.props()).toEqual(sectionProps);
  });
});

describe('Tutorial', () => {
  let wrapper;

  const propsData = {
    references: {
      foo: 'foo',
    },
    sections,
    hierarchy,
    metadata: { category: 'Blah' },
    identifierUrl: 'foo',
  };

  beforeEach(() => {
    wrapper = shallowMount(Tutorial, {
      propsData,
      mocks,
      provide: {
        isTargetIDE: false,
        store: TopicStore,
      },
    });
  });

  it('provides `references`', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.references).toEqual(propsData.references);
  });

  it('renders a div.tutorial', () => {
    expect(wrapper.is('div.tutorial')).toBe(true);
  });

  it('renders a `NavigationBar`', () => {
    const nav = wrapper.find(NavigationBar);
    expect(nav.exists()).toBe(true);
    expect(nav.props()).toEqual({
      technology: propsData.metadata.category,
      chapters: propsData.hierarchy.modules,
      topic: propsData.sections[0].title,
      rootReference: hierarchy.reference,
      identifierUrl: propsData.identifierUrl,
    });
  });

  it('renders a `Section` for each section', () => {
    const projectSections = wrapper.findAll(Section);
    expect(projectSections.length).toBe(sections.length);

    expect(projectSections.at(0).props('section')).toEqual(sections[0]);
    expect(projectSections.at(1).props('section')).toEqual(sections[1]);
    expect(projectSections.at(2).props('section')).toEqual(sections[2]);
  });

  it('renders a `BreakpointEmitter`', () => {
    expect(wrapper.contains(BreakpointEmitter)).toBe(true);
  });

  it('provides a page title using the hero section title', () => {
    const titleText = `${sections[0].title} — ${propsData.metadata.category} Tutorials | Documentation`;

    expect(document.title).toBe(titleText);
  });

  it('provides a page description based on the hero content text', () => {
    const { text: heroContentText } = propsData.sections[0].content[0].inlineContent[0];

    expect(document.querySelector('meta[name="description"]').content).toBe(heroContentText);
  });

  it('renders a BreakpointEmitter and updates the breakpoint in the store', () => {
    const spy = jest.spyOn(wrapper.vm.store, 'updateBreakpoint');
    const emitter = wrapper.find(BreakpointEmitter);
    expect(emitter.exists()).toBe(true);
    emitter.vm.$emit('change', 'foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('renders a `PortalTarget`', () => {
    const target = wrapper.find(PortalTarget);
    expect(target.exists()).toBe(true);
    expect(target.props()).toHaveProperty('name', 'modal-destination');
  });
});

describe('Tutorial without hero section', () => {
  it('should return `undefined` for `heroSection` and `pageTitle`', () => {
    const wrapper = shallowMount(Tutorial, {
      propsData: {
        references: {},
        sections: [sections[1], sections[2]],
        hierarchy,
        metadata: { category: 'Blah' },
        technologyNavigation: ['overview', 'tutorials', 'resources'],
        identifierUrl: 'foo',
      },
      mocks,
      provide: {
        isTargetIDE: false,
        store: TopicStore,
      },
    });
    expect(wrapper.vm.heroSection).toBe(undefined);
    expect(wrapper.vm.pageTitle).toBe(undefined);
  });
});
