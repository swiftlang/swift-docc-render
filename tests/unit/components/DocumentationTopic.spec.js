/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import DocumentationTopic from 'docc-render/components/DocumentationTopic.vue';
import Language from 'docc-render/constants/Language';
import InlinePlusCircleIcon from 'docc-render/components/Icons/InlinePlusCircleIcon.vue';
import { TopicTypes } from '@/constants/TopicTypes';
import SymbolKind from '@/constants/SymbolKind';
import DocumentationHero from '@/components/DocumentationTopic/Hero/DocumentationHero.vue';
import { TopicSectionsStyle } from '@/constants/TopicSectionsStyle';
import OnThisPageNav from '@/components/OnThisPageNav.vue';
import OnThisPageStickyContainer
  from '@/components/DocumentationTopic/OnThisPageStickyContainer.vue';
import Declaration from '@/components/DocumentationTopic/PrimaryContent/Declaration.vue';

const { ON_THIS_PAGE_CONTAINER_BREAKPOINT } = DocumentationTopic.constants;

const {
  Hierarchy,
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

const itemFoo = {
  title: 'Foo',
  url: '/documentation/foo',
};

const itemBar = {
  title: 'Bar',
  url: '/documentation/bar',
};

const hierarchyItems = [
  'topic://foo',
  'topic://bar',
];

const hierarchyItemsReferences = {
  'topic://foo': itemFoo,
  'topic://bar': itemBar,
};

const propsData = {
  abstract: [abstract],
  conformance: { constraints: [], availabilityPrefix: [] },
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
  rootLink: {
    path: 'foo',
    query: {},
  },
  hierarchyItems: [],
};

const hasOtherDeclSection = {
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
      otherDeclarations: {
        declarations: [
          {
            identifier: 'doc://boo',
            tokens: [
              {
                type: 'identifier',
                text: 'Boo',
              },
            ],
          },
        ],
        displayIndex: 1,
      },
    },
  ],
};

describe('DocumentationTopic', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;
  const mockStore = {
    state: { onThisPageSections: [], references: {} },
    reset: jest.fn(),
    setReferences: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      stubs: { Title },
      provide: {
        isTargetIDE: false,
        store: mockStore,
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

  it('renders a <main> in non-IDE mode', () => {
    const main = wrapper.findComponent('main');
    expect(main.exists()).toBe(true);
    expect(main.classes('main')).toBe(true);
    expect(main.attributes('id')).toBe('app-main');
  });

  it('renders a <div> instead of <main> in IDE mode', () => {
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      provide: {
        isTargetIDE: true,
        store: mockStore,
      },
    });

    expect(wrapper.findComponent('main').exists()).toBe(false);
    const div = wrapper.findComponent('.main');
    expect(div.exists()).toBe(true);
    expect(div.attributes('id')).toBe('app-main');
  });

  it('renders an aria live that tells VO users which it is the current page content', () => {
    expect(wrapper.findComponent('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.findComponent('[aria-live="polite"]').text()).toBe('documentation.current-page FooKit');
  });

  it('renders a `DocumentationHero`, enabled', async () => {
    const iconOverride = { variants: [] };
    await wrapper.setProps({
      references: {
        [propsData.pageImages[0].identifier]: iconOverride,
      },
    });
    const hero = wrapper.findComponent(DocumentationHero);
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

  it('renders a `DocumentationHero` without an image override ', async () => {
    await wrapper.setProps({
      pageImages: [],
    });
    const hero = wrapper.findComponent(DocumentationHero);
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

  it('renders a Hierarchy', async () => {
    await wrapper.setProps({
      references: hierarchyItemsReferences,
      hierarchyItems,
    });
    const hierarchy = wrapper.findComponent(Hierarchy);
    expect(hierarchy.exists()).toBe(true);
    expect(hierarchy.props()).toEqual({
      currentTopicTitle: propsData.title,
      parentTopics: [itemFoo, itemBar],
      isSymbolBeta: false,
      isSymbolDeprecated: false,
      currentTopicTags: propsData.tags,
    });
  });

  it('does not render `Hierarchy` in IDE', () => {
    wrapper = shallowMount(DocumentationTopic, {
      propsData: {
        ...propsData,
        references: hierarchyItemsReferences,
        hierarchyItems,
      },
      provide: {
        isTargetIDE: true,
        store: mockStore,
      },
    });

    const hierarchy = wrapper.findComponent(Hierarchy);
    expect(hierarchy.exists()).toBe(false);
  });

  it('only creates a "Mentioned In" section for non-module pages', async () => {
    const mentionSection = {
      kind: PrimaryContent.constants.SectionKind.mentions,
      mentions: [
        'topic://foo',
        'topic://bar',
      ],
    };

    await wrapper.setProps({
      references: hierarchyItemsReferences,
      role: TopicTypes.symbol,
      symbolKind: SymbolKind.protocol,
      primaryContentSections: [
        mentionSection,
        foo,
      ],
    });

    expect(wrapper.findComponent(PrimaryContent).props()).toHaveProperty('sections', [
      mentionSection,
      foo,
    ]);

    await wrapper.setProps({
      symbolKind: SymbolKind.module,
    });

    expect(wrapper.findComponent(PrimaryContent).props()).toHaveProperty('sections', [foo]);
  });

  it('renders `Hierarchy` without its immediate parent if its within overload group', async () => {
    await wrapper.setProps({
      references: hierarchyItemsReferences,
      hierarchyItems,
      primaryContentSections: [
        ...propsData.primaryContentSections,
        hasOtherDeclSection,
      ],
    });

    let hierarchy = wrapper.findComponent(Hierarchy);
    // Don't hide immediate parent yet if has other declarations but different titles
    expect(hierarchy.props()).toHaveProperty('parentTopics', [itemFoo, itemBar]);

    // Hide immediate parent if has same title as parent and has other declarations
    await wrapper.setProps({ title: itemBar.title });
    hierarchy = wrapper.findComponent(Hierarchy);
    expect(hierarchy.props()).toHaveProperty('parentTopics', [itemFoo]);
  });

  it('`Hierarchy` continues working, if a reference is missing', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockReturnValue('');
    await wrapper.setProps({
      references: { 'topic://foo': itemFoo }, // set without `Bar` reference data
      hierarchyItems,
    });

    const hierarchy = wrapper.findComponent(Hierarchy);
    expect(hierarchy.exists()).toBe(true);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Reference for "topic://bar" is missing');
  });

  it('does not render a Hierarchy if hierarchyItems is empty or enableMinimized is true', async () => {
    await wrapper.setProps({ hierarchyItems: [] });
    expect(wrapper.findComponent(Hierarchy).exists()).toBe(false);

    // Minimized view should not render LanguageSwitcher
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.findComponent(Hierarchy).exists()).toBe(false);
  });

  it('does not render a Hierarchy in minimized view', async () => {
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.findComponent(Hierarchy).exists()).toBe(false);
  });

  it('render a `DocumentationHero`, enabled, if top-level technology page', () => {
    const hero = wrapper.findComponent(DocumentationHero);
    expect(hero.props()).toEqual({
      role: TopicTypes.collection,
      enhanceBackground: true,
      enableMinimized: false,
      shortHero: false,
      shouldShowLanguageSwitcher: false,
    });
  });

  it('computes `shortHero correctly', async () => {
    const hero = wrapper.findComponent(DocumentationHero);
    expect(hero.props('shortHero')).toBe(false);

    await wrapper.setProps({ abstract: '', roleHeading: '', sampleCodeDownload: '' });
    expect(hero.props('shortHero')).toBe(true);
  });

  it('render a `DocumentationHero`, disabled, if symbol page', () => {
    /* await wrapper.setProps({
      symbolKind: 'protocol',
    }); */

    // setProps isn't working for some reason...
    wrapper = shallowMount(DocumentationTopic, {
      propsData: {
        ...propsData,
        role: 'symbol',
        symbolKind: 'protocol',
      },
      provide: {
        store: mockStore,
      },
    });
    const hero = wrapper.findComponent(DocumentationHero);
    expect(hero.props()).toEqual({
      role: 'symbol',
      enhanceBackground: false,
      enableMinimized: false,
      shortHero: false,
      shouldShowLanguageSwitcher: false,
    });
  });

  it('renders a `DocumentationHero`, disabled, if `disableHeroBackground` prop is `true`', async () => {
    const hero = wrapper.findComponent(DocumentationHero);
    expect(hero.props('enhanceBackground')).toBe(true);
    await wrapper.setProps({ disableHeroBackground: true });
    expect(hero.props('enhanceBackground')).toBe(false);
  });

  it('renders a `Title`', () => {
    const hero = wrapper.findComponent(DocumentationHero);

    const title = hero.find(Title);
    expect(title.exists()).toBe(true);
    expect(title.props('eyebrow')).toBe(propsData.roleHeading);
    expect(title.text()).toContain(propsData.title);
    expect(title.find(WordBreak).exists()).toBe(false);
  });

  it('renders the right classes for `Title` based on `enableMininized` prop', async () => {
    const hero = wrapper.findComponent(DocumentationHero);
    const title = hero.find(Title);
    expect(title.classes()).not.toContain('minimized-title');

    await wrapper.setProps({ enableMinimized: true });
    expect(title.classes()).toContain('minimized-title');
  });

  it('renders a `minimized-container` class, when `enableMinimized` is true', async () => {
    const container = wrapper.findComponent('.container');
    expect(container.classes()).not.toContain('minimized-container');
    await wrapper.setProps({ enableMinimized: true });
    expect(container.classes()).toContain('minimized-container');
  });

  it('uses `WordBreak` in the title for symbol pages', async () => {
    await wrapper.setProps({
      role: 'symbol',
      symbolKind: 'protocol',
    });

    const title = wrapper.findComponent(Title);
    expect(title.exists()).toBe(true);

    const wb = title.find(WordBreak);
    expect(wb.exists()).toBe(true);
    expect(wb.text()).toBe(propsData.title);
  });

  it('renders smaller "Beta" and "Deprecated" text in title when relevant', async () => {
    const title = wrapper.findComponent(Title);
    expect(title.exists()).toBe(true);
    let smalls = title.findAll('small');
    expect(smalls.length).toBe(0);

    // both beta _and_ deprecated — deprecated has priority
    await wrapper.setProps({
      isSymbolDeprecated: true,
      isSymbolBeta: true,
    });
    smalls = title.findAll('small');
    expect(smalls.length).toBe(1);
    expect(smalls.at(0).attributes('data-tag-name')).toBe('aside-kind.deprecated');

    // only beta
    await wrapper.setProps({
      isSymbolDeprecated: false,
      isSymbolBeta: true,
    });
    smalls = title.findAll('small');
    expect(smalls.length).toBe(1);
    expect(smalls.at(0).attributes('data-tag-name')).toBe('aside-kind.beta');

    // only deprecated
    await wrapper.setProps({
      isSymbolDeprecated: true,
      isSymbolBeta: false,
    });
    smalls = title.findAll('small');
    expect(smalls.length).toBe(1);
    expect(smalls.at(0).attributes('data-tag-name')).toBe('aside-kind.deprecated');
  });

  it('renders an abstract', () => {
    const hero = wrapper.findComponent(DocumentationHero);
    const abstractComponent = hero.find(Abstract);
    expect(abstractComponent.exists()).toBe(true);
    expect(abstractComponent.props('content')).toEqual(propsData.abstract);
  });

  it('renders an abstract, with an empty string inside', async () => {
    const emptyParagraph = [{
      type: 'paragraph',
      inlineContent: [
        {
          type: 'text',
          text: '',
        },
      ],
    }];
    await wrapper.setProps({
      abstract: emptyParagraph,
    });
    const hero = wrapper.findComponent(DocumentationHero);
    const abstractComponent = hero.find(Abstract);
    expect(abstractComponent.exists()).toBe(true);
    expect(abstractComponent.props('content')).toEqual(emptyParagraph);
  });

  it('renders a `PrimaryContent`', () => {
    const primary = wrapper.findComponent(PrimaryContent);
    expect(primary.exists()).toBe(true);
    expect(primary.props('sections')).toEqual(propsData.primaryContentSections);
  });

  it('renders a `PrimaryContent` with Declarations moved out and into the Hero section', async () => {
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
    expect(wrapper.findComponent('.declarations-container').exists()).toBe(false);

    await wrapper.setProps({
      enableMinimized: true,
      primaryContentSections: [
        ...propsData.primaryContentSections,
        declarationsSection,
      ],
    });
    const primary = wrapper.findComponent(PrimaryContent);
    expect(primary.props('sections')).toEqual(propsData.primaryContentSections);
    const declarationContainer = wrapper.findComponent('.declarations-container');
    // expect(declarationContainer.classes()).not.toContain('minimized-container');
    expect(declarationContainer.find(Declaration).props()).toEqual({
      conformance: propsData.conformance,
      declarations: declarationsSection.declarations,
      source: propsData.remoteSource,
      declListExpanded: false,
    });
    // await wrapper.setProps({ enableMinimized: true });
    // commented this out and moved it to the above `setProps` call because
    // there seems to be an obscure bug with vue-test-utils where things don't
    // work right if `setProps` is called more than once with a prop that is
    // also used in the component's `provide`...
    expect(declarationContainer.classes()).toContain('minimized-container');
  });

  it('does not render a `PrimaryContent` column when passed undefined as PrimaryContent', async () => {
    await wrapper.setProps({ primaryContentSections: undefined });
    expect(wrapper.contains(PrimaryContent)).toBe(false);
  });

  it('does not render a `PrimaryContent` column when passed empty an PrimaryContent', async () => {
    await wrapper.setProps({ primaryContentSections: [] });
    expect(wrapper.contains(PrimaryContent)).toBe(false);
  });

  it('does not render a `PrimaryContent` column when passed empty an PrimaryContent & no `ViewMore` link', async () => {
    await wrapper.setProps({ primaryContentSections: [], enableMinimized: true });
    expect(wrapper.contains(PrimaryContent)).toBe(true); // ViewMore link is present

    await wrapper.setProps({
      primaryContentSections: [],
      enableMinimized: true,
      hasNoExpandedDocumentation: true,
    });
    expect(wrapper.contains(PrimaryContent)).toBe(false); // no ViewMore link
  });

  it('render a `PrimaryContent` column when passed empty an PrimaryContent but has otherDeclarations', async () => {
    await wrapper.setProps({
      primaryContentSections: [
        ...propsData.primaryContentSections,
        hasOtherDeclSection,
      ],
    });
    expect(wrapper.contains(PrimaryContent)).toBe(true); // has otherDeclarations dropdown
  });

  it('renders `ViewMore` if `enableMinimized`', async () => {
    await wrapper.setProps({
      enableMinimized: true,
      primaryContentSections: undefined,
      isRequirement: false,
      deprecationSummary: null,
      downloadNotAvailableSummary: null,
    });
    const viewMore = wrapper.findComponent(ViewMore);
    expect(viewMore.exists()).toBe(true);
    expect(viewMore.props('url')).toEqual('/documentation/swift'); // normalized path
    expect(viewMore.classes()).toContain('minimized-container');

    // should not render `ViewMore` in non-minimized mode
    await wrapper.setProps({ enableMinimized: false });
    expect(wrapper.findComponent(ViewMore).exists()).toBe(false);

    // should not render `ViewMore` if `hasNoExpandedDocumentation`
    await wrapper.setProps({ enableMinimized: true, hasNoExpandedDocumentation: true });
    expect(wrapper.findComponent(ViewMore).exists()).toBe(false);
  });

  it('renders `ViewMore` with correct language path', async () => {
    // only objcPath
    await wrapper.setProps({
      enableMinimized: true,
      swiftPath: null,
      objcPath: 'documentation/objc',
      interfaceLanguage: 'occ',
    });
    const objcViewMore = wrapper.findComponent(ViewMore);
    expect(objcViewMore.exists()).toBe(true);
    expect(objcViewMore.props('url')).toEqual('/documentation/objc'); // normalized path

    // only swiftPath
    await wrapper.setProps({
      objcPath: null,
      swiftPath: 'documentation/swift',
      interfaceLanguage: 'swift',
    });
    const swiftViewMore = wrapper.findComponent(ViewMore);
    expect(swiftViewMore.exists()).toBe(true);
    expect(swiftViewMore.props('url')).toEqual('/documentation/swift'); // normalized path

    // both paths exists, but on the objc variant
    await wrapper.setProps({
      objcPath: 'documentation/objc',
      swiftPath: 'documentation/swift',
      interfaceLanguage: 'occ',
    });
    const viewMore = wrapper.findComponent(ViewMore);
    expect(viewMore.exists()).toBe(true);
    expect(viewMore.props('url')).toEqual('/documentation/objc?language=objc'); // normalized path
  });

  describe('description column', () => {
    it('renders the description section', async () => {
      const description = wrapper.findComponent('.description');
      expect(description.exists()).toBe(true);
      expect(description.classes()).toContain('after-enhanced-hero');
      await wrapper.setProps({
        symbolKind: 'something-else',
      });
      expect(description.classes()).not.toContain('after-enhanced-hero');
    });

    it('does not render the description section if other declaration list is expanded', async () => {
      await wrapper.setData({
        declListExpanded: true,
      });
      const description = wrapper.findComponent('.description');
      expect(description.exists()).toBe(false);
    });

    it('renders a deprecated `Aside` when deprecated', async () => {
      expect(wrapper.contains(Aside)).toBe(false);
      await wrapper.setProps({ deprecationSummary });

      const aside = wrapper.findComponent(Aside);
      expect(aside.exists()).toBe(true);
      expect(aside.props('kind')).toEqual('deprecated');

      const content = aside.find(ContentNode);
      expect(content.exists()).toBe(true);
      expect(content.props('content')).toEqual(deprecationSummary);
    });

    it('renders a note `Aside` when download button is not available', async () => {
      expect(wrapper.contains(Aside)).toBe(false);
      await wrapper.setProps({ downloadNotAvailableSummary });

      const aside = wrapper.findComponent(Aside);
      expect(aside.exists()).toBe(true);
      expect(aside.props('kind')).toEqual('note');

      const content = aside.find(ContentNode);
      expect(content.exists()).toBe(true);
      expect(content.props('content')).toEqual(downloadNotAvailableSummary);
    });

    it('renders a `DownloadButton` if there is sample code to download', async () => {
      expect(wrapper.contains(DownloadButton)).toBe(false);
      await wrapper.setProps({ sampleCodeDownload });
      expect(wrapper.contains(DownloadButton)).toBe(true);
    });

    it('renders a `RequirementMetadata` if the symbol is required', async () => {
      expect(wrapper.contains(RequirementMetadata)).toBe(false);
      await wrapper.setProps({ isRequirement: true });
      expect(wrapper.contains(RequirementMetadata)).toBe(true);
    });

    it('renders a `Availability` with platforms data', async () => {
      const list = wrapper.findComponent(Availability);
      expect(list.exists()).toBe(true);
      expect(list.props('platforms')).toEqual(propsData.platforms);

      // Minimized view should not render Availability
      await wrapper.setProps({ enableMinimized: true });
      expect(wrapper.findComponent(Availability).exists()).toBe(false);
    });
  });

  it('render a declaration list menu if has other declarations', async () => {
    let declListMenu = wrapper.findComponent('.declaration-list-menu');
    expect(declListMenu.exists()).toBe(false);

    await wrapper.setProps({
      primaryContentSections: [
        ...propsData.primaryContentSections,
        hasOtherDeclSection,
      ],
    });
    declListMenu = wrapper.findComponent('.declaration-list-menu');
    expect(declListMenu.exists()).toBe(true);
  });

  it('does not render a declaration list menu in minimized mode', async () => {
    await wrapper.setProps({
      primaryContentSections: [
        ...propsData.primaryContentSections,
        hasOtherDeclSection,
      ],
    });
    let declListMenu = wrapper.findComponent('.declaration-list-menu');
    expect(declListMenu.exists()).toBe(true);

    await wrapper.setProps({ enableMinimized: true });

    declListMenu = wrapper.findComponent('.declaration-list-menu');
    expect(declListMenu.exists()).toBe(false);
  });

  it('renders correct declaration list toggle, text, and icon', async () => {
    await wrapper.setProps({
      primaryContentSections: [
        ...propsData.primaryContentSections,
        hasOtherDeclSection,
      ],
    });
    let declListMenu = wrapper.findComponent('.declaration-list-menu');
    expect(declListMenu.text()).toContain('declarations.show-all-declarations');
    let icon = wrapper.findComponent(InlinePlusCircleIcon);
    expect(icon.exists()).toBe(true);

    const toggle = wrapper.findComponent('.declaration-list-toggle');
    expect(toggle.exists()).toBe(true);
    await toggle.trigger('click');

    declListMenu = wrapper.findComponent('.declaration-list-menu');
    expect(declListMenu.exists()).toBe(true);
    expect(declListMenu.text()).toContain('declarations.hide-other-declarations');
    icon = wrapper.findComponent(InlinePlusCircleIcon);
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('expand');
  });

  it('does not render any primary content or related markup, if not provided', async () => {
    const docContent = wrapper.findComponent('.doc-content');
    expect(docContent.classes()).not.toContain('no-primary-content');
    await wrapper.setProps({
      primaryContentSections: [],
      isRequirement: false,
      deprecationSummary: null,
      downloadNotAvailableSummary: null,
      enableMinimized: false,
      hasNoExpandedDocumentation: true,
    });
    expect(wrapper.findComponent(PrimaryContent).exists()).toBe(false);
    expect(wrapper.findComponent('.description').exists()).toBe(false);
    expect(docContent.classes()).toContain('no-primary-content');
    // removes it if hero is not enhanced
    await wrapper.setProps({ disableHeroBackground: true });
    expect(docContent.classes()).not.toContain('no-primary-content');
  });

  it('renders a `LanguageSwitcher` if TargetIDE', async () => {
    const provide = {
      isTargetIDE: true,
      store: mockStore,
    };
    wrapper = shallowMount(DocumentationTopic, { propsData, provide });
    const switcher = wrapper.findComponent(LanguageSwitcher);
    expect(switcher.exists()).toBe(true);
    expect(switcher.props()).toEqual({
      interfaceLanguage: propsData.interfaceLanguage,
      objcPath: propsData.languagePaths.occ[0],
      swiftPath: propsData.languagePaths.swift[0],
    });

    // Minimized view should not render LanguageSwitcher
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.findComponent(LanguageSwitcher).exists()).toBe(false);
  });

  it('renders `Topics` if there are topic sections, passing the `topicSectionsStyle` over', async () => {
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
    await wrapper.setProps({ topicSections, topicSectionsStyle: TopicSectionsStyle.detailedGrid });

    const topics = wrapper.findComponent(Topics);
    expect(topics.exists()).toBe(true);
    expect(topics.props('sections')).toBe(topicSections);
    expect(topics.props('topicStyle')).toBe(TopicSectionsStyle.detailedGrid);

    // Minimized view should not render Topics
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.findComponent(Topics).exists()).toBe(false);
  });

  it('does not render the `Topics` if the `topicSectionsStyle` is `hidden`', async () => {
    const topicSections = [
      {
        title: 'Baz',
        identifiers: ['baz'],
      },
    ];
    await wrapper.setProps({ topicSections, topicSectionsStyle: 'hidden' });
    expect(wrapper.findComponent(Topics).exists()).toBe(false);
  });

  it('renders `SeeAlso` if there are see also sections', async () => {
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
    await wrapper.setProps({ seeAlsoSections });

    const seeAlso = wrapper.findComponent(SeeAlso);
    expect(seeAlso.exists()).toBe(true);
    expect(seeAlso.props('sections')).toBe(seeAlsoSections);

    // Minimized view should not render See Also
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.findComponent(SeeAlso).exists()).toBe(false);
  });

  it('renders `Relationships` if there are relationship sections', async () => {
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
    await wrapper.setProps({ relationshipsSections });

    const relationships = wrapper.findComponent(Relationships);
    expect(relationships.exists()).toBe(true);
    expect(relationships.props('sections')).toBe(relationshipsSections);
    expect(relationships.props('enableMinimized')).toBe(false);
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
      provide: {
        store: mockStore,
      },
    });
    const sections = wrapper.findAll('.section-stub');
    expect(sections.at(0).classes('relationships')).toBe(true);
    expect(sections.at(1).classes('see-also')).toBe(true);
  });

  it('renders `DefaultImplementations` if there are default implementation sections', async () => {
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
    await wrapper.setProps({ defaultImplementationsSections });

    const defaults = wrapper.findComponent(DefaultImplementations);
    expect(defaults.exists()).toBe(true);
    expect(defaults.props('sections')).toEqual(defaultImplementationsSections);

    // Minimized view should not render DefaultImplementations
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.findComponent(DefaultImplementations).exists()).toBe(false);
  });

  it('computes isSymbolBeta', async () => {
    const topicSections = [{}];
    await wrapper.setProps({ topicSections, isSymbolBeta: true });

    const topics = wrapper.findComponent(Topics);
    expect(topics.props('isSymbolBeta')).toBe(true);

    // should not if only one is beta
    await wrapper.setProps({
      isSymbolBeta: false,
    });
    expect(topics.props('isSymbolBeta')).toBe(false);
  });

  it('renders a beta legal text warning if at least one platform is in beta', async () => {
    expect(wrapper.findComponent(BetaLegalText).exists()).toBe(false);
    await wrapper.setProps({
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
    expect(wrapper.findComponent(BetaLegalText).exists()).toBe(true);
  });

  it('sends isSymbolDeprecated down to the Topic', async () => {
    await wrapper.setProps({ topicSections: [{}], isSymbolDeprecated: false });
    const topics = wrapper.findComponent(Topics);
    expect(topics.props('isSymbolDeprecated')).toBe(false);
    await wrapper.setProps({ isSymbolDeprecated: true });
    expect(topics.props('isSymbolDeprecated')).toBe(true);
  });

  it('renders content in the `above-title` slot', () => {
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      slots: {
        'above-title': '<div class="above-title">Above Title Content</div>',
      },
      provide: {
        store: mockStore,
      },
    });
    expect(wrapper.findComponent(DocumentationHero).contains('.above-title')).toBe(true);
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
      provide: {
        store: mockStore,
      },
    });
    expect(wrapper.contains('.above-hero-content')).toBe(true);
  });

  it('renders `OnThisPageNav` component, if enabled via prop', async () => {
    expect(wrapper.findComponent(OnThisPageNav).exists()).toBe(false);
    expect(wrapper.findComponent(OnThisPageStickyContainer).exists()).toBe(false);
    // enable the nav
    await wrapper.setProps({ enableOnThisPageNav: true });
    // assert container is visible, but not the nav
    expect(wrapper.findComponent(OnThisPageStickyContainer).exists()).toBe(true);
    expect(wrapper.findComponent(OnThisPageNav).exists()).toBe(false);
    // show the nav
    await wrapper.setData({
      topicState: {
        onThisPageSections: [{ anchor: 'foo' }, { anchor: 'bar' }, { anchor: 'baz' }],
      },
    });
    expect(wrapper.findComponent(OnThisPageNav).exists()).toBe(true);
  });

  it('hides the `OnThisPageStickyContainer`, if the store.contentWidth is below a threshold', async () => {
    expect(wrapper.classes()).not.toContain('with-on-this-page');
    await wrapper.setProps({ enableOnThisPageNav: true });
    await wrapper.setData({
      topicState: {
        contentWidth: 200,
      },
    });
    const container = wrapper.findComponent(OnThisPageStickyContainer);
    expect(container.exists()).toBe(true);
    expect(container.isVisible()).toBe(false);
    await wrapper.setData({
      topicState: {
        contentWidth: ON_THIS_PAGE_CONTAINER_BREAKPOINT + 10,
      },
    });
    expect(container.isVisible()).toBe(true);
    expect(wrapper.classes()).toContain('with-on-this-page');
  });

  it('computes a `disableMetadata` property that mirrors `enableMinimized`', async () => {
    expect(wrapper.vm.disableMetadata).toBe(false);
    await wrapper.setProps({ enableMinimized: true });
    expect(wrapper.vm.disableMetadata).toBe(true);
  });

  it('sets the references, when they update in the store', async () => {
    expect(mockStore.setReferences).toHaveBeenCalledTimes(1);
    const newReferences = {
      foo: {},
    };
    await wrapper.setProps({
      references: newReferences,
    });
    expect(mockStore.setReferences).toHaveBeenCalledTimes(2);
    expect(mockStore.setReferences).toHaveBeenCalledWith(newReferences);
  });

  it('calls `store.updateReferences` when `indexState.includedArchiveIdentifiers` changes', async () => {
    const store = {
      state: { references: {} },
      reset: jest.fn(),
      setReferences: jest.fn(),
      updateReferences: jest.fn(),
    };
    wrapper = shallowMount(DocumentationTopic, {
      propsData,
      provide: { store },
    });
    expect(store.updateReferences).not.toHaveBeenCalled();

    await wrapper.setData({
      indexState: { includedArchiveIdentifiers: ['Foo', 'Bar'] },
    });
    await wrapper.vm.$nextTick();
    expect(store.updateReferences).toHaveBeenCalled();
  });

  describe('lifecycle hooks', () => {
    it('calls `store.reset()`', () => {
      jest.clearAllMocks();
      wrapper = shallowMount(DocumentationTopic, {
        propsData,
        provide: { store: mockStore },
      });
      expect(mockStore.reset).toBeCalled();
      expect(mockStore.setReferences).toHaveBeenCalledTimes(1);
      expect(mockStore.setReferences).toHaveBeenCalledWith(propsData.references);
    });

    it('routes to the objc variant of a page if that is the preferred language', async () => {
      const $route = { query: {} };
      const $router = { replace: jest.fn() };
      const store = {
        ...mockStore,
        state: {
          ...mockStore.state,
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
