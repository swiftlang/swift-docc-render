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
      references: {},
    },
  };

  const provide = {
    store,
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
    expect(wrapper.element.matches('div.link-block')).toBe(true);
  });

  it('renders a router-link for the url', () => {
    const link = wrapper.findComponent(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.classes('link')).toBe(true);
    expect(link.props('to')).toBe(propsData.topic.url);
    expect(link.text()).toBe(propsData.topic.title);
  });

  it('renders a normal anchor for external links', async () => {
    // links have less properties
    await wrapper.setProps({
      topic: {
        title: 'Foobarbaz',
        identifier: 'doc://com.example.documentation/foo/bar/baz',
        type: ReferenceType.link,
        url: 'https://foo.bar',
      },
    });

    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false);
    expect(wrapper.findComponent(TopicLinkBlockIcon).exists()).toBe(false);

    const link = wrapper.findComponent('a.link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://foo.bar');
    expect(link.text()).toBe(propsData.topic.title);
  });

  it('renders a TopicLinkBlockIcon with the kind of the topic', () => {
    const link = wrapper.findComponent(TopicLinkBlockIcon);
    expect(link.exists()).toBe(true);
    expect(link.props('role')).toBe(propsData.topic.role);
  });

  it('renders a normal `WordBreak` for the link text', () => {
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('span');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <code> tag for link text to symbols', async () => {
    await wrapper.setProps({ topic: { ...propsData.topic, kind: TopicKind.symbol } });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('code');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <span> tag for Framework name links in Topic that have role collection', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        role: TopicRole.collection,
        kind: TopicKind.symbol,
      },
    });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('span');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <span> tag for property list links in Topic, which have role dictionarySymbol', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        role: TopicRole.dictionarySymbol,
        kind: TopicKind.symbol,
      },
    });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('span');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <code> tag for Framework name links in Topic that do NOT have role collection or dictionarySymbol', async () => {
    await wrapper.setProps({ topic: { ...propsData.topic, kind: TopicKind.symbol } });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);
    expect(wordBreak.exists()).toBe(true);
    expect(wordBreak.attributes('tag')).toBe('code');
    expect(wordBreak.text()).toBe(propsData.topic.title);
  });

  it('renders a `WordBreak` using <code> tag for links with a titleStyle == title and no ideTitle', async () => {
    await wrapper.setProps({ topic: { ...propsData.topic, titleStyle: 'title' } });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);

    expect(wordBreak.attributes('tag')).toEqual('code');
  });

  it('renders a `WordBreak` using <span> tag for links with a titleStyle == title and an ideTitle', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        kind: TopicKind.symbol, // enforce a symbol kind
        titleStyle: 'title',
        ideTitle: 'Some title',
      },
    });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);

    expect(wordBreak.attributes('tag')).toEqual('span');
  });

  it('renders a `WordBreak` using <span> tag for links with no titleStyle but have an ideTitle', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        ideTitle: 'Some title',
      },
    });
    const wordBreak = wrapper.findComponent('.link').findComponent(WordBreak);

    expect(wordBreak.attributes('tag')).toEqual('span');
  });

  it('does not render API changes VO helper, by default', () => {
    expect(wrapper.findComponent('.link .visuallyhidden').exists()).toBe(false);
  });

  it('does not render an abstract container if none of its elements are to be rendered', async () => {
    await wrapper.setProps({
      topic: {
        title: 'Foobarbaz',
        url: '/foo/bar/baz',
        role: TopicKind.article,
      },
    });
    expect(wrapper.classes()).toContain('has-inline-element');
    expect(wrapper.findComponent('.abstract').exists()).toBe(false);
    expect(wrapper.findComponent('.has-adjacent-elements').exists()).toBe(false);
    expect(wrapper.findComponent(ContentNode).exists()).toBe(false);
  });

  it('applies the `multipleLinesClass` class if `displaysMultipleLinesAfterAPIChanges` is true', () => {
    wrapper = shallowMount({
      ...TopicsLinkBlock,
      computed: {
        ...TopicsLinkBlock.computed,
        displaysMultipleLinesAfterAPIChanges: () => true,
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

  it('does not render an abstract container if the abstract is empty', async () => {
    await wrapper.setProps({
      topic: {
        title: 'Foobarbaz',
        url: '/foo/bar/baz',
        role: TopicKind.article,
        abstract: [],
      },
    });
    expect(wrapper.classes()).toContain('has-inline-element');
    expect(wrapper.findComponent('.abstract').exists()).toBe(false);
    expect(wrapper.findComponent('.has-adjacent-elements').exists()).toBe(false);
    expect(wrapper.findComponent(ContentNode).exists()).toBe(false);
  });

  it('renders a `ContentNode` with the abstract', () => {
    const node = wrapper.findComponent(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.topic.abstract);
    expect(wrapper.findComponent('.has-adjacent-elements').exists()).toBe(true);
  });

  it('does not render a `ContentNode` without an abstract', async () => {
    await wrapper.setProps({ topic: { ...propsData.topic, abstract: undefined } });
    expect(wrapper.findComponent(ContentNode).exists()).toBe(false);
  });

  it('renders a deprecated badge when the topic is deprecated', async () => {
    expect(wrapper.findComponent(Badge).exists()).toBe(false);
    await wrapper.setProps({ topic: { ...propsData.topic, deprecated: true } });
    expect(wrapper.findComponent(Badge).attributes('variant')).toBe('deprecated');
  });

  it('does not render a deprecated badge when the symbol is deprecated', async () => {
    await wrapper.setProps({ isSymbolDeprecated: true });
    expect(wrapper.findComponent(Badge).exists()).toBe(false);
    await wrapper.setProps({ topic: { ...propsData.topic, deprecated: true } });
    expect(wrapper.findComponent(Badge).exists()).toBe(false);
  });

  it('strikesthrough the text if the topic is deprecated', async () => {
    expect(wrapper.findComponent('.link').classes('deprecated')).toBe(false);
    await wrapper.setProps({ topic: { ...propsData.topic, deprecated: true } });
    expect(wrapper.findComponent('.link').classes('deprecated')).toBe(true);
  });

  it('does not strikethrough the text if the parent symbol is deprecated', async () => {
    expect(wrapper.findComponent('.link').classes('deprecated')).toBe(false);
    await wrapper.setProps({ isSymbolDeprecated: true, deprecated: true });
    expect(wrapper.findComponent('.link').classes('deprecated')).toBe(false);
  });

  it('renders a beta badge when the topic is in beta', async () => {
    await wrapper.setProps({ topic: { ...propsData.topic, beta: true } });
    expect(wrapper.findComponent(Badge).attributes('variant')).toBe('beta');
  });

  it('does not render a beta badge if the topic is deprecated', async () => {
    await wrapper.setProps({ topic: { ...propsData.topic, deprecated: true, beta: true } });
    expect(wrapper.findAllComponents(Badge).length).toBe(1);
    expect(wrapper.findComponent(Badge).attributes('variant')).toBe('deprecated');
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        deprecated: true,
        isSymbolDeprecated: true,
        beta: true,
      },
    });
    expect(wrapper.findAllComponents(Badge).length).toBe(1);
    expect(wrapper.findComponent(Badge).attributes('variant')).toBe('deprecated');
  });

  it('renders a beta badge when the topic is in beta and the symbol is deprecated', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        deprecated: false,
        isSymbolDeprecated: true,
        beta: true,
      },
    });
    expect(wrapper.findAllComponents(Badge).length).toBe(1);
    expect(wrapper.findComponent(Badge).attributes('variant')).toBe('beta');
  });

  it('renders current topic badges', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        tags: currentTopicTags,
      },
    });
    const badges = wrapper.findAllComponents(Badge);
    expect(badges.length).toBe(1);
    expect(badges.at(0).attributes('variant')).toBe('custom');
    expect(badges.at(0).text()).toBe('Custom');
  });

  it('does not provide slot content, if badge has no text', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        tags: [{
          type: 'custom',
        }],
      },
    });
    const badges = wrapper.findAllComponents(Badge);
    expect(badges.length).toBe(1);
    expect(badges.at(0).attributes('variant')).toBe('custom');
    expect(badges.at(0).text()).toBe('');
  });

  it('renders current topic badges alongside beta/deprecated badges. Badges coming after others.', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        tags: currentTopicTags,
        beta: true,
      },
    });
    const badges = wrapper.findAllComponents(Badge);
    expect(badges.length).toBe(2);
    expect(badges.at(0).attributes('variant')).toBe('beta');
    expect(badges.at(1).attributes('variant')).toBe('custom');
  });

  it('renders a `DecoratedTopicTitle` when a topic has `fragments`', async () => {
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
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        fragments,
      },
    });

    const decoratedTitle = wrapper.findComponent('.link').findComponent(DecoratedTopicTitle);
    expect(decoratedTitle.exists()).toBe(true);
    expect(decoratedTitle.props('tokens')).toEqual(fragments);
    expect(wrapper.findComponent(WordBreak).exists()).toBe(false);
  });

  it('renders the text as strikethrough if the topic is deprecated but deprecated symbol is false', async () => {
    expect(wrapper.findComponent('.link').classes('deprecated')).toBe(false);
    await wrapper.setProps({
      isSymbolDeprecated: false,
      topic: { ...propsData.topic, deprecated: true },
    });
    expect(wrapper.findComponent('.link').classes('deprecated')).toBe(true);
  });

  it('renders a `RequirementMetadata` with defaultImplementations > 0', async () => {
    let node = wrapper.findComponent(RequirementMetadata);
    expect(node.exists()).toBe(false);
    await wrapper.setProps(
      { topic: { ...propsData.topic, defaultImplementations: 1, required: true } },
    );
    node = wrapper.findComponent(RequirementMetadata);
    expect(node.exists()).toBe(true);
    expect(node.attributes('defaultimplementationscount')).toEqual('1');
  });

  it('does not render plist keyinfo if ideTitle is not provided', () => {
    expect(wrapper.findComponent('.topic-keyinfo').exists()).toBe(false);
  });

  it('renders the plist key name', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        ideTitle: 'IDE Title',
        titleStyle: 'title',
        name: 'some.symbol.thing',
      },
    });

    expect(wrapper.findComponent('.topic-keyinfo').text()).toEqual('Key: some.symbol.thing');
  });

  it('renders the plist key ideTitle', async () => {
    await wrapper.setProps({
      topic: {
        ...propsData.topic,
        ideTitle: 'IDE Title',
        titleStyle: 'symbol',
        name: 'some.symbol.thing',
      },
    });

    expect(wrapper.findComponent('.topic-keyinfo').text()).toEqual('Name: IDE Title');
  });

  describe('API Changes', () => {
    const assertHasAPIChanges = async (changeType, isOnLink) => {
      store.state.apiChanges = {
        'doc://com.example.documentation/foo/bar/baz': {
          change: changeType,
        },
      };

      const link = wrapper.findComponent('.link');
      await wrapper.vm.$nextTick();
      expect(link.classes('changed')).toBe(isOnLink);
      expect(link.classes(`changed-${changeType}`)).toBe(isOnLink);
      expect(link.find('.visuallyhidden').text()).toEqual(`- ${ChangeNames[changeType]}`);

      const linkBlock = wrapper.findComponent('.link-block');
      expect(linkBlock.classes('changed')).toBe(!isOnLink);
      expect(linkBlock.classes(`changed-${changeType}`)).toBe(!isOnLink);
    };

    it('does not render the TopicLinkBlockIcon', async () => {
      expect(wrapper.findComponent(TopicLinkBlockIcon).exists()).toBe(true);
      store.state.apiChanges = {
        [propsData.topic.identifier]: {
          change: 'modified',
        },
      };
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(TopicLinkBlockIcon).exists()).toBe(false);
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
