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

  it('renders the BaseDropdown at the root', () => {
    wrapper = createWrapper();
    const root = wrapper.find(BaseDropdown);
    // assert exist
    expect(root.exists()).toBe(true);
    // assert value
    expect(root.props()).toHaveProperty('value', defaultProps.value);
    // assert isOpen class
    expect(root.classes()).not.toContain(OpenedClass);
    wrapper.find({ ref: 'dropdownToggle' }).trigger('click');
    expect(root.classes()).toContain(OpenedClass);
  });

  it('adds an `dropdown-small` class', () => {
    wrapper = createWrapper();
    expect(wrapper.classes()).not.toContain('dropdown-small');
    wrapper.setProps({ isSmall: true });
    expect(wrapper.classes()).toContain('dropdown-small');
  });

  it('renders a label', () => {
    wrapper = createWrapper();
    const label = wrapper.find('.visuallyhidden');
    expect(label.text()).toBe(defaultProps.ariaLabel);
    expect(label.attributes()).toHaveProperty('id', expect.stringMatching(/DropdownLabel_\d/));
  });

  describe('toggle button', () => {
    it('renders a toggle button', () => {
      wrapper = createWrapper();
      const toggle = wrapper.find({ ref: 'dropdownToggle' });
      expect(toggle.is('button')).toBe(true);
      // classes
      expect(toggle.classes()).toContain('form-dropdown-toggle');
      // passed from the parent via scoped slot
      expect(toggle.classes()).toContain('form-dropdown');
      // aria + role
      const attrs = toggle.attributes();
      expect(attrs).toHaveProperty('role', 'button');
      expect(attrs).toHaveProperty('aria-haspopup', 'true');
      expect(attrs).toHaveProperty('aria-expanded', 'false');
      expect(attrs)
        .toHaveProperty('aria-labelledby', expect.stringMatching(/(DropdownLabel_).*(DropdownToggle_)/));
      // id
      expect(attrs).toHaveProperty('id', expect.stringMatching(/DropdownToggle_\d/));
      // content
      expect(toggle.find('.form-dropdown-title').text()).toEqual(defaultProps.value);
    });

    it('toggles the dropdown on/off on `click`', () => {
      wrapper = createWrapper();
      const toggle = wrapper.find({ ref: 'dropdownToggle' });
      toggle.trigger('click');
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('click');
      expect(wrapper.classes()).not.toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('opens the dropdown on `enter`', () => {
      wrapper = createWrapper();
      const toggle = wrapper.find({ ref: 'dropdownToggle' });
      toggle.trigger('keydown.enter');
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.enter');
      // assert it does not close it
      expect(wrapper.classes()).toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
    });

    it('opens the dropdown on `keydown.down`', () => {
      wrapper = createWrapper();
      const toggle = wrapper.find({ ref: 'dropdownToggle' });
      toggle.trigger('keydown.down');
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.down');
      // assert it does not close it
      expect(wrapper.classes()).toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
    });

    it('opens the dropdown on `keydown.up`', () => {
      wrapper = createWrapper();
      const toggle = wrapper.find({ ref: 'dropdownToggle' });
      toggle.trigger('keydown.up');
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.up');
      // assert it does not close it
      expect(wrapper.classes()).toContain(OpenedClass);
      expect(wrapper.emitted('open')).toBeTruthy();
    });

    it('closes the dropdown on `escape` and focuses the toggle', async () => {
      wrapper = createWrapper();
      const toggle = wrapper.find({ ref: 'dropdownToggle' });
      toggle.trigger('click');
      expect(wrapper.classes()).toContain(OpenedClass);
      toggle.trigger('keydown.esc');
      await wrapper.vm.$nextTick();
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
    const renderedSlot = wrapper.find({ ref: 'dropdownToggle' }).find('.postContent');
    expect(renderedSlot.text()).toContain('Post Content');
  });

  it('renders the eyebrow slot', () => {
    wrapper = createWrapper({
      slots: {
        eyebrow: '<div class="eyebrow">Eyebrow Content</div>',
      },
    });
    expect(wrapper.find('.eyebrow').text()).toEqual('Eyebrow Content');
  });

  describe('default scoped slot', () => {
    let toggle;
    beforeEach(() => {
      wrapper = createWrapper();
      toggle = wrapper.find({ ref: 'dropdownToggle' });
    });

    it('renders the default scoped slot', () => {
      expect(wrapper.find('.defaultSlot').exists()).toBe(true);
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

    it('provides the `isOpen` variable', () => {
      expect(slotProps.isOpen).toBe(false);
      toggle.trigger('click');
      expect(slotProps.isOpen).toBe(true);
    });

    it('provides the correct `classes`', () => {
      expect(slotProps.contentClasses).toEqual(['form-dropdown-content', { [OpenedClass]: false }]);
      toggle.trigger('click');
      expect(slotProps.contentClasses).toEqual(['form-dropdown-content', { [OpenedClass]: true }]);
    });

    it('provides a `closeDropdown` method', () => {
      expect(slotProps.closeDropdown).toEqual(expect.any(Function));
      toggle.trigger('click');
      expect(wrapper.classes()).toContain(OpenedClass);
      slotProps.closeDropdown();
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
      expect(wrapper.classes()).toContain(OpenedClass);
      await slotProps.closeAndFocusToggler();
      expect(wrapper.classes()).not.toContain(OpenedClass);
      expect(document.activeElement).toEqual(toggle.element);
    });
  });

  it('closes the dropdown of you `click` outside', () => {
    wrapper = createWrapper();
    wrapper.find({ ref: 'dropdownToggle' }).trigger('click');
    const label = wrapper.find('.visuallyhidden').element;
    expect(wrapper.classes()).toContain(OpenedClass);
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: label });
    document.dispatchEvent(event);
    expect(wrapper.classes()).toContain(OpenedClass);

    document.dispatchEvent(new Event('click'));
    expect(wrapper.classes()).not.toContain(OpenedClass);
  });

  it('focuses the active option element on open', async () => {
    document.body.focus();
    wrapper = createWrapper();
    wrapper.find({ ref: 'dropdownToggle' }).trigger('click');
    await wrapper.vm.$nextTick();
    const activeElement = wrapper.find(`.${ActiveOptionClass}`);
    expect(document.activeElement).toEqual(activeElement.element);
  });
});
