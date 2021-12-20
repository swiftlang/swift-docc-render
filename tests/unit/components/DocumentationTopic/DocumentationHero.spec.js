import DocumentationHero from '@/components/DocumentationTopic/DocumentationHero.vue';
import { shallowMount } from '@vue/test-utils';
import {
  TopicKind,
  TopicKindAliases,
  TopicKindColors,
  TopicKindColorsMap,
} from '@/constants/kinds';
import NavigatorLeafIcon from '@/components/Navigator/NavigatorLeafIcon';

const defaultProps = {
  kind: TopicKind.class,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(DocumentationHero, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  slots: {
    default: '<div class="default-slot">Default Slot</div>',
  },
  ...others,
});

describe('DocumentationHero', () => {
  it('renders the DocumentationHero', () => {
    const wrapper = createWrapper();
    const allIcons = wrapper.findAll(NavigatorLeafIcon);
    expect(allIcons).toHaveLength(2);
    expect(allIcons.at(0).props()).toEqual({
      withColors: true,
      kind: defaultProps.kind,
    });
    expect(allIcons.at(0).classes()).toEqual(['background-icon', 'first-icon']);
    expect(allIcons.at(1).classes()).toEqual(['background-icon', 'second-icon']);
    // assert slot
    expect(wrapper.find('.default-slot').text()).toBe('Default Slot');
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-kind-icon-${TopicKindColorsMap[defaultProps.kind]}, var(--color-figure-gray-secondary))`,
    });
  });

  it('finds aliases, for the color', () => {
    const wrapper = createWrapper({
      propsData: {
        kind: TopicKind.init,
      },
    });
    const color = TopicKindColorsMap[TopicKindAliases[TopicKind.init]];
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-kind-icon-${color}, var(--color-figure-gray-secondary))`,
    });
  });

  it('falls back to the teal color for kinds without a color', () => {
    const wrapper = createWrapper({
      propsData: {
        kind: TopicKind.section,
      },
    });
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-kind-icon-${TopicKindColors.teal}, var(--color-figure-gray-secondary))`,
    });
  });
});
