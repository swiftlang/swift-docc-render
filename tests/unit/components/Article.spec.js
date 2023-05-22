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
import Article from 'docc-render/components/Article.vue';
import Assessments from 'docc-render/components/Tutorial/Assessments.vue';
import Body from 'docc-render/components/Article/Body.vue';
import CallToAction from 'docc-render/components/Article/CallToAction.vue';
import Hero from 'docc-render/components/Article/Hero.vue';
import NavigationBar from 'docc-render/components/Tutorial/NavigationBar.vue';
import TopicStore from 'docc-render/stores/TopicStore';
import { PortalTarget } from 'portal-vue';

const { SectionKind } = Article;

const heroSection = {
  kind: SectionKind.hero,
  backgroundImage: 'bg.jpg',
  chapter: 'Learning Swift',
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
  estimatedTimeInMinutes: 42,
  title: 'Swift Property Wrappers',
};

const bodySection = {
  kind: SectionKind.articleBody,
  content: [
    {
      kind: 'fullWidth',
      content: [
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'foobar',
            },
          ],
        },
      ],
    },
  ],
};

const assessmentsSection = {
  kind: SectionKind.assessments,
  anchor: 'Check-your-understanding',
  assessments: [],
};

const ctaSection = {
  kind: SectionKind.callToAction,
  abstract: [
    {
      type: 'text',
      text: 'foobar',
    },
  ],
  action: {
    type: 'reference',
    identifier: 'topic://foo.bar',
    isActive: true,
    overridingTitle: 'Get started',
  },
  media: 'foo.bar',
  title: 'Foo Bar',
};
const hierarchy = {
  modules: [],
  reference: 'foo',
  technologyNavigation: ['overview', 'tutorials', 'resources'],
};
const propsData = {
  hierarchy,
  metadata: {
    category: 'Building iOS Apps',
  },
  references: {},
  sections: [
    heroSection,
    bodySection,
    assessmentsSection,
    ctaSection,
  ],
  identifierUrl: 'foo',
};

describe('Article', () => {
  let wrapper;

  const provide = {
    store: TopicStore,
  };

  beforeEach(() => {
    wrapper = shallowMount(Article, { propsData, provide });
  });

  it('renders a div.article', () => {
    expect(wrapper.is('div.article')).toBe(true);
  });

  it('provides a page title using the hero section title', () => {
    const titleText = `${heroSection.title} — ${propsData.metadata.category} Tutorials | Documentation`;

    expect(document.title).toBe(titleText);
  });

  it('provides a page description based on the hero content text', () => {
    const { text: heroContentText } = heroSection.content[0].inlineContent[0];

    expect(document.querySelector('meta[name="description"]').content).toBe(heroContentText);
  });

  it('renders a `NavigationBar`', () => {
    const navBar = wrapper.find(NavigationBar);
    expect(navBar.exists()).toBe(true);
    expect(navBar.props()).toEqual({
      chapters: propsData.hierarchy.modules,
      technology: propsData.metadata.category,
      topic: heroSection.title,
      rootReference: hierarchy.reference,
      identifierUrl: propsData.identifierUrl,
    });
  });

  it('renders an article `Hero`', () => {
    const { kind, ...heroProps } = heroSection;

    const hero = wrapper.find(Hero);
    expect(hero.exists()).toBe(true);
    expect(hero.props()).toEqual(heroProps);
  });

  describe('without hero section', () => {
    beforeEach(() => {
      wrapper.setProps({ sections: [] });
    });

    it('does not provide a page title', () => {
      expect(wrapper.vm.pageTitle).toBe(undefined);
    });
  });

  it('renders an article `Body`', () => {
    const { kind, ...bodyProps } = bodySection;

    const body = wrapper.find(Body);
    expect(body.exists()).toBe(true);
    expect(body.props()).toEqual(bodyProps);
  });

  it('renders an assessments section', () => {
    const { kind, ...assessmentsProps } = assessmentsSection;

    const assessments = wrapper.find(Assessments);
    expect(assessments.exists()).toBe(true);
    expect(assessments.props()).toEqual(assessmentsProps);
  });

  it('renders an article `CallToAction`', () => {
    const { kind, ...ctaProps } = ctaSection;

    const cta = wrapper.find(CallToAction);
    expect(cta.exists()).toBe(true);
    expect(cta.props()).toEqual(ctaProps);
  });

  it('renders a `PortalTarget`', () => {
    const target = wrapper.find(PortalTarget);
    expect(target.exists()).toBe(true);
    expect(target.props()).toHaveProperty('name', 'modal-destination');
  });

  it('renders content in the `above-hero` slot', () => {
    wrapper = shallowMount(Article, {
      propsData,
      provide,
      slots: {
        'above-hero': 'Above Hero Text',
      },
    });
    expect(wrapper.text()).toContain('Above Hero Text');
  });
});

describe('with `isTargetIDE`', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Article, {
      propsData,
      provide: {
        isTargetIDE: true,
      },
    });
  });

  it('does not render a `NavigationBar', () => {
    const nav = wrapper.find(NavigationBar);
    expect(nav.exists()).toBe(false);
  });
});
