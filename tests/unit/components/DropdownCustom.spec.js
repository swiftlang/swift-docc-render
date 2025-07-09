/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DropdownCustom from 'docc-render/components/DropdownCustom.vue';
import { mount } from '@vue/test-utils';
import BaseDropdown from 'docc-render/components/BaseDropdown.vue';

const { OpenedClass, OptionClass, ActiveOptionClass } = DropdownCustom.constants;

let wrapper;
let slotProps = {};

const defaultProps = {
  value: 'foo',
  ariaLabel: 'Foo Label',
};

const createWrapper = ({ propsData, ...rest } = {}) => mount(DropdownCustom, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  attachToDocument: true,
  scopedSlots: {
    default(props) {
      slotProps = props;
      return this.$createElement('ul', { class: 'defaultSlot' }, [
        this.$createElement('li', {
          attrs: { tabindex: 0 },
          class: [slotProps.OptionClass, slotProps.ActiveOptionClass],
        }, 'first'),
        this.$createElement('li', {
          attrs: { tabindex: 0 },
          class: [slotProps.OptionClass],
        }, 'second'),
      ]);
    },
  },
  ...rest,
});

describe('DropdownCustom', () => {
  afterEach(() => {
    wrapper.destroy();
  });

  it('renders the BaseDropdown at the root', async () => {
    wrapper = createWrapper();
    const root = wrapper.findComponent(BaseDropdown);
    // assert exist
    expect(root.exists()).toBe(true);
    // assert value
    expect(root.props()).toHaveProperty('value', defaultProps.value);
    // assert isOpen class
    expect(root.classes()).not.toContain(OpenedClass);
    wrapper.findComponent({ ref: 'dropdownToggle' }).trigger('click');
    await wrapper.vm.$nextTick();
    expect(root.classes()).toContain(OpenedClass);
  });

  it('adds an `dropdown-small` class', async () => {
    wrapper = createWrapper();
    expect(wrapper.classes()).not.toContain('dropdown-small');
    await wrapper.setProps({ isSmall: true });
    expect(wrapper.classes()).toContain('dropdown-small');
  });

  it('renders a label', () => {
    wrapper = createWrapper();
    const label = wrapper.findComponent('.visuallyhidden');
    expect(label.text()).toBe(defaultProps.ariaLabel);
    expect(label.attributes()).toHaveProperty('id', expect.stringMatching(/DropdownLabel_\d/));
  });

  describe('toggle button', () => {
    it('renders a toggle button', () => {
      wrapper = createWrapper();
      const toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
      expect(toggle.is('button')).toBe(true);
      // classes
      expect(toggle.classes()).toContain('form-dropdown-toggle');
      // passed from the parent via scoped slot
      expect(toggle.classes()).toContain('form-dropdown');
      // aria + role
      const attrs = toggle.attributes();
      expect(attrs).toHaveProperty('aria-haspopup', 'true');
      expect(attrs).toHaveProperty('aria-expanded', 'false');
      expect(attrs)
        .toHaveProperty('aria-labelledby', expect.stringMatching(/(DropdownLabel_).*(DropdownToggle_)/));
      // id
      expect(attrs).toHaveProperty('id', expect.stringMatching(/DropdownToggle_\d/));
      // content
      expect(toggle.find('.form-dropdown-title').text()).toEqual(defaultProps.value);
    });

    it('toggles the dropdown on/off on `click`', async () => {
      wrapper = createWrapper();
      const toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('opens the dropdown on `enter`', async () => {
      wrapper = createWrapper();
      const toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
      toggle.trigger('keydown.enter');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.enter');
      await wrapper.vm.$nextTick();
      // assert it does not close it
      expect(wrapper.classes()).toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
    });

    it('opens the dropdown on `keydown.down`', async () => {
      wrapper = createWrapper();
      const toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
      toggle.trigger('keydown.down');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.down');
      await wrapper.vm.$nextTick();
      // assert it does not close it
      expect(wrapper.classes()).toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
    });

    it('opens the dropdown on `keydown.up`', async () => {
      wrapper = createWrapper();
      const toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
      toggle.trigger('keydown.up');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.up');
      await wrapper.vm.$nextTick();
      // assert it does not close it
      expect(wrapper.classes()).toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
    });

    it('closes the dropdown on `escape` and focuses the toggle', async () => {
      wrapper = createWrapper();
      const toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      await toggle.trigger('keydown.esc');
      expect(wrapper.classes()).not.toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
      // assert the active element is the toggle
      expect(document.activeElement).toEqual(toggle.element);
    });
  });

  it('renders the `toggle-post-content` slot inside the toggle, after its main content', () => {
    wrapper = createWrapper({
      slots: {
        'toggle-post-content': '<div class="postContent">Post Content</div>',
      },
    });
    const renderedSlot = wrapper.findComponent({ ref: 'dropdownToggle' }).find('.postContent');
    expect(renderedSlot.text()).toContain('Post Content');
  });

  it('renders the eyebrow slot', () => {
    wrapper = createWrapper({
      slots: {
        eyebrow: '<div class="eyebrow">Eyebrow Content</div>',
      },
    });
    expect(wrapper.findComponent('.eyebrow').text()).toEqual('Eyebrow Content');
  });

  describe('default scoped slot', () => {
    let toggle;
    beforeEach(() => {
      wrapper = createWrapper();
      toggle = wrapper.findComponent({ ref: 'dropdownToggle' });
    });

    it('renders the default scoped slot', () => {
      expect(wrapper.findComponent('.defaultSlot').exists()).toBe(true);
    });

    it('provides the `option` and `activeOption` classes', () => {
      expect(slotProps.OptionClass).toEqual(OptionClass);
      expect(slotProps.ActiveOptionClass).toEqual(ActiveOptionClass);
    });

    it('provides a method to navigate over available options', () => {
      expect(slotProps.navigateOverOptions).toEqual(expect.any(Function));
    });

    it('goes up/down the list of options', () => {
      const targets = wrapper.findAll(`.${OptionClass}`);
      const target1 = targets.at(0);
      const target2 = targets.at(1);
      // go down
      slotProps.navigateOverOptions({ target: target1.element }, +1);
      expect(document.activeElement).toEqual(target2.element);
      // go up
      slotProps.navigateOverOptions({ target: target2.element }, -1);
      expect(document.activeElement).toEqual(target1.element);
    });

    it('does nothing if going `up` from the first element', () => {
      const targets = wrapper.findAll(`.${OptionClass}`);
      const target0 = targets.at(0);
      target0.element.focus();
      // go down
      slotProps.navigateOverOptions({ target: target0.element }, -1);
      // nothing changes
      expect(document.activeElement).toEqual(target0.element);
    });

    it('does nothing if going `down` from the last element', () => {
      const targets = wrapper.findAll(`.${OptionClass}`);
      const target1 = targets.at(1);
      target1.element.focus();
      // go down
      slotProps.navigateOverOptions({ target: target1.element }, +1);
      // nothing changes
      expect(document.activeElement).toEqual(target1.element);
    });

    it('provides the `value`', () => {
      expect(slotProps.value).toBe(defaultProps.value);
    });

    it('provides the `isOpen` variable', async () => {
      expect(slotProps.isOpen).toBe(false);
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(slotProps.isOpen).toBe(true);
    });

    it('provides the correct `classes`', async () => {
      expect(slotProps.contentClasses).toEqual(['form-dropdown-content', { [OpenedClass]: false }]);
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(slotProps.contentClasses).toEqual(['form-dropdown-content', { [OpenedClass]: true }]);
    });

    it('provides a `closeDropdown` method', async () => {
      expect(slotProps.closeDropdown).toEqual(expect.any(Function));
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      slotProps.closeDropdown();
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain(OpenedClass);
    });

    it('provides a `onChangeAction` method to change the bound value', () => {
      expect(slotProps.onChangeAction).toEqual(expect.any(Function));
      expect(wrapper.emitted('input')).toBeFalsy();
      slotProps.onChangeAction('foo');
      expect(wrapper.emitted('input')).toEqual([['foo']]);
    });

    it('provides a `closeAndFocusToggler` method', async () => {
      expect(slotProps.closeAndFocusToggler).toEqual(expect.any(Function));
      toggle.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain(OpenedClass);
      await slotProps.closeAndFocusToggler();
      expect(wrapper.classes()).not.toContain(OpenedClass);
      expect(document.activeElement).toEqual(toggle.element);
    });
  });

  it('closes the dropdown of you `click` outside', async () => {
    wrapper = createWrapper();
    await wrapper.findComponent({ ref: 'dropdownToggle' }).trigger('click');
    const label = wrapper.findComponent('.visuallyhidden').element;
    expect(wrapper.classes()).toContain(OpenedClass);
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: label });
    document.dispatchEvent(event);
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain(OpenedClass);

    document.dispatchEvent(new Event('click'));
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain(OpenedClass);
  });

  it('focuses the active option element on open', async () => {
    document.body.focus();
    wrapper = createWrapper();
    await wrapper.findComponent({ ref: 'dropdownToggle' }).trigger('click');
    const activeElement = wrapper.findComponent(`.${ActiveOptionClass}`);
    expect(document.activeElement).toEqual(activeElement.element);
  });
});
