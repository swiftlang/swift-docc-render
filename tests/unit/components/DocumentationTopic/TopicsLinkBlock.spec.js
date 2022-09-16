/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import TopicsLinkBlock from 'docc-render/components/DocumentationTopic/TopicsLinkBlock.vue';
import { ChangeNames } from 'docc-render/constants/Changes';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import { TopicRole } from 'docc-render/constants/roles';

const {
  ReferenceType,
  TopicKind,
} = TopicsLinkBlock.constants;
const {
  ConditionalConstraints,
  ContentNode,
  DecoratedTopicTitle,
  RequirementMetadata,
  WordBreak,
  Badge,
  TopicLinkBlockIcon,
} = TopicsLinkBlock.components;
const { TokenKind } = DecoratedTopicTitle.constants;

describe('TopicsLinkBlock', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  const store = {
    reset: jest.fn(),
    setAPIChanges: jest.fn(),
    state: {
      onThisPageSections: [],
      apiChanges: null,
    },
  };

  const iconOverride = {
    type: 'icon',
    identifier: 'icon-override',
  };

  const references = {
    [iconOverride.identifier]: { foo: 'bar' },
  };

  const provide = {
    store,
    references,
  };

  const propsData = {
    topic: {
      abstract: [
        {
          type: 'text',
          text: 'Foo bar baz',
        },
      ],
      kind: TopicKind.article,
      role: TopicKind.article,
      title: 'Foobarbaz',
      url: '/foo/bar/baz',
      identifier: 'doc://com.example.documentation/foo/bar/baz',
      deprecated: false,
    },
  };

  const stubs = {
    'router-link': RouterLinkStub,
  };

  const currentTopicTags = [{
    type: 'custom',
    text: 'Custom',
  }, {
    type: 'custom_2',
    text: 'Custom 2',
  }];

  beforeEach(() => {
    wrapper = shallowMount(TopicsLinkBlock, {
      propsData,
      stubs,
      mocks: {
        $route: {
          query: {},
        },
      },
      provide,
    });
  });

  it('renders a .link-block root', () => {
    expect(wrapper.is('div.link-block')).toBe(true);
  });

  it('renders a router-link for the url', () => {
    const link = wrapper.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.classes('link')).toBe(true);
    expect(link.props('to')).toBe(propsData.topic.url);
    expect(link.text()).toBe(propsData.topic.title);
  });

  it('renders a normal anchor for external links', () => {
    // links have less properties
    wrapper.setProps({
      topic: {
        title: 'Foobarbaz',
        identifier: 'doc://com.example.documentation/foo/bar/baz',
        type: ReferenceType.link,
        url: 'https://foo.bar',
      },
    });

    expect(wrapper.contains(RouterLinkStub)).toBe(false);
    expect(wrapper.find(TopicLinkBlockIcon).exists()).toBe(false);

    const link = wrapper.find('a.link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://foo.bar');
    expect(link.text()).toBe(propsData.topic.title);
  });

  it('renders a TopicLinkBlockIcon with the kind of the topic', () => {
    const link = wrapper.find(TopicLinkBlockIcon);
    expect(link.exists()).toBe(true);
    expect(link.props('role')).toBe(propsData.topic.role);
  });

  it('renders a TopicLinkBlockIcon with an override', () => {
    const icon = wrapper.find(TopicLinkBlockIcon);
    expect(icon.props('imageOverride')).toBe(null);
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        images: [iconOverride, { type: 'card', identifier: 'foo' }],
      },
    });
    expect(icon.props('imageOverride')).toBe(references[iconOverride.identifier]);
  });

  it('renders a normal `WordBreak` for the link text', () => {
    const wordBreak = wrapper.find('.link').find(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('span');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <code> tag for link text to symbols', () => {
    wrapper.setProps({ topic: { ...propsData.topic, kind: TopicKind.symbol } });
    const wordBreak = wrapper.find('.link').find(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('code');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <span> tag for Framework name links in Topic that have role collection', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        role: TopicRole.collection,
        kind: TopicKind.symbol,
      },
    });
    const wordBreak = wrapper.find('.link').find(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('span');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <span> tag for property list links in Topic, which have role dictionarySymbol', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        role: TopicRole.dictionarySymbol,
        kind: TopicKind.symbol,
      },
    });
    const wordBreak = wrapper.find('.link').find(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('span');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <code> tag for Framework name links in Topic that do NOT have role collection or dictionarySymbol', () => {
    wrapper.setProps({ topic: { ...propsData.topic, kind: TopicKind.symbol } });
    const wordBreak = wrapper.find('.link').find(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('code');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <code> tag for links with a titleStyle == title and no ideTitle', () => {
    wrapper.setProps({ topic: { ...propsData.topic, titleStyle: 'title' } });
    const wordBreak = wrapper.find('.link').find(WordBreak);

    expect(wordBreak.attributes('tag')).toEqual('code');
  });

  it('renders a `WordBreak` using <span> tag for links with a titleStyle == title and an ideTitle', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        kind: TopicKind.symbol, // enforce a symbol kind
        titleStyle: 'title',
        ideTitle: 'Some title',
      },
    });
    const wordBreak = wrapper.find('.link').find(WordBreak);

    expect(wordBreak.attributes('tag')).toEqual('span');
  });

  it('renders a `WordBreak` using <span> tag for links with no titleStyle but have an ideTitle', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        ideTitle: 'Some title',
      },
    });
    const wordBreak = wrapper.find('.link').find(WordBreak);

    expect(wordBreak.attributes('tag')).toEqual('span');
  });

  it('does not render API changes VO helper, by default', () => {
    expect(wrapper.find('.link .visuallyhidden').exists()).toBe(false);
  });

  it('does not render an abstract container if none of its elements are to be rendered', () => {
    wrapper.setProps({
      topic: {
        title: 'Foobarbaz',
        url: '/foo/bar/baz',
        role: TopicKind.article,
      },
    });
    expect(wrapper.classes()).toContain('has-inline-element');
    expect(wrapper.find('.abstract').exists()).toBe(false);
    expect(wrapper.find('.has-adjacent-elements').exists()).toBe(false);
    expect(wrapper.find(ContentNode).exists()).toBe(false);
  });

  it('applies the `multipleLinesClass` class if `hasMultipleLinesAfterAPIChanges` is true', () => {
    wrapper = shallowMount({
      ...TopicsLinkBlock,
      computed: {
        ...TopicsLinkBlock.computed,
        hasMultipleLinesAfterAPIChanges: () => true,
      },
    },
    {
      propsData,
      stubs,
      mocks: {
        $route: {
          query: {},
        },
      },
      provide,
    });

    expect(wrapper.classes()).toContain(multipleLinesClass);
  });

  it('does not render an abstract container if the abstract is empty', () => {
    wrapper.setProps({
      topic: {
        title: 'Foobarbaz',
        url: '/foo/bar/baz',
        role: TopicKind.article,
        abstract: [],
      },
    });
    expect(wrapper.classes()).toContain('has-inline-element');
    expect(wrapper.find('.abstract').exists()).toBe(false);
    expect(wrapper.find('.has-adjacent-elements').exists()).toBe(false);
    expect(wrapper.find(ContentNode).exists()).toBe(false);
  });

  it('renders a `ContentNode` with the abstract', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.topic.abstract);
    expect(wrapper.find('.has-adjacent-elements').exists()).toBe(true);
  });

  it('does not render a `ContentNode` without an abstract', () => {
    wrapper.setProps({ topic: { ...propsData.topic, abstract: undefined } });
    expect(wrapper.contains(ContentNode)).toBe(false);
  });

  it('renders a deprecated badge when the topic is deprecated', () => {
    expect(wrapper.contains(Badge)).toBe(false);
    wrapper.setProps({ topic: { ...propsData.topic, deprecated: true } });
    expect(wrapper.find(Badge).attributes('variant')).toBe('deprecated');
  });

  it('does not render a deprecated badge when the symbol is deprecated', () => {
    wrapper.setProps({ isSymbolDeprecated: true });
    expect(wrapper.contains(Badge)).toBe(false);
    wrapper.setProps({ topic: { ...propsData.topic, deprecated: true } });
    expect(wrapper.contains(Badge)).toBe(false);
  });

  it('strikesthrough the text if the topic is deprecated', () => {
    expect(wrapper.find('.link').classes('deprecated')).toBe(false);
    wrapper.setProps({ topic: { ...propsData.topic, deprecated: true } });
    expect(wrapper.find('.link').classes('deprecated')).toBe(true);
  });

  it('does not strikethrough the text if the parent symbol is deprecated', () => {
    expect(wrapper.find('.link').classes('deprecated')).toBe(false);
    wrapper.setProps({ isSymbolDeprecated: true, deprecated: true });
    expect(wrapper.find('.link').classes('deprecated')).toBe(false);
  });

  it('renders a beta badge when the topic is in beta', () => {
    wrapper.setProps({ topic: { ...propsData.topic, beta: true } });
    expect(wrapper.find(Badge).attributes('variant')).toBe('beta');
  });

  it('does not render a beta badge if the topic is deprecated', () => {
    wrapper.setProps({ topic: { ...propsData.topic, deprecated: true, beta: true } });
    expect(wrapper.findAll(Badge).length).toBe(1);
    expect(wrapper.find(Badge).attributes('variant')).toBe('deprecated');
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        deprecated: true,
        isSymbolDeprecated: true,
        beta: true,
      },
    });
    expect(wrapper.findAll(Badge).length).toBe(1);
    expect(wrapper.find(Badge).attributes('variant')).toBe('deprecated');
  });

  it('renders a beta badge when the topic is in beta and the symbol is deprecated', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        deprecated: false,
        isSymbolDeprecated: true,
        beta: true,
      },
    });
    expect(wrapper.findAll(Badge).length).toBe(1);
    expect(wrapper.find(Badge).attributes('variant')).toBe('beta');
  });

  it('renders current topic badges', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        tags: currentTopicTags,
      },
    });
    const badges = wrapper.findAll(Badge);
    expect(badges.length).toBe(1);
    expect(badges.at(0).attributes('variant')).toBe('custom');
    expect(badges.at(0).text()).toBe('Custom');
  });

  it('does not provide slot content, if badge has no text', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        tags: [{
          type: 'custom',
        }],
      },
    });
    const badges = wrapper.findAll(Badge);
    expect(badges.length).toBe(1);
    expect(badges.at(0).attributes('variant')).toBe('custom');
    expect(badges.at(0).text()).toBe('');
  });

  it('renders current topic badges alongside beta/deprecated badges. Badges coming after others.', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        tags: currentTopicTags,
        beta: true,
      },
    });
    const badges = wrapper.findAll(Badge);
    expect(badges.length).toBe(2);
    expect(badges.at(0).attributes('variant')).toBe('beta');
    expect(badges.at(1).attributes('variant')).toBe('custom');
  });

  it('renders a `DecoratedTopicTitle` when a topic has `fragments`', () => {
    const fragments = [
      {
        kind: TokenKind.keyword,
        text: 'class',
      },
      {
        kind: TokenKind.identifier,
        text: 'Foo',
      },
    ];
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        fragments,
      },
    });

    const decoratedTitle = wrapper.find('.link').find(DecoratedTopicTitle);
    expect(decoratedTitle.exists()).toBe(true);
    expect(decoratedTitle.props('tokens')).toEqual(fragments);
    expect(wrapper.contains(WordBreak)).toBe(false);
  });

  it('renders the text as strikethrough if the topic is deprecated but deprecated symbol is false', () => {
    expect(wrapper.find('.link').classes('deprecated')).toBe(false);
    wrapper.setProps({
      isSymbolDeprecated: false,
      topic: { ...propsData.topic, deprecated: true },
    });
    expect(wrapper.find('.link').classes('deprecated')).toBe(true);
  });

  it('renders a `RequirementMetadata` with defaultImplementations > 0', () => {
    let node = wrapper.find(RequirementMetadata);
    expect(node.exists()).toBe(false);
    wrapper.setProps({ topic: { ...propsData.topic, defaultImplementations: 1, required: true } });
    node = wrapper.find(RequirementMetadata);
    expect(node.exists()).toBe(true);
    expect(node.attributes('defaultimplementationscount')).toEqual('1');
  });

  it('renders a `ConditionalConstraints` for availability with `conformance` data', () => {
    const conformance = {
      availabilityPrefix: [{ type: 'text', text: 'Available when' }],
      constraints: [{ type: 'codeVoice', code: 'Foo' }],
    };
    wrapper.setProps({ topic: { ...propsData.topic, conformance } });

    const constraints = wrapper.find(ConditionalConstraints);
    expect(constraints.exists()).toBe(true);
    expect(constraints.props()).toEqual({
      constraints: conformance.constraints,
      prefix: conformance.availabilityPrefix,
    });
  });

  it('does not render plist keyinfo if ideTitle is not provided', () => {
    expect(wrapper.find('.topic-keyinfo').exists()).toBe(false);
  });

  it('renders the plist key name', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        ideTitle: 'IDE Title',
        titleStyle: 'title',
        name: 'some.symbol.thing',
      },
    });

    expect(wrapper.find('.topic-keyinfo').text()).toEqual('Key: some.symbol.thing');
  });

  it('renders the plist key ideTitle', () => {
    wrapper.setProps({
      topic: {
        ...propsData.topic,
        ideTitle: 'IDE Title',
        titleStyle: 'symbol',
        name: 'some.symbol.thing',
      },
    });

    expect(wrapper.find('.topic-keyinfo').text()).toEqual('Name: IDE Title');
  });

  describe('API Changes', () => {
    const assertHasAPIChanges = (changeType, isOnLink) => {
      store.state.apiChanges = {
        'doc://com.example.documentation/foo/bar/baz': {
          change: changeType,
        },
      };

      const link = wrapper.find('.link');
      expect(link.classes('changed')).toBe(isOnLink);
      expect(link.classes(`changed-${changeType}`)).toBe(isOnLink);
      expect(link.find('.visuallyhidden').text()).toEqual(`- ${ChangeNames[changeType]}`);

      const linkBlock = wrapper.find('.link-block');
      expect(linkBlock.classes('changed')).toBe(!isOnLink);
      expect(linkBlock.classes(`changed-${changeType}`)).toBe(!isOnLink);
    };

    it('does not render the TopicLinkBlockIcon', () => {
      expect(wrapper.find(TopicLinkBlockIcon).exists()).toBe(true);
      store.state.apiChanges = {
        [propsData.topic.identifier]: {
          change: 'modified',
        },
      };
      expect(wrapper.find(TopicLinkBlockIcon).exists()).toBe(false);
    });

    describe('when the topic does not have an abstract', () => {
      beforeEach(() => {
        wrapper = shallowMount(TopicsLinkBlock, {
          propsData: {
            ...propsData,
            topic: {
              ...propsData.topic,
              abstract: [],
            },
          },
          stubs,
          mocks: {
            $route: {
              query: {},
            },
          },
          provide,
        });
      });

      it('attaches changed classes if the topic has been modified', () => {
        assertHasAPIChanges('modified', false);
      });

      it('attaches changed classes if the topic has been added', () => {
        assertHasAPIChanges('added', false);
      });

      it('attaches changed classes if the topic has been deprecated', () => {
        assertHasAPIChanges('deprecated', false);
      });
    });

    describe('when the topic has an abstract', () => {
      it('attaches changed classes if the topic has been modified', () => {
        assertHasAPIChanges('modified', true);
      });

      it('attaches changed classes if the topic has been added', () => {
        assertHasAPIChanges('added', true);
      });

      it('attaches changed classes if the topic has been deprecated', () => {
        assertHasAPIChanges('deprecated', true);
      });
    });
  });
});
