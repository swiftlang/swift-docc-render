/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
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

const { LoadingNavigatorCard } = Navigator.components;

const technologyProps = {
  technology: 'FooTechnology',
  technologyPath: '/path/to/technology',
  isTechnologyBeta: false,
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
  technologyProps,
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
    const navigator = wrapper.findComponent('.navigator');
    // assert navigator is a `nav`
    expect(navigator.element.tagName.toLowerCase() === 'nav').toBe(true);
    expect(navigator.attributes()).toHaveProperty('aria-labelledby', INDEX_ROOT_KEY);
    // assert Navigator card is rendered
    expect(wrapper.findComponent(NavigatorCard).props()).toEqual({
      activePath: [references.first.url, references.second.url, mocks.$route.path],
      // will assert in another test
      children: [],
      type: TopicTypes.module,
      technology: technologyProps.technology,
      technologyPath: technologyProps.technologyPath,
      isTechnologyBeta: technologyProps.isTechnologyBeta,
      scrollLockID: defaultProps.scrollLockID,
      renderFilterOnTop: defaultProps.renderFilterOnTop,
      errorFetching: false,
      apiChanges: null,
      navigatorReferences,
      hideAvailableTags: false,
      shouldTruncateTags: false,
    });
  });

  it('renders an aria live that tells VO users when navigator is loading', () => {
    const wrapper = createWrapper({
      propsData: {
        isFetching: true,
      },
    });
    expect(wrapper.findComponent('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.findComponent('[aria-live="polite"]').text()).toBe('navigator.navigator-is navigator.state.loading');
  });

  it('renders a LoadingNavigatorCard when navigator is loading', () => {
    const wrapper = createWrapper({
      propsData: {
        isFetching: true,
      },
    });
    expect(wrapper.findComponent(LoadingNavigatorCard).exists()).toBe(true);
  });

  it('does not render a LoadingNavigatorCard when navigator is not loading', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(LoadingNavigatorCard).exists()).toBe(false);
  });

  it('renders an aria live that tells VO users when navigator is ready', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.findComponent('[aria-live="polite"]').text()).toBe('navigator.navigator-is navigator.state.ready');
  });

  it('passes the errorFetching prop', () => {
    const wrapper = createWrapper({
      propsData: {
        errorFetching: true,
      },
    });
    expect(wrapper.findComponent(NavigatorCard).props('errorFetching')).toBe(true);
  });

  it('strips out possible technology URLs from the activePath', () => {
    const wrapper = createWrapper({
      propsData: {
        parentTopicIdentifiers: ['technologies'].concat(parentTopicIdentifiers),
      },
    });
    expect(wrapper.findComponent(NavigatorCard).props('activePath')).toEqual([
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
    expect(wrapper.findComponent(NavigatorCard).props('activePath')).toEqual([
      references.first.url, references.second.url, '/documentation/foo/bar',
    ]);
  });

  it('renders the root path as activePath when there is no parentTopicIdentifiers', () => {
    const wrapper = createWrapper({
      propsData: {
        parentTopicIdentifiers: [],
      },
    });
    expect(wrapper.findComponent(NavigatorCard).props('activePath')).toEqual([mocks.$route.path]);
  });

  it('renders the root path as activePath when there are no valid parentTopicIdentifiers', () => {
    const identifier = 'ref://invalid';
    const wrapper = createWrapper({
      propsData: {
        parentTopicIdentifiers: [identifier],
      },
    });
    expect(wrapper.findComponent(NavigatorCard).props('activePath')).toEqual([mocks.$route.path]);
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
    expect(wrapper.findComponent(NavigatorCard).props('activePath')).toEqual([
      references.first.url, mocks.$route.path,
    ]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Reference for "second" is missing');
  });

  it('re-emits the `@close` event', async () => {
    const wrapper = createWrapper();
    wrapper.findComponent(NavigatorCard).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
