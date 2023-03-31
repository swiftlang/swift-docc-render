/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import DocumentationTopic from 'docc-render/components/DocumentationTopic.vue';
import Language from 'docc-render/constants/Language';
import { TopicTypes } from '@/constants/TopicTypes';
import DocumentationHero from '@/components/DocumentationTopic/DocumentationHero.vue';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';
import OnThisPageNav from '@/components/OnThisPageNav.vue';
import OnThisPageStickyContainer
  from '@/components/DocumentationTopic/OnThisPageStickyContainer.vue';
import Declaration from '@/components/DocumentationTopic/PrimaryContent/Declaration.vue';

const { ON_THIS_PAGE_CONTAINER_BREAKPOINT } = DocumentationTopic.constants;

const {
  Abstract,
  ContentNode,
  DefaultImplementations,
  Aside,
  DownloadButton,
  LanguageSwitcher,
  PrimaryContent,
  Relationships,
  RequirementMetadata,
  Availability,
  SeeAlso,
  Topics,
  Title,
  BetaLegalText,
  ViewMore,
  WordBreak,
} = DocumentationTopic.components;

const foo = {
  type: 'paragraph',
  inlineContent: [
    {
      type: 'text',
      text: 'foo',
    },
  ],
};

const abstract = {
  type: 'text',
  text: 'Abstract text',
};

const deprecationSummary = [
  {
    type: 'paragraph',
    inlineContent: [
      {
        type: 'text',
        text: 'This feature is deprecated and should not be used in modern macOS apps.',
      },
    ],
  },
];

const downloadNotAvailableSummary = [
  {
    type: 'paragraph',
    inlineContent: [
      {
        type: 'text',
        text: 'You can experiment with the code. Just use ',
      },
      {
        type: 'reference',
        isActive: true,
        identifier: 'doc://com.example.documentation/documentation/arkit/xcode',
      },
      {
        type: 'text',
        text: ' on your Mac to download ',
      },
      {
        type: 'emphasis',
        inlineContent: [
          {
            type: 'text',
            text: 'Occluding Virtual Content with People.',
          },
        ],
      },
    ],
  },
];

const sampleCodeDownload = {
  title: 'Download',
  action: {
    isActive: true,
    overridingTitle: 'Download',
    type: 'reference',
  },
};

const propsData = {
  abstract: [abstract],
  conformance: { constraints: [], availabilityPrefix: [] },
  hierarchy: {
    paths: [
      [
        'topic://foo',
        'topic://bar',
      ],
    ],
  },
  identifier: 'doc://fookit',
  interfaceLanguage: 'swift',
  role: TopicTypes.collection,
  symbolKind: TopicTypes.module,
  objcPath: 'documentation/objc',
  swiftPath: 'documentation/swift',
  technology: { title: 'fookit' },
  platforms: [
    {
      introducedAt: '1.0',
      name: 'fooOS',
    },
    {
      deprecatedAt: '2.0',
      introducedAt: '1.0',
      name: 'barOS',
    },
  ],
  primaryContentSections: [
    {
      kind: PrimaryContent.constants.SectionKind.content,
      content: [foo],
    },
  ],
  references: {},
  roleHeading: 'Thing',
  title: 'FooKit',
  languagePaths: {
    occ: ['documentation/objc'],
    swift: ['documentation/swift'],
  },
  tags: [
    {
      type: 'foo',
    },
  ],
  remoteSource: { url: 'foo' },
  pageImages: [{ identifier: 'foo', type: 'icon' }],
};

describe('DocumentationTopic', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      provide: {
        store: {
          state: { onThisPageSections: [] },
          reset() {},
        },
      },
    });
  });

  it('provides a page title based on title prop', () => {
    const titleText = `${propsData.title} | Documentation`;

    expect(document.title).toBe(titleText);
  });

  it('provides a page description based on the abstract text', () => {
    const abstractText = propsData.abstract[0].text;

    expect(document.querySelector('meta[name="description"]').content).toBe(abstractText);
  });

  it('provides the languages', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.languages).toEqual(new Set(['occ', 'swift']));
  });

  it('provides the interface languages', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.interfaceLanguage).toEqual(propsData.interfaceLanguage);
  });

  it('provides `references', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.references).toEqual(propsData.references);
  });

  it('provides the languages', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.languages).toEqual(new Set(['occ', 'swift']));
  });

  it('provides the interface languages', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.interfaceLanguage).toEqual(propsData.interfaceLanguage);
  });

  it('provides the symbol kind', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.symbolKind).toEqual(propsData.symbolKind);
  });

  it('provides the `enableMinimized` flag', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(wrapper.vm._provided.enableMinimized).toBe(false);
  });

  it('renders a root div', () => {
    expect(wrapper.is('div.doc-topic')).toBe(true);
  });

  it('renders a <main>', () => {
    const main = wrapper.find('main');
    expect(main.exists()).toBe(true);
    expect(main.classes('main')).toBe(true);
    expect(main.attributes('id')).toBe('main');
    expect(main.attributes('role')).toBe('main');
    expect(main.attributes('tabindex')).toBe('0');
  });

  it('renders an aria live that tells VO users which it is the current page content', () => {
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('documentation.current-page FooKit');
  });

  it('renders a `DocumentationHero`, enabled', () => {
    const iconOverride = { variants: [] };
    wrapper.setProps({
      references: {
        [propsData.pageImages[0].identifier]: iconOverride,
      },
    });
    const hero = wrapper.find(DocumentationHero);
    expect(hero.exists()).toBe(true);
    expect(hero.props()).toEqual({
      role: propsData.role,
      enhanceBackground: true,
      enableMinimized: false,
      shortHero: false,
      shouldShowLanguageSwitcher: false,
      iconOverride,
    });
  });

  it('renders a `DocumentationHero` without an image override ', () => {
    wrapper.setProps({
      pageImages: [],
    });
    const hero = wrapper.find(DocumentationHero);
    expect(hero.exists()).toBe(true);
    expect(hero.props()).toEqual({
      role: propsData.role,
      enhanceBackground: true,
      enableMinimized: false,
      shortHero: false,
      shouldShowLanguageSwitcher: false,
      iconOverride: undefined,
    });
  });

  it('render a `DocumentationHero`, enabled, if top-level technology page', () => {
    const hero = wrapper.find(DocumentationHero);
    expect(hero.props()).toEqual({
      role: TopicTypes.collection,
      enhanceBackground: true,
      enableMinimized: false,
      shortHero: false,
      shouldShowLanguageSwitcher: false,
    });
  });

  it('computes `shortHero correctly', () => {
    const hero = wrapper.find(DocumentationHero);
    expect(hero.props('shortHero')).toBe(false);

    wrapper.setProps({ abstract: '', roleHeading: '', sampleCodeDownload: '' });
    expect(hero.props('shortHero')).toBe(true);
  });

  it('render a `DocumentationHero`, disabled, if symbol page', () => {
    /* wrapper.setProps({
      symbolKind: 'protocol',
    }); */

    // setProps isn't working for some reason...
    wrapper = shallowMount(DocumentationTopic, {
      propsData: {
        ...propsData,
        role: 'symbol',
        symbolKind: 'protocol',
      },
    });
    const hero = wrapper.find(DocumentationHero);
    expect(hero.props()).toEqual({
      role: 'symbol',
      enhanceBackground: false,
      enableMinimized: false,
      shortHero: false,
      shouldShowLanguageSwitcher: false,
    });
  });

  it('renders a `DocumentationHero`, disabled, if `disableHeroBackground` prop is `true`', () => {
    const hero = wrapper.find(DocumentationHero);
    expect(hero.props('enhanceBackground')).toBe(true);
    wrapper.setProps({ disableHeroBackground: true });
    expect(hero.props('enhanceBackground')).toBe(false);
  });

  it('renders a `DocumentationHero`, disabled, if the `topicSectionsStyle` is a grid type', () => {
    const hero = wrapper.find(DocumentationHero);
    expect(hero.props('enhanceBackground')).toBe(true);
    wrapper.setProps({ topicSectionsStyle: TopicSectionsStyle.detailedGrid });
    expect(hero.props('enhanceBackground')).toBe(false);
    wrapper.setProps({ topicSectionsStyle: TopicSectionsStyle.compactGrid });
    expect(hero.props('enhanceBackground')).toBe(false);
  });

  it('renders a `Title`', () => {
    const hero = wrapper.find(DocumentationHero);

    const title = hero.find(Title);
    expect(title.exists()).toBe(true);
    expect(title.props('eyebrow')).toBe(propsData.roleHeading);
    expect(title.text()).toBe(propsData.title);
    expect(title.find(WordBreak).exists()).toBe(false);
  });

  it('renders the right classes for `Title` based on `enableMininized` prop', () => {
    const hero = wrapper.find(DocumentationHero);
    const title = hero.find(Title);
    expect(title.classes()).not.toContain('minimized-title');

    wrapper.setProps({ enableMinimized: true });
    expect(title.classes()).toContain('minimized-title');
  });

  it('renders a `minimized-container` class, when `enableMinimized` is true', () => {
    const container = wrapper.find('.container');
    expect(container.classes()).not.toContain('minimized-container');
    wrapper.setProps({ enableMinimized: true });
    expect(container.classes()).toContain('minimized-container');
  });

  it('uses `WordBreak` in the title for symbol pages', () => {
    wrapper.setProps({
      role: 'symbol',
      symbolKind: 'protocol',
    });

    const title = wrapper.find(Title);
    expect(title.exists()).toBe(true);

    const wb = title.find(WordBreak);
    expect(wb.exists()).toBe(true);
    expect(wb.text()).toBe(propsData.title);
  });

  it('renders smaller "Beta" and "Deprecated" text in title when relevant', () => {
    const title = wrapper.find(Title);
    expect(title.exists()).toBe(true);
    let smalls = title.findAll('small');
    expect(smalls.length).toBe(0);

    // both beta _and_ deprecated — deprecated has priority
    wrapper.setProps({
      isSymbolDeprecated: true,
      isSymbolBeta: true,
    });
    smalls = title.findAll('small');
    expect(smalls.length).toBe(1);
    expect(smalls.at(0).attributes('data-tag-name')).toBe('aside-kind.deprecated');

    // only beta
    wrapper.setProps({
      isSymbolDeprecated: false,
      isSymbolBeta: true,
    });
    smalls = title.findAll('small');
    expect(smalls.length).toBe(1);
    expect(smalls.at(0).attributes('data-tag-name')).toBe('aside-kind.beta');

    // only deprecated
    wrapper.setProps({
      isSymbolDeprecated: true,
      isSymbolBeta: false,
    });
    smalls = title.findAll('small');
    expect(smalls.length).toBe(1);
    expect(smalls.at(0).attributes('data-tag-name')).toBe('aside-kind.deprecated');
  });

  it('renders an abstract', () => {
    const hero = wrapper.find(DocumentationHero);
    const abstractComponent = hero.find(Abstract);
    expect(abstractComponent.exists()).toBe(true);
    expect(abstractComponent.props('content')).toEqual(propsData.abstract);
  });

  it('renders an abstract, with an empty string inside', () => {
    const emptyParagraph = [{
      type: 'paragraph',
      inlineContent: [
        {
          type: 'text',
          text: '',
        },
      ],
    }];
    wrapper.setProps({
      abstract: emptyParagraph,
    });
    const hero = wrapper.find(DocumentationHero);
    const abstractComponent = hero.find(Abstract);
    expect(abstractComponent.exists()).toBe(true);
    expect(abstractComponent.props('content')).toEqual(emptyParagraph);
  });

  it('renders a `PrimaryContent`', () => {
    const primary = wrapper.find(PrimaryContent);
    expect(primary.exists()).toBe(true);
    expect(primary.props('sections')).toEqual(propsData.primaryContentSections);
  });

  it('renders a `PrimaryContent` with Declarations moved out and into the Hero section', () => {
    const declarationsSection = {
      kind: PrimaryContent.constants.SectionKind.declarations,
      declarations: [
        {
          platforms: [
            'macos',
          ],
          tokens: [
            {
              type: 'identifier',
              text: 'Foo',
            },
          ],
        },
      ],
    };
    expect(wrapper.find('.declarations-container').exists()).toBe(false);

    wrapper.setProps({
      enableMinimized: true,
      primaryContentSections: [
        ...propsData.primaryContentSections,
        declarationsSection,
      ],
    });
    const primary = wrapper.find(PrimaryContent);
    expect(primary.props('sections')).toEqual(propsData.primaryContentSections);
    const declarationContainer = wrapper.find('.declarations-container');
    // expect(declarationContainer.classes()).not.toContain('minimized-container');
    expect(declarationContainer.find(Declaration).props()).toEqual({
      conformance: propsData.conformance,
      declarations: declarationsSection.declarations,
      source: propsData.remoteSource,
    });
    // wrapper.setProps({ enableMinimized: true });
    // commented this out and moved it to the above `setProps` call because
    // there seems to be an obscure bug with vue-test-utils where things don't
    // work right if `setProps` is called more than once with a prop that is
    // also used in the component's `provide`...
    expect(declarationContainer.classes()).toContain('minimized-container');
  });

  it('does not render a `PrimaryContent` column when passed undefined as PrimaryContent', () => {
    wrapper.setProps({ primaryContentSections: undefined });
    expect(wrapper.contains(PrimaryContent)).toBe(false);
  });

  it('does not render a `PrimaryContent` column when passed empty an PrimaryContent', () => {
    wrapper.setProps({ primaryContentSections: [] });
    expect(wrapper.contains(PrimaryContent)).toBe(false);
  });

  it('does not render a `PrimaryContent` column when passed empty an PrimaryContent & no `ViewMore` link', () => {
    wrapper.setProps({ primaryContentSections: [], enableMinimized: true });
    expect(wrapper.contains(PrimaryContent)).toBe(true); // ViewMore link is present

    wrapper.setProps({
      primaryContentSections: [],
      enableMinimized: true,
      hasNoExpandedDocumentation: true,
    });
    expect(wrapper.contains(PrimaryContent)).toBe(false); // no ViewMore link
  });

  it('renders `ViewMore` if `enableMinimized`', () => {
    wrapper.setProps({
      enableMinimized: true,
      primaryContentSections: undefined,
      isRequirement: false,
      deprecationSummary: null,
      downloadNotAvailableSummary: null,
    });
    const viewMore = wrapper.find(ViewMore);
    expect(viewMore.exists()).toBe(true);
    expect(viewMore.props('url')).toEqual('/documentation/swift'); // normalized path

    // should not render `ViewMore` in non-minimized mode
    wrapper.setProps({ enableMinimized: false });
    expect(wrapper.find(ViewMore).exists()).toBe(false);

    // should not render `ViewMore` if `hasNoExpandedDocumentation`
    wrapper.setProps({ enableMinimized: true, hasNoExpandedDocumentation: true });
    expect(wrapper.find(ViewMore).exists()).toBe(false);
  });

  it('renders `ViewMore` with correct language path', () => {
    // only objcPath
    wrapper.setProps({
      enableMinimized: true,
      swiftPath: null,
      objcPath: 'documentation/objc',
      interfaceLanguage: 'occ',
    });
    const objcViewMore = wrapper.find(ViewMore);
    expect(objcViewMore.exists()).toBe(true);
    expect(objcViewMore.props('url')).toEqual('/documentation/objc'); // normalized path

    // only swiftPath
    wrapper.setProps({
      objcPath: null,
      swiftPath: 'documentation/swift',
      interfaceLanguage: 'swift',
    });
    const swiftViewMore = wrapper.find(ViewMore);
    expect(swiftViewMore.exists()).toBe(true);
    expect(swiftViewMore.props('url')).toEqual('/documentation/swift'); // normalized path

    // both paths exists, but on the objc variant
    wrapper.setProps({
      objcPath: 'documentation/objc',
      swiftPath: 'documentation/swift',
      interfaceLanguage: 'occ',
    });
    const viewMore = wrapper.find(ViewMore);
    expect(viewMore.exists()).toBe(true);
    expect(viewMore.props('url')).toEqual('/documentation/objc?language=objc'); // normalized path
  });

  describe('description column', () => {
    it('renders the description section', () => {
      const description = wrapper.find('.description');
      expect(description.exists()).toBe(true);
      expect(description.classes()).toContain('after-enhanced-hero');
      wrapper.setProps({
        symbolKind: 'something-else',
      });
      expect(description.classes()).not.toContain('after-enhanced-hero');
    });

    it('renders a deprecated `Aside` when deprecated', () => {
      expect(wrapper.contains(Aside)).toBe(false);
      wrapper.setProps({ deprecationSummary });

      const aside = wrapper.find(Aside);
      expect(aside.exists()).toBe(true);
      expect(aside.props('kind')).toEqual('deprecated');

      const content = aside.find(ContentNode);
      expect(content.exists()).toBe(true);
      expect(content.props('content')).toEqual(deprecationSummary);
    });

    it('renders a note `Aside` when download button is not available', () => {
      expect(wrapper.contains(Aside)).toBe(false);
      wrapper.setProps({ downloadNotAvailableSummary });

      const aside = wrapper.find(Aside);
      expect(aside.exists()).toBe(true);
      expect(aside.props('kind')).toEqual('note');

      const content = aside.find(ContentNode);
      expect(content.exists()).toBe(true);
      expect(content.props('content')).toEqual(downloadNotAvailableSummary);
    });

    it('renders a `DownloadButton` if there is sample code to download', () => {
      expect(wrapper.contains(DownloadButton)).toBe(false);
      wrapper.setProps({ sampleCodeDownload });
      expect(wrapper.contains(DownloadButton)).toBe(true);
    });

    it('renders a `RequirementMetadata` if the symbol is required', () => {
      expect(wrapper.contains(RequirementMetadata)).toBe(false);
      wrapper.setProps({ isRequirement: true });
      expect(wrapper.contains(RequirementMetadata)).toBe(true);
    });

    it('renders a `Availability` with platforms data', () => {
      const list = wrapper.find(Availability);
      expect(list.exists()).toBe(true);
      expect(list.props('platforms')).toEqual(propsData.platforms);

      // Minimized view should not render Availability
      wrapper.setProps({ enableMinimized: true });
      expect(wrapper.find(Availability).exists()).toBe(false);
    });
  });

  it('does not render any primary content or related markup, if not provided', () => {
    const docContent = wrapper.find('.doc-content');
    expect(docContent.classes()).not.toContain('no-primary-content');
    wrapper.setProps({
      primaryContentSections: [],
      isRequirement: false,
      deprecationSummary: null,
      downloadNotAvailableSummary: null,
      enableMinimized: false,
      hasNoExpandedDocumentation: true,
    });
    expect(wrapper.find(PrimaryContent).exists()).toBe(false);
    expect(wrapper.find('.description').exists()).toBe(false);
    expect(docContent.classes()).toContain('no-primary-content');
    // removes it if hero is not enhanced
    wrapper.setProps({ disableHeroBackground: true });
    expect(docContent.classes()).not.toContain('no-primary-content');
  });

  it('renders a `LanguageSwitcher` if TargetIDE', () => {
    const provide = { isTargetIDE: true };
    wrapper = shallowMount(DocumentationTopic, { propsData, provide });
    const switcher = wrapper.find(LanguageSwitcher);
    expect(switcher.exists()).toBe(true);
    expect(switcher.props()).toEqual({
      interfaceLanguage: propsData.interfaceLanguage,
      objcPath: propsData.languagePaths.occ[0],
      swiftPath: propsData.languagePaths.swift[0],
    });

    // Minimized view should not render LanguageSwitcher
    wrapper.setProps({ enableMinimized: true });
    expect(wrapper.find(LanguageSwitcher).exists()).toBe(false);
  });

  it('renders `Topics` if there are topic sections, passing the `topicSectionsStyle` over', () => {
    expect(wrapper.contains(Topics)).toBe(false);

    const topicSections = [
      {
        title: 'Foobar',
        identifiers: [
          'foo',
          'bar',
        ],
      },
      {
        title: 'Baz',
        identifiers: ['baz'],
      },
    ];
    wrapper.setProps({ topicSections, topicSectionsStyle: TopicSectionsStyle.detailedGrid });

    const topics = wrapper.find(Topics);
    expect(topics.exists()).toBe(true);
    expect(topics.props('sections')).toBe(topicSections);
    expect(topics.props('topicStyle')).toBe(TopicSectionsStyle.detailedGrid);

    // Minimized view should not render Topics
    wrapper.setProps({ enableMinimized: true });
    expect(wrapper.find(Topics).exists()).toBe(false);
  });

  it('does not render the `Topics` if the `topicSectionsStyle` is `hidden`', () => {
    const topicSections = [
      {
        title: 'Baz',
        identifiers: ['baz'],
      },
    ];
    wrapper.setProps({ topicSections, topicSectionsStyle: 'hidden' });
    expect(wrapper.find(Topics).exists()).toBe(false);
  });

  it('renders `SeeAlso` if there are see also sections', () => {
    expect(wrapper.contains(SeeAlso)).toBe(false);

    const seeAlsoSections = [
      {
        title: 'Foobar',
        identifiers: [
          'foo',
          'bar',
        ],
      },
      {
        title: 'Baz',
        identifiers: ['baz'],
      },
    ];
    wrapper.setProps({ seeAlsoSections });

    const seeAlso = wrapper.find(SeeAlso);
    expect(seeAlso.exists()).toBe(true);
    expect(seeAlso.props('sections')).toBe(seeAlsoSections);

    // Minimized view should not render See Also
    wrapper.setProps({ enableMinimized: true });
    expect(wrapper.find(SeeAlso).exists()).toBe(false);
  });

  it('renders `Relationships` if there are relationship sections', () => {
    expect(wrapper.contains(Relationships)).toBe(false);

    const relationshipsSections = [
      {
        type: 'inheritsFrom',
        title: 'Inherits From',
        identifiers: [
          'foo',
          'bar',
        ],
      },
      {
        type: 'conformsTo',
        title: 'Conforms To',
        identifiers: ['baz'],
      },
    ];
    wrapper.setProps({ relationshipsSections });

    const relationships = wrapper.find(Relationships);
    expect(relationships.exists()).toBe(true);
    expect(relationships.props('sections')).toBe(relationshipsSections);

    // Minimized view should not render Relationships
    wrapper.setProps({ enableMinimized: true });
    expect(wrapper.find(Relationships).exists()).toBe(false);
  });

  it('renders `Relationships` before `SeeAlso`', () => {
    // There's probably a much better way of asserting the order of the
    // rendered components, but this was the only way I could think of doing it
    // without manually adding classes to the components in the actual
    // implementation. I'm stubbing out the components I care about to add a
    // common class that can be queried so that the ordering can be verified.
    const stubSection = klass => ({
      render: h => h('div', { class: `section-stub ${klass}` }),
    });
    wrapper = shallowMount(DocumentationTopic, {
      propsData: {
        ...propsData,
        relationshipsSections: [
          { type: 'inheritsFrom', title: 'Inherits From', identifiers: [] },
        ],
        seeAlsoSections: [
          { title: 'Related Documentation', identifiers: [] },
        ],
      },
      stubs: {
        Relationships: stubSection('relationships'),
        SeeAlso: stubSection('see-also'),
      },
    });
    const sections = wrapper.findAll('.section-stub');
    expect(sections.at(0).classes('relationships')).toBe(true);
    expect(sections.at(1).classes('see-also')).toBe(true);
  });

  it('renders `DefaultImplementations` if there are default implementation sections', () => {
    expect(wrapper.contains(DefaultImplementations)).toBe(false);

    const defaultImplementationsSections = [
      {
        title: 'Foobar',
        identifiers: [
          'foo',
          'bar',
        ],
      },
      {
        title: 'Baz',
        identifiers: ['baz'],
      },
    ];
    wrapper.setProps({ defaultImplementationsSections });

    const defaults = wrapper.find(DefaultImplementations);
    expect(defaults.exists()).toBe(true);
    expect(defaults.props('sections')).toEqual(defaultImplementationsSections);

    // Minimized view should not render DefaultImplementations
    wrapper.setProps({ enableMinimized: true });
    expect(wrapper.find(DefaultImplementations).exists()).toBe(false);
  });

  it('computes isSymbolBeta', () => {
    const topicSections = [{}];
    wrapper.setProps({ topicSections, isSymbolBeta: true });

    const topics = wrapper.find(Topics);
    expect(topics.props('isSymbolBeta')).toBe(true);

    // should not if only one is beta
    wrapper.setProps({
      isSymbolBeta: false,
    });
    expect(topics.props('isSymbolBeta')).toBe(false);
  });

  it('renders a beta legal text warning if at least one platform is in beta', async () => {
    expect(wrapper.find(BetaLegalText).exists()).toBe(false);
    wrapper.setProps({
      platforms: [
        {
          introducedAt: '1.0',
          name: 'fooOS',
          beta: true,
        },
        {
          introducedAt: '1.0',
          name: 'fooOSS',
        },
      ],
    });
    expect(wrapper.find(BetaLegalText).exists()).toBe(true);
  });

  it('sends isSymbolDeprecated down to the Topic', () => {
    wrapper.setProps({ topicSections: [{}], isSymbolDeprecated: false });
    const topics = wrapper.find(Topics);
    expect(topics.props('isSymbolDeprecated')).toBe(false);
    wrapper.setProps({ isSymbolDeprecated: true });
    expect(topics.props('isSymbolDeprecated')).toBe(true);
  });

  it('renders content in the `above-title` slot', () => {
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      slots: {
        'above-title': '<div class="above-title">Above Title Content</div>',
      },
    });
    expect(wrapper.find(DocumentationHero).contains('.above-title')).toBe(true);
  });

  it('renders content in the `above-hero-content` slot', () => {
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      slots: {
        'above-hero-content': '<div class="above-hero-content">Above Hero Content</div>',
      },
      stubs: {
        DocumentationHero,
      },
    });
    expect(wrapper.contains('.above-hero-content')).toBe(true);
  });

  it('renders `OnThisPageNav` component, if enabled via prop', () => {
    expect(wrapper.find(OnThisPageNav).exists()).toBe(false);
    expect(wrapper.find(OnThisPageStickyContainer).exists()).toBe(false);
    // enable the nav
    wrapper.setProps({ enableOnThisPageNav: true });
    // assert container is visible, but not the nav
    expect(wrapper.find(OnThisPageStickyContainer).exists()).toBe(true);
    expect(wrapper.find(OnThisPageNav).exists()).toBe(false);
    // show the nav
    wrapper.setData({
      topicState: {
        onThisPageSections: [{ anchor: 'foo' }, { anchor: 'bar' }, { anchor: 'baz' }],
      },
    });
    expect(wrapper.find(OnThisPageNav).exists()).toBe(true);
  });

  it('hides the `OnThisPageStickyContainer`, if the store.contentWidth is below a threshold', () => {
    expect(wrapper.classes()).not.toContain('with-on-this-page');
    wrapper.setProps({ enableOnThisPageNav: true });
    wrapper.setData({
      topicState: {
        contentWidth: 200,
      },
    });
    const container = wrapper.find(OnThisPageStickyContainer);
    expect(container.exists()).toBe(true);
    expect(container.isVisible()).toBe(false);
    wrapper.setData({
      topicState: {
        contentWidth: ON_THIS_PAGE_CONTAINER_BREAKPOINT + 10,
      },
    });
    expect(container.isVisible()).toBe(true);
    expect(wrapper.classes()).toContain('with-on-this-page');
  });

  it('computes a `disableMetadata` property that mirrors `enableMinimized`', () => {
    expect(wrapper.vm.disableMetadata).toBe(false);
    wrapper.setProps({ enableMinimized: true });
    expect(wrapper.vm.disableMetadata).toBe(true);
  });

  describe('lifecycle hooks', () => {
    it('calls `store.reset()`', () => {
      const store = {
        reset: jest.fn(),
        state: { onThisPageSections: [], apiChanges: null },
      };
      wrapper = shallowMount(DocumentationTopic, {
        propsData,
        provide: { store },
      });
      expect(store.reset).toBeCalled();
    });

    it('routes to the objc variant of a page if that is the preferred language', async () => {
      const $route = { query: {} };
      const $router = { replace: jest.fn() };
      const store = {
        reset: () => {},
        state: {
          apiChanges: null,
          onThisPageSections: [],
          preferredLanguage: Language.objectiveC.key.url,
        },
      };
      wrapper = shallowMount(DocumentationTopic, {
        mocks: {
          $route,
          $router,
        },
        propsData,
        provide: { store },
      });
      await wrapper.vm.$nextTick();
      expect($router.replace).toBeCalledWith({
        path: `/${propsData.languagePaths.occ[0]}`,
        query: { language: Language.objectiveC.key.url },
      });
    });
  });
});
