import { shallowMount } from '@vue/test-utils';
import Card from 'docc-render/components/ContentNode/Card.vue';

describe('Card', () => {
  it('renders slot content', () => {
    const wrapper = shallowMount(Card, {
      slots: {
        head: '<h3>foobar</h3>',
        default: '<p>qux</p>',
      },
    });
    expect(wrapper.classes('card')).toBe(true);

    const head = wrapper.find('.card-head');
    expect(head.exists()).toBe(true);
    expect(head.text()).toBe('foobar');

    const content = wrapper.find('.card-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe('qux');
  });

  it('does not render header if no head slot is provided', () => {
    const wrapper = shallowMount(Card, {
      slots: {
        default: '<p>foobar</p>',
      },
    });
    expect(wrapper.find('.card-head').exists()).toBe(false);
  });
});
