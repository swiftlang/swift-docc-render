/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2025 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Index from '@/views/Index.vue';
import Navigator from 'docc-render/components/Navigator.vue';

const defaultMocks = {
  $bridge: {
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
  $route: {},
};

const messages = {
  'documentation.hero.title': 'Developer Documentation',
  'documentation.hero.copy': 'Browse the latest API reference.',
};

const DocumentationLayoutStub = {
  name: 'DocumentationLayout',
  props: ['enableNavigator', 'interfaceLanguage', 'references', 'navigatorFixedWidth', 'quickNavNodes'],
  template: '<div><slot name="navigator"></slot><slot name="content"></slot></div>',
};

const baseDataFn = (
  Index.options && Index.options.data
    ? Index.options.data.bind(Index)
    : () => ({})
);
const baseData = baseDataFn();

const mountWith = (indexStateOverrides = {}, extraOptions = {}) => shallowMount(Index, {
  mocks: {
    ...defaultMocks,
    $t: key => messages[key] || key,
    $te: key => Boolean(messages[key]),
  },
  stubs: {
    DocumentationLayout: DocumentationLayoutStub,
    Navigator: false,
    QuickNavigationButton: true,
    TopicTypeIcon: true,
    RouterLink: {
      render(h) { return h('a', {}, this.$slots.default); },
    },
    ...(extraOptions.stubs || {}),
  },
  data: () => ({
    ...baseData,
    indexState: {
      ...(baseData.indexState || {}),
      flatChildren: [],
      topLevelNodes: [],
      references: {},
      ...indexStateOverrides,
    },
  }),
  computed: {
    indexNodes: () => [],
    ...(extraOptions.computed || {}),
  },
});

describe('Index view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero text from translation keys', () => {
    const wrapper = mountWith();
    expect(wrapper.find('.hero__title').text()).toBe('Developer Documentation');
    expect(wrapper.find('.hero__lede').text()).toBe('Browse the latest API reference.');
  });

  it('passes top-level nodes to navigator only', () => {
    const topLevelNodes = [{ path: '/documentation/foo', title: 'Foo', type: 'module' }];
    const wrapper = mountWith({ topLevelNodes });
    const nav = wrapper.findComponent(Navigator);
    expect(nav.exists()).toBe(true);
    expect(nav.props('flatChildren').length).toBe(1);
    expect(nav.props('flatChildren')[0].path).toBe('/documentation/foo');
  });

  it('hides sections when lists are empty', () => {
    const wrapper = mountWith();
    expect(wrapper.find('section.index-section--grid').exists()).toBe(false);
  });
});
