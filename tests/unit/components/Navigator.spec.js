/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Navigator from '@/components/Navigator.vue';
import { shallowMount } from '@vue/test-utils';
import NavigatorCard from '@/components/Navigator/NavigatorCard.vue';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';
import { TopicTypes } from '@/constants/TopicTypes';
import { INDEX_ROOT_KEY } from '@/constants/sidebar';

jest.mock('docc-render/utils/throttle', () => jest.fn(v => v));

const technology = {
  title: 'FooTechnology',
  children: [
    {
      title: 'Group Marker',
      type: TopicTypes.groupMarker,
    },
    {
      title: 'Child0',
      path: '/foo/child0',
      type: 'article',
      children: [
        {
          title: 'Group Marker, Child 0',
          type: TopicTypes.groupMarker,
        },
        {
          title: 'Child0_GrandChild0',
          path: '/foo/child0/grandchild0',
          type: 'tutorial',
        },
        {
          title: 'Child0_GrandChild1',
          path: '/foo/child0/grandchild1',
          type: 'tutorial',
          children: [{
            title: 'Child0_GrandChild0_GreatGrandChild0',
            path: '/foo/child0/grandchild0/greatgrandchild0',
            type: 'tutorial',
          }],
        },
        {
          title: 'Child0_GrandChild2',
          path: '/foo/child0/grandchild2',
          type: 'tutorial',
        },
      ],
    },
    {
      title: 'Child1',
      path: '/foo/child1/',
      type: 'tutorial',
      children: [{
        title: 'Child1_GrandChild0',
        path: '/foo/child1/grandchild0',
        type: 'method',
      }],
    },
  ],
  path: '/path/to/technology',
};

const references = {
  technologies: { kind: 'technologies' },
  root: { url: 'root' },
  first: { url: 'first' },
  second: { url: 'second' },
  third: { url: 'third' },
};

const parentTopicIdentifiers = [
  'root', 'first', 'second',
];

const fallbackTechnology = {
  title: 'FallbackTechnology',
  url: '/url/to/technology',
};

const mocks = {
  $route: {
    path: '/current/path',
  },
};

const navigatorReferences = {
  foo: {},
};

const defaultProps = {
  parentTopicIdentifiers,
  technology,
  references,
  scrollLockID: 'foo',
  renderFilterOnTop: false,
  navigatorReferences,
  flatChildren: [],
};

const fauxAnchor = document.createElement('DIV');
Object.defineProperty(fauxAnchor, 'offsetTop', { value: 0, writable: true });
fauxAnchor.id = baseNavStickyAnchorId;
document.body.appendChild(fauxAnchor);

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(Navigator, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  mocks,
  ...others,
});

const errorSpy = jest.spyOn(console, 'error').mockReturnValue('');

describe('Navigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Navigator', () => {
    const wrapper = createWrapper();
    const navigator = wrapper.find('.navigator');
    // assert navigator is a `nav`
    expect(navigator.is('nav')).toBe(true);
    expect(navigator.attributes()).toHaveProperty('aria-labelledby', INDEX_ROOT_KEY);
    // assert Navigator card is rendered
    expect(wrapper.find(NavigatorCard).props()).toEqual({
      activePath: [references.first.url, references.second.url, mocks.$route.path],
      // will assert in another test
      children: [],
      type: TopicTypes.module,
      technology: technology.title,
      technologyPath: technology.path,
      isTechnologyBeta: false,
      scrollLockID: defaultProps.scrollLockID,
      renderFilterOnTop: defaultProps.renderFilterOnTop,
      errorFetching: false,
      apiChanges: null,
      allowHiding: true,
      navigatorReferences,
    });
  });

  it('renders an aria live that tells VO users when navigator is loading', () => {
    const wrapper = createWrapper({
      propsData: {
        isFetching: true,
      },
    });
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Navigator is loading');
  });

  it('renders an aria live that tells VO users when navigator is ready', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Navigator is ready');
  });

  it('falls back to using the `technology.url` for the `technology-path`', () => {
    const wrapper = createWrapper({
      propsData: {
        technology: fallbackTechnology,
      },
    });
    expect(wrapper.find(NavigatorCard).props()).toEqual({
      activePath: [references.first.url, references.second.url, mocks.$route.path],
      // will assert in another test
      children: [],
      type: TopicTypes.module,
      technology: fallbackTechnology.title,
      technologyPath: fallbackTechnology.url,
      isTechnologyBeta: false,
      scrollLockID: defaultProps.scrollLockID,
      renderFilterOnTop: defaultProps.renderFilterOnTop,
      errorFetching: false,
      apiChanges: null,
      allowHiding: true,
      navigatorReferences,
    });
  });

  it('passes the errorFetching prop', () => {
    const wrapper = createWrapper({
      propsData: {
        errorFetching: true,
      },
    });
    expect(wrapper.find(NavigatorCard).props('errorFetching')).toBe(true);
  });

  it('strips out possible technology URLs from the activePath', () => {
    const wrapper = createWrapper({
      propsData: {
        parentTopicIdentifiers: ['technologies'].concat(parentTopicIdentifiers),
      },
    });
    expect(wrapper.find(NavigatorCard).props('activePath')).toEqual([
      references.first.url, references.second.url, mocks.$route.path,
    ]);
  });

  it('casts to lowercase and strips out trailing slashes from the last activePath item', () => {
    const wrapper = createWrapper({
      mocks: {
        ...mocks,
        $route: {
          ...mocks.$route,
          path: '/documentation/Foo/Bar/',
        },
      },
    });
    expect(wrapper.find(NavigatorCard).props('activePath')).toEqual([
      references.first.url, references.second.url, '/documentation/foo/bar',
    ]);
  });

  it('renders the root path as activePath when there is no parentTopicIdentifiers', () => {
    const wrapper = createWrapper({
      propsData: {
        parentTopicIdentifiers: [],
      },
    });
    expect(wrapper.find(NavigatorCard).props('activePath')).toEqual([mocks.$route.path]);
  });

  it('renders the root path as activePath when there are no valid parentTopicIdentifiers', () => {
    const identifier = 'ref://invalid';
    const wrapper = createWrapper({
      propsData: {
        parentTopicIdentifiers: [identifier],
      },
    });
    expect(wrapper.find(NavigatorCard).props('activePath')).toEqual([mocks.$route.path]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(`Reference for "${identifier}" is missing`);
  });

  it('removes any parent topic identifiers, which dont have a reference', () => {
    const wrapper = createWrapper({
      propsData: {
        references: {
          root: { url: 'root' },
          first: { url: 'first' },
          // skip the `second` reference
        },
      },
    });
    // assert `second` is missing from the activePath
    expect(wrapper.find(NavigatorCard).props('activePath')).toEqual([
      references.first.url, mocks.$route.path,
    ]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Reference for "second" is missing');
  });

  it('re-emits the `@close` event', () => {
    const wrapper = createWrapper();
    wrapper.find(NavigatorCard).vm.$emit('close');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
