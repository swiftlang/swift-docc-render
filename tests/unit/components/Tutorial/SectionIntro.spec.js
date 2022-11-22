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
import SectionIntro from 'docc-render/components/Tutorial/SectionIntro.vue';

const {
  Asset,
  ContentNode,
  ExpandedIntro,
  Headline,
} = SectionIntro.components;

describe('SectionIntro', () => {
  let wrapper;

  const paragraph = {
    type: 'paragraph',
    inlineContent: [
      {
        type: 'text',
        text: 'foo',
      },
    ],
  };

  const propsData = {
    content: [paragraph],
    media: 'foo.jpg',
    title: 'Foobar',
    sectionNumber: 42,
    sectionAnchor: 'Initiate-ARKit-plane-detection',
  };

  const query = {
    context: 'foo',
  };

  const $route = {
    name: 'project-detail',
    params: {},
    path: '/tutorials/augmented-reality/basic-augmented-reality-app',
    query,
  };

  beforeEach(() => {
    wrapper = shallowMount(SectionIntro, {
      propsData,
      provide: {
        isClientMobile: false,
      },
      mocks: {
        $route,
      },
      stubs: {
        'router-link': RouterLinkStub,
      },
    });
  });

  it('renders an .intro-container', () => {
    expect(wrapper.is('.intro-container')).toBe(true);
  });

  it('renders an .intro', () => {
    expect(wrapper.contains('.intro')).toBe(true);
  });

  it('renders a `Headline`', () => {
    const headline = wrapper.find(Headline);
    expect(headline.exists()).toBe(true);
    expect(headline.props('level')).toBe(2);

    const eyebrowLink = headline.find(RouterLinkStub);
    expect(eyebrowLink.exists()).toBe(true);

    expect(eyebrowLink.props('to')).toEqual({
      hash: propsData.sectionAnchor,
      path: $route.path,
      query: $route.query,
    });
    // Starts with the eyebrow.
    expect(eyebrowLink.text()).toMatch(/^Section 42/);

    // Ends with the h2.
    expect(headline.text()).toMatch(/Foobar$/);
  });

  it('renders a `ContentNode`', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual([paragraph]);
  });

  it('renders an `Asset`', () => {
    const asset = wrapper.find('.media').find(Asset);
    expect(asset.exists()).toBe(true);
    expect(asset.props('identifier')).toBe('foo.jpg');
    expect(asset.props()).toEqual({
      identifier: 'foo.jpg',
      showsReplayButton: true,
      showsVideoControls: false,
      videoAutoplays: true,
      videoMuted: true,
    });
  });

  it('does not render `ExpandedIntro` without `expandedSections`', () => {
    expect(wrapper.contains(ExpandedIntro)).toBe(false);
  });

  describe('with `expandedSections`', () => {
    const expandedSections = [
      {
        kind: ExpandedIntro.LayoutKind.fullWidth,
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'foo',
              },
            ],
          },
        ],
      },
    ];

    beforeEach(() => {
      wrapper.setProps({ expandedSections });
    });

    it('renders an `ExpandedIntro`', () => {
      const expandedIntro = wrapper.find(ExpandedIntro);
      expect(expandedIntro.exists()).toBe(true);
      expect(expandedIntro.props()).toEqual({
        content: expandedSections,
      });
    });
  });
});

describe('on mobile', () => {
  let wrapper;

  const paragraph = {
    type: 'paragraph',
    inlineContent: [
      {
        type: 'text',
        text: 'foo',
      },
    ],
  };

  const propsData = {
    content: [paragraph],
    media: 'foo.jpg',
    title: 'Foobar',
    sectionNumber: 42,
    sectionAnchor: 'Initiate-ARKit-plane-detection',
  };

  beforeEach(() => {
    wrapper = shallowMount(SectionIntro, {
      propsData,
      provide: {
        isClientMobile: true,
      },
      mocks: {
        $route: {
          name: 'project-detail',
          params: {},
          path: '/tutorials/augmented-reality/basic-augmented-reality-app',
        },
      },
      stubs: {
        'router-link': RouterLinkStub,
      },
    });
  });

  it('renders an `Asset` with special video related props', () => {
    const assetProps = wrapper.find(Asset).props();
    expect(assetProps.showsReplayButton).toBe(false);
    expect(assetProps.showsVideoControls).toBe(true);
    expect(assetProps.videoAutoplays).toBe(false);
  });
});

describe('in IDE', () => {
  it('adds the "ide" class to intro', () => {
    const intro = shallowMount(SectionIntro, {
      propsData: {
        content: [],
        media: 'foo.jpg',
        title: 'Foobar',
        sectionNumber: 42,
        sectionAnchor: 'Initiate-ARKit-plane-detection',
      },
      provide: { isTargetIDE: true },
      mocks: {
        $route: {
          name: 'project-detail',
          params: {},
          path: '/tutorials/augmented-reality/basic-augmented-reality-app',
        },
      },
      stubs: {
        'router-link': RouterLinkStub,
      },
    }).find('.intro');
    expect(intro.exists()).toBe(true);
    expect(intro.classes('ide')).toBe(true);
  });
});
