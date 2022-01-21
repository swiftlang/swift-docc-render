import NavigatorCard from '@/components/Navigator/NavigatorCard.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicKind } from '@/constants/kinds';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'intersection-observer';
import { LEAF_SIZES } from '@/constants/sidebar';

const children = [
  {
    kind: 'overview',
    path: '/tutorials/fookit',
    title: 'TopLevel',
    uid: '<root>+/tutorials/fookit_0_0',
    parent: '<root>',
    depth: 0,
    index: 0,
    childUIDs: [
      '<root>+/tutorials/fookit_0_0+/tutorials/fookit/first-child-depth-1_1_0',
      '<root>+/tutorials/fookit_0_0+/tutorials/fookit/second-child-depth-1_1_1',
    ],
  },
  {
    kind: 'tutorial',
    path: '/tutorials/fookit/first-child-depth-1',
    title: 'First Child, Depth 1',
    uid: '<root>+/tutorials/fookit_0_0+/tutorials/fookit/first-child-depth-1_1_0',
    parent: '<root>+/tutorials/fookit_0_0',
    depth: 1,
    index: 0,
    childUIDs: [],
  },
  {
    kind: 'tutorial',
    path: '/tutorials/fookit/second-child-depth-1',
    title: 'Second Child, Depth 1',
    uid: '<root>+/tutorials/fookit_0_0+/tutorials/fookit/second-child-depth-1_1_1',
    parent: '<root>+/tutorials/fookit_0_0',
    depth: 1,
    index: 1,
    childUIDs: [
      '<root>+/tutorials/fookit_0_0+/tutorials/fookit/second-child-depth-1_1_1+/tutorials/fookit/second-child-depth-1/first-child-depth-2_2_0',
    ],
  },
  {
    kind: 'tutorial',
    path: '/tutorials/fookit/second-child-depth-1/first-child-depth-2',
    title: 'First Child, Depth 2',
    uid: '<root>+/tutorials/fookit_0_0+/tutorials/fookit/second-child-depth-1_1_1+/tutorials/fookit/second-child-depth-1/first-child-depth-2_2_0',
    parent: '<root>+/tutorials/fookit_0_0+/tutorials/fookit/second-child-depth-1_1_1',
    depth: 2,
    index: 0,
    childUIDs: [],
  },
  {
    abstract: [{
      text: 'Create a tutorial.',
      type: 'text',
    }],
    kind: 'article',
    path: '/documentation/fookit/gettingstarted',
    title: 'Getting Started',
    uid: '<root>+/documentation/fookit/gettingstarted_0_1',
    parent: '<root>',
    depth: 0,
    index: 1,
    childUIDs: [],
  },
];

const activePath = [
  '/tutorials/fookit',
  '/tutorials/fookit/first-child-depth-1',
];

const defaultProps = {
  technology: 'TestKit',
  children,
  activePath,
  showExtendedInfo: false,
  kind: TopicKind.module,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(NavigatorCard, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  stubs: {
    RecycleScroller,
  },
  ...others,
});

describe('NavigatorCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders the NavigatorCard', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.card-icon').props('kind')).toEqual(defaultProps.kind);
    // assert link
    expect(wrapper.find('.card-link').text()).toBe(defaultProps.technology);
    // assert scroller
    expect(wrapper.find(RecycleScroller).props()).toMatchObject({
      items: [
        defaultProps.children[0],
        defaultProps.children[1],
        defaultProps.children[2], // we skip 3, because its a child of 2, and it is not open
        defaultProps.children[4],
      ],
      itemSize: LEAF_SIZES.min,
      keyField: 'uid',
    });
    // assert CardItem
    // assert no-items-wrapper
  });

  it('determines the itemSize', () => {

  });

  it('converts the nested children into a flat list, sending it to the RecycleScroller', () => {

  });

  it('hides the RecycleScroller, if no items to show', () => {

  });

  it('opens an item', () => {

  });

  it('closes an item and all of its children', () => {

  });

  it('expands the elements, that are parents of the current open page', () => {

  });

  it('allows filtering the items, opening all items, that have matches in children', () => {

  });

  it('removes duplicate items, when multiple items with the same parent match the filter', () => {

  });

  it('changes the open item, when navigating across pages, keeping the previously open items', () => {

  });

  it('clears previously open items, when filtering and clearing the filter', () => {

  });
});
