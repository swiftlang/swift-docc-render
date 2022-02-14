import Navigator from '@/components/Navigator.vue';
import { shallowMount } from '@vue/test-utils';
import NavigatorCard from '@/components/Navigator/NavigatorCard.vue';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';
import { TopicKind } from '@/constants/kinds';
import throttle from '@/utils/throttle';
import { createEvent } from '../../../test-utils';

jest.mock('@/utils/throttle', () => jest.fn(v => v));

const technology = {
  title: 'FooTechnology',
  children: [
    {
      title: 'Child0',
      path: '/foo/child0',
      kind: 'article',
      children: [
        {
          title: 'Child0_GrandChild0',
          path: '/foo/child0/grandchild0',
          kind: 'tutorial',
        },
        {
          title: 'Child0_GrandChild1',
          path: '/foo/child0/grandchild1',
          kind: 'tutorial',
          children: [{
            title: 'Child0_GrandChild0_GreatGrandChild0',
            path: '/foo/child0/grandchild0/greatgrandchild0',
            kind: 'tutorial',
          }],
        },
        {
          title: 'Child0_GrandChild2',
          path: '/foo/child0/grandchild2',
          kind: 'tutorial',
        },
      ],
    },
    {
      title: 'Child1',
      path: '/foo/child1/',
      kind: 'tutorial',
      children: [{
        title: 'Child1_GrandChild0',
        path: '/foo/child1/grandchild0',
        kind: 'method',
      }],
    },
  ],
  path: '/path/to/technology',
};

const references = {
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

const defaultProps = {
  parentTopicIdentifiers,
  technology,
  references,
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

describe('Navigator', () => {
  it('renders the Navigator', () => {
    const wrapper = createWrapper();
    // assert Navigator card is rendered
    expect(wrapper.find(NavigatorCard).props()).toEqual({
      activePath: [references.first.url, references.second.url, mocks.$route.path],
      // will assert in another test
      children: expect.any(Array),
      kind: TopicKind.module,
      technology: technology.title,
      technologyPath: technology.path,
    });
    expect(wrapper.find('.loading-placeholder').exists()).toBe(false);
  });

  it('renders a loading placeholder, if is fetching', () => {
    const wrapper = createWrapper({
      propsData: {
        isFetching: true,
      },
    });
    // assert Navigator card is rendered
    expect(wrapper.find(NavigatorCard).exists()).toBe(false);
    expect(wrapper.find('.loading-placeholder').text()).toBe('Fetching...');
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
      kind: TopicKind.module,
      technology: fallbackTechnology.title,
      technologyPath: fallbackTechnology.url,
    });
  });

  it('re-emits the `@close` event', () => {
    const wrapper = createWrapper();
    wrapper.find(NavigatorCard).vm.$emit('close');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not add scroll listeners, if the anchor is at the top already', () => {
    const wrapper = createWrapper();
    expect(throttle).toHaveBeenCalledTimes(0);
    expect(wrapper.vm.topOffset).toBe('0px');
  });

  it('adds a scroll listener and stores the `y` offset of the anchor, if offsetTop is above 0', () => {
    Object.defineProperty(fauxAnchor, 'offsetTop', { value: 50, writable: true });
    const getBoundingClientRect = jest.fn().mockReturnValue({ y: 33 });
    Object.defineProperty(fauxAnchor, 'getBoundingClientRect', { value: getBoundingClientRect });
    const wrapper = createWrapper();
    expect(throttle).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.topOffset).toBe('33px');
    // simulate a scroll and sticky element
    getBoundingClientRect.mockReturnValueOnce({ y: 44 });
    window.dispatchEvent(createEvent('scroll'));
    expect(wrapper.vm.topOffset).toBe('44px');
    // assert destroy removes event listener
    wrapper.destroy();
    window.dispatchEvent(createEvent('scroll'));
    // not called again
    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
  });

  it('generates a unique hash', () => {
    const wrapper = createWrapper();
    // make sure hashCode returns a unique hash from a string
    expect(wrapper.vm.hashCode('foo')).toBe(101574);
    expect(wrapper.vm.hashCode('oof')).toBe(110214);
    expect(wrapper.vm.hashCode('ofo')).toBe(109944);
    expect(wrapper.vm.hashCode('foo1')).toBe(3148843);
    // make sure hash is never too big
    expect(wrapper.vm.hashCode('foo1'.repeat(10))).toBe(-1535108562);
    expect(wrapper.vm.hashCode('foo1'.repeat(50))).toBe(-2107259162);
  });

  it('flattens deeply nested children and provides them to the NavigatorCard', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(NavigatorCard).props('children')).toEqual([
      // root
      {
        childUIDs: [
          745124197,
          746047719,
          746971241,
        ],
        depth: 0,
        kind: 'article',
        parent: '<root>',
        path: '/foo/child0',
        title: 'Child0',
        uid: 551503843,
      },
      {
        childUIDs: [],
        depth: 1,
        kind: 'tutorial',
        parent: 551503843,
        path: '/foo/child0/grandchild0',
        title: 'Child0_GrandChild0',
        uid: 745124197,
      },
      {
        childUIDs: [
          1489150959,
        ],
        depth: 1,
        kind: 'tutorial',
        parent: 551503843,
        path: '/foo/child0/grandchild1',
        title: 'Child0_GrandChild1',
        uid: 746047719,
      },
      {
        childUIDs: [],
        depth: 2,
        kind: 'tutorial',
        parent: 746047719,
        path: '/foo/child0/grandchild0/greatgrandchild0',
        title: 'Child0_GrandChild0_GreatGrandChild0',
        uid: 1489150959,
      },
      {
        childUIDs: [],
        depth: 1,
        kind: 'tutorial',
        parent: 551503843,
        path: '/foo/child0/grandchild2',
        title: 'Child0_GrandChild2',
        uid: 746971241,
      },
      {
        childUIDs: [
          -134251586,
        ],
        depth: 0,
        kind: 'tutorial',
        parent: '<root>',
        path: '/foo/child1/',
        title: 'Child1',
        uid: -97593392,
      },
      {
        childUIDs: [],
        depth: 1,
        kind: 'method',
        parent: -97593392,
        path: '/foo/child1/grandchild0',
        title: 'Child1_GrandChild0',
        uid: -134251586,
      },
    ]);
  });
});
