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
import ResourcesTile from 'docc-render/components/TutorialsOverview/ResourcesTile.vue';

const { Identifier } = ResourcesTile.constants;
const {
  ContentNode,
  CurlyBracketsIcon,
  DocumentIcon,
  DownloadIcon,
  ForumIcon,
  PlayIcon,
  Reference,
  DestinationDataProvider,
} = ResourcesTile.components;

const stubs = { DestinationDataProvider };
const fooReference = {
  title: 'Foobar',
  url: 'https://foo.baz',
};
const references = {
  'doc://foo.baz': fooReference,
};

describe('ResourcesTile', () => {
  let wrapper;

  const propsData = {
    title: 'Documentation',
    action: {
      destination: 'https://foo.bar',
      title: 'Foobar',
      type: 'link',
    },
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
  };

  beforeEach(() => {
    wrapper = shallowMount(ResourcesTile, {
      propsData,
      stubs,
      provide: { references },
    });
  });

  it('renders a .tile root', () => {
    expect(wrapper.is('.tile')).toBe(true);
  });

  it('renders the title', () => {
    const title = wrapper.find('.title');
    expect(title.text()).toBe(propsData.title);
  });

  it('renders a `ContentNode`', () => {
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('renders a `Reference` from a destination type:link', () => {
    const ref = wrapper.find(Reference);
    expect(ref.classes('link')).toBe(true);
    expect(ref.props('url')).toBe(propsData.action.destination);
    expect(ref.text()).toBe(propsData.action.title);
  });

  it('renders a `Reference`, from a destination type:reference', () => {
    wrapper.setProps({
      action: {
        identifier: 'doc://foo.baz',
        type: 'reference',
      },
    });
    const ref = wrapper.find(Reference);
    expect(ref.classes('link')).toBe(true);
    expect(ref.props('url')).toBe(fooReference.url);
    expect(ref.text()).toBe(fooReference.title);
  });

  it('does not render an icon without a known `identifier`', () => {
    expect(wrapper.findAll('.icon').length).toBe(0);
    wrapper.setProps({ identifier: 'fakeidentifier' });
    expect(wrapper.findAll('.icon').length).toBe(1);
  });

  it('renders preset icons for known `identifier` values', () => {
    const assertIconForIdentifier = (Icon, identifier) => {
      wrapper.setProps({ identifier });
      expect(wrapper.findAll('.icon').length).toBe(1);
      expect(wrapper.contains(Icon)).toBe(true);
    };
    assertIconForIdentifier(DocumentIcon, Identifier.documentation);
    assertIconForIdentifier(DownloadIcon, Identifier.downloads);
    assertIconForIdentifier(ForumIcon, Identifier.forums);
    assertIconForIdentifier(CurlyBracketsIcon, Identifier.sampleCode);
    assertIconForIdentifier(PlayIcon, Identifier.videos);
  });
});
