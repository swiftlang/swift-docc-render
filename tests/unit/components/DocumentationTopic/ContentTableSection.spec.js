/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import ContentTableSection, {
  TITLE_CLASS_NAME,
} from 'docc-render/components/DocumentationTopic/ContentTableSection.vue';

const {
  LinkableHeading,
} = ContentTableSection.components;

describe('ContentTableSection', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  const propsData = { title: 'Foobar' };

  const slots = { default: '<p>baz</p>' };

  beforeEach(() => {
    wrapper = shallowMount(ContentTableSection, { propsData, slots });
  });

  it('renders the title as `h3.title` by default', () => {
    const div = wrapper.findAll('.section-title').at(0);

    const title = div.find(LinkableHeading);
    expect(title.exists()).toBe(true);
    expect(title.props('level')).toBe(3);
    expect(title.classes()).toContain(TITLE_CLASS_NAME);
    expect(title.text()).toContain(propsData.title);
  });

  it('does not require a title', () => {
    wrapper.setProps({
      title: undefined,
    });

    const title = wrapper.find(LinkableHeading);
    expect(title.exists()).toBe(false);
  });

  it('renders an `id` if `anchor` is provided', () => {
    const title = wrapper.find(`.${TITLE_CLASS_NAME}`);
    expect(title.attributes('id')).toBe(undefined);
    wrapper.setProps({
      anchor: 'foo-bar',
    });
    expect(title.props('anchor')).toBe('foo-bar');
  });

  it('renders a slot for a title', () => {
    wrapper = shallowMount(ContentTableSection, {
      propsData,
      scopedSlots: {
        title: '<div :class="props.className">Title Text</div>',
      },
    });
    const div = wrapper.find('.section-title');
    const title = div.find(`.${TITLE_CLASS_NAME}`);
    expect(title.text()).toEqual('Title Text');
  });

  it('renders slot content', () => {
    const div = wrapper.find('.section-content');
    expect(div.exists()).toBe(true);

    const p = div.find('p');
    expect(p.exists()).toBe(true);
    expect(p.html()).toBe(slots.default);
  });

  it('renders abstract, discussion and the rest in the right order', () => {
    wrapper = shallowMount(ContentTableSection, {
      propsData,
      slots: {
        abstract: '<p id="abstract"></p>',
        discussion: '<p id="discussion"></p>',
        default: '<p id="list"></p>',
      },
    });
    const col = wrapper.find('.section-content');
    expect([...col.element.children].map(el => el.id)).toEqual(['abstract', 'discussion', 'list']);
  });
});
