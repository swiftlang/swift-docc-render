/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { prepareDataForHTMLClipboard } from '@/utils/clipboard';
import { shallowMount } from '@vue/test-utils';
import FilterInput from '@/components/Filter/FilterInput.vue';
import TagList from '@/components/Filter/TagList.vue';
import {
  getSelectionText, moveCursorToStart, isSingleCharacter, moveCursorToEnd,
} from '@/utils/input-helper';
import debounce from 'docc-render/utils/debounce';
import FilterIcon from 'docc-render/components/Icons/FilterIcon.vue';
import multipleSelection from '@/mixins/multipleSelection';
import keyboardNavigation from '@/mixins/keyboardNavigation';
import { flushPromises } from '../../../../test-utils';

// TODO: Remove this Event caching, once we update VTU, as there is a bug now,
//  that prevents you from setting extra parameters
window.Event = null;

jest.mock('docc-render/utils/debounce', () => jest.fn(fn => fn));

jest.mock('@/utils/input-helper', () => ({
  getSelectionText: jest.fn(),
  moveCursorToEnd: jest.fn(),
  moveCursorToStart: jest.fn(),
  isSingleCharacter: jest.fn(),
}));

const {
  SuggestedTagsId,
  FilterInputId,
  TagLimit,
} = FilterInput.constants;

describe('FilterInput', () => {
  let wrapper;
  let input;
  let filterButtonSVG;

  const tags = ['Tag1', 'Tag2'];

  const propsData = {
    value: '',
    selectedTags: [],
    tags,
    disabled: false,
    placeholder: 'Placeholder Text',
  };

  const inputValue = 'Foo';

  /**
   * Imitates resizing the screen.
   * Calls all attached `visualViewport` event listeners.
   * @param {number} x
   * @param {number} y
   * @param {object} event - mock event to pass to `visualViewport` listeners.
   */
  function resizeWindow(x, y, event) {
    window.innerHeight = y;
    // call all attached listeners
    window.visualViewport.addEventListener.mock.calls.forEach(([, param2]) => param2(event));
  }

  beforeEach(() => {
    jest.clearAllMocks();

    window.visualViewport = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    wrapper = shallowMount(FilterInput, {
      propsData,
      stubs: { TagList },
    });

    input = wrapper.find({ ref: 'input' });
    getSelectionText.mockImplementation(() => input.element.value);
  });

  it('adds AX related markup', () => {
    const attrs = wrapper.attributes();
    const filterLabel = wrapper.find('#filter-label');

    // able to tab into
    expect(attrs).toHaveProperty('tabindex', '0');
    // labelled by these components
    expect(attrs).toHaveProperty('aria-labelledby', FilterInputId);
    // check aria-label for filter label
    expect(filterLabel.attributes('aria-label')).toBe(propsData.placeholder);
    // check filter label is a label tag
    expect(filterLabel.is('label')).toBe(true);
    // check that label is associated to filter input
    expect(filterLabel.attributes('for')).toBe(FilterInputId);
  });

  it('renders an `input` element', async () => {
    expect(input.exists()).toBe(true);
    expect(input.attributes('placeholder')).toBe(propsData.placeholder);
    wrapper.setProps({
      placeholder: 'Foo',
    });
    expect(input.attributes('placeholder')).toBe('Foo');
    // make sure it emits the correct event
    input.setValue(inputValue);
    expect(wrapper.emitted('input')).toEqual([[inputValue]]);
    // make sure the input is bound
    wrapper.setProps({
      value: 'new-value',
    });
    await wrapper.vm.$nextTick();
    expect(input.element.value).toEqual('new-value');
  });

  it('renders an filter label element that has a input-value attrib to resize the input', () => {
    wrapper.setProps({ value: inputValue });
    const filterLabel = wrapper.find('#filter-label');
    // check input-value attrib for filter label contains the input value
    expect(filterLabel.attributes('data-value')).toBe(inputValue);
    // check class for filter label
    expect(filterLabel.classes('filter__input-label')).toBe(true);
  });

  it('renders a `scrolling` class inside the input box wrapper if `isScrolling` is true', () => {
    const inputBoxWrapper = wrapper.find('.filter__input-box-wrapper');

    expect(inputBoxWrapper.classes('scrolling')).toBe(false);

    // simulate the `handleScrollbar` mixin triggering ON
    wrapper.setData({ isScrolling: true });

    expect(inputBoxWrapper.classes('scrolling')).toBe(true);
  });

  it('renders a disabled attr on input if it is disabled', () => {
    // input is not disabled
    expect(input.attributes('disabled')).toBeFalsy();
    // set disabled prop to true
    wrapper.setProps({ disabled: true });
    // input is disabled
    expect(input.attributes('disabled')).toBe('disabled');
  });

  it('emits `show-suggested-tags` if filter button is clicked', async () => {
    wrapper.find('.filter__filter-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['show-suggested-tags']).toBeTruthy();
  });

  it('renders a filter button with an icon slot', () => {
    const filterButton = wrapper.find('.filter__filter-button');
    expect(filterButton.attributes()).toMatchObject({
      'aria-hidden': 'true',
      tabindex: '-1',
      class: expect.not.stringContaining('blue'),
    });
    filterButtonSVG = filterButton.find(FilterIcon);
    expect(filterButtonSVG.exists()).toBe(true);
  });

  it('renders a filter button with blue color if input has any value', async () => {
    wrapper.setProps({ value: 'Foo' });
    await flushPromises();
    expect(wrapper.find('.filter__filter-button').classes('blue')).toBe(true);
  });

  it('blurs the input if hitting enter', async () => {
    wrapper.setProps({ value: inputValue, selectedTags: ['Tag1'] });
    await wrapper.vm.focusInput();
    expect(document.activeElement).toBe(input.element);
    input.trigger('keydown', {
      key: 'Enter',
    });
    // await for the ticks to end
    await flushPromises();
    expect(document.activeElement).not.toBe(input.element);
  });

  it('focuses the input if `focusInputWhenCreated` is on and input has content when component is created', async () => {
    wrapper.setProps({ value: 'It changes' });
    // Wait for the nextTick inside the input watcher
    await wrapper.vm.$nextTick();
    expect(document.activeElement).not.toBe(input.element);
    // create component with input value
    wrapper = shallowMount(FilterInput, {
      propsData: {
        ...propsData,
        value: 'Change',
        focusInputWhenCreated: true,
      },
      stubs: { TagList },
    });
    await wrapper.vm.$nextTick();
    input = wrapper.find({ ref: 'input' });
    expect(document.activeElement).toBe(input.element);
  });

  it('focuses input if `focusInputWhenEmpty` is on and input has no content', async () => {
    wrapper = shallowMount(FilterInput, {
      propsData: {
        ...propsData,
        focusInputWhenCreated: true,
        focusInputWhenEmpty: true,
      },
    });
    await wrapper.vm.$nextTick();
    input = wrapper.find({ ref: 'input' });
    expect(document.activeElement).toBe(input.element);
  });

  it('adds character `/` as input value', async () => {
    input.setValue('/');
    expect(wrapper.emitted('input')).toEqual([['/']]);
  });

  describe('copy/paste', () => {
    let clipboardData = {};

    beforeEach(() => {
      clipboardData = {
        setData: jest.fn(),
        getData: jest.fn((param) => {
          if (param === 'text/plain') return 'baz';
          return prepareDataForHTMLClipboard({
            input: 'baz',
            tags: ['tag', 'tag2'],
          });
        }),
        types: ['text/plain'],
      };
      jest.clearAllMocks();
      clipboardData.types = ['text/plain'];
    });

    it('copies the search query in both plain text and HTML', () => {
      wrapper.setProps({
        value: inputValue,
        selectedTags: tags,
      });
      // select all the text
      input.trigger('keydown', {
        metaKey: true,
        key: 'a',
      });
      // copy
      input.trigger('copy', { clipboardData });
      // assert the copy payload
      expect(clipboardData.setData).toHaveBeenCalledTimes(2);
      // in HTML
      expect(clipboardData.setData)
        .toHaveBeenNthCalledWith(1, 'text/html', prepareDataForHTMLClipboard({
          tags,
          input: inputValue,
        }));
      // in Plain text
      expect(clipboardData.setData)
        .toHaveBeenNthCalledWith(2, 'text/plain', 'Tag1 Tag2 Foo');
    });

    it('does not copy tags, if they are not selected', () => {
      // getSelectionText is mocked to be the input value
      wrapper.setProps({
        value: inputValue,
        selectedTags: tags,
      });
      // copy
      input.trigger('copy', { clipboardData });
      expect(clipboardData.setData)
        .toHaveBeenNthCalledWith(2, 'text/plain', 'Foo');
    });

    it('does not copy, if nothing is selected', () => {
      wrapper.setProps({
        value: inputValue,
      });
      getSelectionText.mockReturnValueOnce('');
      // copy
      input.trigger('copy', { clipboardData });
      expect(clipboardData.setData)
        .toHaveBeenCalledTimes(0);
    });

    it('does not cut, if nothing is selected', () => {
      wrapper.setProps({
        value: inputValue,
      });
      getSelectionText.mockReturnValueOnce('');
      // copy
      input.trigger('cut', { clipboardData });
      expect(clipboardData.setData)
        .toHaveBeenCalledTimes(0);
      expect(wrapper.emitted('input')).toBeFalsy();
      expect(wrapper.emitted('update:selectedTags')).toBeFalsy();
    });

    it('cuts selected text and tags', () => {
      wrapper.setProps({
        value: inputValue,
        selectedTags: tags,
      });
      // select all the text
      input.trigger('keydown', {
        metaKey: true,
        key: 'a',
      });
      // copy
      input.trigger('cut', { clipboardData });
      // assert the data is copied
      expect(clipboardData.setData).toHaveBeenCalledTimes(2);
      expect(clipboardData.setData)
        .toHaveBeenNthCalledWith(1, 'text/html', prepareDataForHTMLClipboard({
          tags,
          input: inputValue,
        }));
      // in Plain text
      expect(clipboardData.setData)
        .toHaveBeenNthCalledWith(2, 'text/plain', 'Tag1 Tag2 Foo');
      // assert the tags and input are removed
      expect(wrapper.emitted('update:selectedTags')[0][0]).toEqual([]);
      expect(wrapper.emitted('input')[0][0]).toEqual('');
    });

    it('selects all tags, and focuses the first one, input is empty', () => {
      const spy = jest.spyOn(keyboardNavigation.methods, 'focusIndex');
      wrapper.setProps({
        selectedTags: tags,
        value: '',
      });
      const selectedTags = wrapper.find({ ref: 'selectedTags' });
      input.trigger('keydown', {
        key: 'a',
        metaKey: true,
      });
      expect(selectedTags.props('activeTags')).toEqual(tags);
      // assert we tried to ficus first item
      expect(spy).toHaveBeenCalledWith(0);
    });

    it('on paste, handles clipboard in HTML format, when copying and pasting from search directly', () => {
      clipboardData.types = ['text/html'];
      input.trigger('paste', { clipboardData });
      // assert getData is called properly
      expect(clipboardData.getData).toHaveBeenCalledTimes(2);
      expect(clipboardData.getData).toHaveBeenCalledWith('text/plain');
      expect(clipboardData.getData).toHaveBeenCalledWith('text/html');
      // assert the input and tags are emitted
      expect(wrapper.emitted('input')).toEqual([['baz']]);
      // one vent, one param, which is an array
      expect(wrapper.emitted('update:selectedTags')).toEqual([[['tag', 'tag2']]]);
    });

    it('on paste, handles clipboard when copying and pasting from any HTML outside the search', () => {
      clipboardData.getData = jest.fn((param) => {
        if (param === 'text/plain') return 'Title';
        return `
          <meta charset='utf-8'>
          <h1 class="title">
            Title
          </h1>
        `;
      });
      clipboardData.types.push('text/html');

      input.trigger('paste', { clipboardData });
      // assert getData is called properly
      expect(clipboardData.getData).toHaveBeenCalledTimes(2);
      expect(clipboardData.getData).toHaveBeenCalledWith('text/plain');
      expect(clipboardData.getData).toHaveBeenCalledWith('text/html');
      // assert the input and tags are emitted
      expect(wrapper.emitted('input')).toHaveLength(1);
      expect(wrapper.emitted('input')[0]).toEqual(['Title']);
      expect(wrapper.emitted('update:selectedTags')).toHaveLength(1);
      expect(wrapper.emitted('update:selectedTags')[0]).toEqual([[]]);
    });

    it('on paste, reads directly from plain text, if json is not available', () => {
      clipboardData.getData.mockReturnValueOnce('[tag1][tag2] string');
      input.trigger('paste', { clipboardData });
      // assert getData is called properly
      expect(clipboardData.getData).toHaveBeenCalledTimes(1);
      expect(clipboardData.getData).toHaveBeenCalledWith('text/plain');
      expect(clipboardData.getData).not.toHaveBeenCalledWith('text/html');
      // assert the input and tags are emitted
      expect(wrapper.emitted('input')).toHaveLength(1);
      expect(wrapper.emitted('input')[0]).toEqual(['[tag1][tag2] string']);
      expect(wrapper.emitted('update:selectedTags')).toHaveLength(1);
      expect(wrapper.emitted('update:selectedTags')[0]).toEqual([[]]);
    });

    it('on paste, overwrites all the tags if they are selected', () => {
      clipboardData.types.push('text/html');
      // add pre-selected tags
      wrapper.setProps({
        selectedTags: tags,
        input: 'Foo',
      });
      // select all
      const selectedTags = wrapper.find({ ref: 'selectedTags' });
      selectedTags.vm.$emit('select-all');

      input.trigger('paste', { clipboardData });
      // assert that tags are overwritten
      expect(wrapper.emitted('update:selectedTags')).toHaveLength(1);
      expect(wrapper.emitted('update:selectedTags')[0][0])
        .toEqual(['tag', 'tag2']);
    });

    it('on paste, adds tags to the already selected, removing duplicates', () => {
      clipboardData.types.push('text/html');
      // add pre-selected tags
      wrapper.setProps({
        selectedTags: ['tag'],
      });

      input.trigger('paste', { clipboardData });
      // assert that tags are overwritten
      expect(wrapper.emitted('update:selectedTags')).toHaveLength(1);
      expect(wrapper.emitted('update:selectedTags')[0][0])
        .toEqual(['tag', 'tag2']);
    });

    it('on paste, overwrites just the selected part of the input text', () => {
      getSelectionText.mockImplementationOnce(() => 'part');
      wrapper.setProps({
        value: 'partial input',
      });
      input.trigger('paste', { clipboardData });
      expect(wrapper.emitted('input')[0][0]).toBe('bazial input');
    });

    it('on paste, inserts the text, at the position, where the caret is, if no text is selected', () => {
      // overwrite the currently selected element position
      Object.defineProperty(document.activeElement, 'selectionStart', {
        value: 2,
      });
      clipboardData.getData.mockReturnValueOnce('fact');
      getSelectionText.mockImplementationOnce(() => '');
      wrapper.setProps({
        value: 'input',
      });
      input.trigger('paste', { clipboardData });
      expect(wrapper.emitted('input')[0][0]).toBe('infactput');
    });
  });

  describe('once `suggestedTags` is rendered', () => {
    let suggestedTags;
    let deleteButton;
    const relatedTargetCard = document.createElement('a');
    document.body.appendChild(relatedTargetCard);

    beforeEach(() => {
      // show the suggested tags
      wrapper.find('.filter').trigger('focus');

      suggestedTags = wrapper.find({ ref: 'suggestedTags' });
      deleteButton = wrapper.find('.filter__delete-button');
    });

    it('limits the amount of rendered, if `shouldTruncateTags` is `true`', () => {
      const newTags = ['a', 'b', 'c', 'd', 'e', 'f'];
      wrapper.setProps({
        tags: newTags,
      });
      expect(suggestedTags.props('tags')).toEqual(newTags);
      wrapper.setProps({
        shouldTruncateTags: true,
      });
      expect(suggestedTags.props('tags')).toEqual(newTags.slice(0, TagLimit));
    });

    it('renders `deleteButton` when there are tags and they are shown', () => {
      expect(deleteButton.exists()).toBe(true);
    });

    it('renders `suggestedTags` component when `displaySuggestedTags` is true', () => {
      expect(suggestedTags.exists()).toBe(true);
      expect(suggestedTags.props('tags')).toEqual(propsData.tags);
    });

    it('adds the correct aria label to `suggestedTags` component', () => {
      expect(suggestedTags.props()).toHaveProperty('id', SuggestedTagsId);
      expect(suggestedTags.props()).toHaveProperty('ariaLabel', 'Suggested tags');
      wrapper.setProps({ tags: ['1'] });
      expect(suggestedTags.props()).toHaveProperty('ariaLabel', 'Suggested tag');
    });

    it('keeps `suggestedTags` component when `suggestedTags` gets focus instead of `input`', () => {
      suggestedTags.trigger('focus');
      expect(wrapper.emitted('show-suggested-tags')).toBeTruthy();
      expect(suggestedTags.exists()).toBe(true);
    });

    it('keeps `suggestedTags` component when `deleteButton` gets focus instead of `input`', () => {
      deleteButton.trigger('focus');
      expect(wrapper.emitted('show-suggested-tags')).toBeTruthy();
      expect(suggestedTags.exists()).toBe(true);
    });

    it('removes `suggestedTags` component when `suggestedTags` looses its focus on an external component', async () => {
      suggestedTags.trigger('focus');
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true]]);
      expect(wrapper.find({ ref: 'suggestedTags' }).exists()).toBe(true);

      suggestedTags.trigger('blur', {
        relatedTarget: relatedTargetCard,
      });
      await wrapper.vm.$nextTick();
      // first time was `true`, from `focus`, then `blur` made it `false`
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true], [false]]);
      expect(suggestedTags.exists()).toBe(false);
    });

    it('deletes `suggestedTags` component when `deleteButton` looses its focus on an external component', async () => {
      deleteButton.trigger('focus');
      expect(deleteButton.exists()).toBe(true);
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true]]);

      deleteButton.trigger('blur', {
        relatedTarget: relatedTargetCard,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true], [false]]);
      expect(suggestedTags.exists()).toBe(false);
    });

    it('does not hide the tags, if the new focus target matches `input, button`, inside the main component', async () => {
      const buttonTarget = wrapper.find('button'); // find a button component
      input.trigger('blur', {
        relatedTarget: buttonTarget.element,
      });
      await flushPromises();
      expect(suggestedTags.exists()).toBe(true);
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true]]);
    });

    it('hides the tags, if new focus outside component', async () => {
      const inputTarget = document.createElement('input');

      input.trigger('blur', {
        relatedTarget: inputTarget.element,
      });

      await flushPromises();

      expect(suggestedTags.exists()).toBe(false);
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true], [false]]);
    });

    it('hides the tags, if the new focus target is a link, outside the FilterInput', async () => {
      const relatedTargetOther = document.createElement('p');

      input.trigger('blur', {
        relatedTarget: relatedTargetCard,
      });
      input.trigger('blur', {
        relatedTarget: relatedTargetOther,
      });

      await wrapper.vm.$nextTick();
      expect(suggestedTags.exists()).toBe(false);
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true], [false]]);
    });

    it('does not hide the tags, if `:preventedBlur=true`', async () => {
      wrapper.setProps({ preventedBlur: true });

      input.trigger('blur', {
        relatedTarget: relatedTargetCard,
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true]]);
      expect(suggestedTags.exists()).toBe(true);
    });

    describe('when there is no tags shown', () => {
      beforeEach(() => {
        wrapper.setProps({ tags: [] });
        deleteButton = wrapper.find('.filter__delete-button');
      });

      it('deletes `suggestedTags` component when no tags available', () => {
        expect(suggestedTags.exists()).toBe(false);
      });

      it('does not render `deleteButton` when there are no tags and `input` is empty', () => {
        expect(deleteButton.exists()).toBe(false);
      });

      it('renders `deleteButton` when there are no tags or they are not shown but there is text on `input`', () => {
        expect(deleteButton.exists()).toBe(false);
        wrapper.setProps({ value: 'foo' });

        deleteButton = wrapper.find('.filter__delete-button');
        expect(deleteButton.exists()).toBe(true);
      });
    });

    it('adds tag to `selectedTags` when it is clicked, clearing the filter', () => {
      const selectedTag = 'Tag1';
      suggestedTags.vm.$emit('click-tags', { tagName: selectedTag });
      expect(wrapper.emitted('update:selectedTags')).toEqual([[[selectedTag]]]);
      expect(wrapper.emitted('input')).toEqual([['']]);
    });

    it('adds tag to `selectedTags` when it is clicked, without clearing the filter', () => {
      wrapper.setProps({
        clearFilterOnTagSelect: false,
      });
      const selectedTag = 'Tag1';
      suggestedTags.vm.$emit('click-tags', { tagName: selectedTag });
      expect(wrapper.emitted('update:selectedTags')).toEqual([[[selectedTag]]]);
      expect(wrapper.emitted('input')).toBeFalsy();
    });

    describe('when a tag is selected', () => {
      let selectedTagsComponent;
      const selectedTag = 'Tag1';

      beforeEach(async () => {
        // make sure focus is inside the wrapper
        wrapper.find('button').element.focus();
        await wrapper.vm.$nextTick();

        wrapper.setProps({ selectedTags: [selectedTag] });
        await wrapper.vm.$nextTick();
        selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });
      });

      it('renders `selectedTags` component with selected tag', () => {
        expect(selectedTagsComponent.exists()).toBe(true);
        expect(selectedTagsComponent.props('tags')).toEqual([selectedTag]);
        expect(selectedTagsComponent.props()).toHaveProperty('areTagsRemovable', true);
      });

      it('adds the `selected-tags` id to the AX `aria-labelledby` property', () => {
        const attrs = wrapper.attributes();
        expect(attrs).toHaveProperty('aria-labelledby', 'filter-input selected-tags');
      });

      it('re-emits the the `preventedBlur` event, from selected tags', () => {
        selectedTagsComponent.vm.$emit('prevent-blur');
        expect(wrapper.emitted('update:preventedBlur')).toEqual([[true]]);
      });

      it('renders a filter button with blue color', () => {
        const filterButton = wrapper.find('.filter__filter-button');
        expect(filterButton.classes('blue')).toBe(true);
      });

      it('focuses input, when selectedTags changes, if focus is inside', async () => {
        expect(document.activeElement).toBe(input.element);
        input.element.blur();
        expect(document.activeElement).not.toBe(input.element);
        wrapper.find('button').element.focus();
        wrapper.setProps({ selectedTags: [] });
        await flushPromises();
        expect(document.activeElement).toBe(input.element);
      });

      it('does not focus the input, if the initial focus is NOT inside', async () => {
        document.activeElement.blur();
        await wrapper.vm.$nextTick();
        wrapper.setProps({ selectedTags: [] });
        await wrapper.vm.$nextTick();
        expect(document.activeElement).not.toEqual(input.element);
      });

      it('changes the input placeholder to empty', () => {
        expect(input.attributes('placeholder')).toBe('');
      });

      it('resets scroll on `suggestedTags` when selectedTags changes if there is suggested tags', async () => {
        const spy = jest.spyOn(wrapper.find({ ref: 'suggestedTags' }).vm, 'resetScroll');
        wrapper.setProps({
          selectedTags: [selectedTag],
        });
        // once for the watcher to kick in
        await wrapper.vm.$nextTick();
        // once for the `focusInput` to pass
        await wrapper.vm.$nextTick();
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });

      it('select latest selected tag, if delete key is pressed on keyboard, and there is no input text', () => {
        const spy = jest.spyOn(keyboardNavigation.methods, 'focusLast').mockReturnValueOnce();

        wrapper = shallowMount(FilterInput, {
          propsData: { selectedTags: [selectedTag] },
          stubs: { TagList },
        });

        input = wrapper.find({ ref: 'input' });
        input.trigger('keydown.delete');

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('does not move the cursor to the beginning of the input when selected tags have all been deleted', async () => {
        wrapper.setProps({ value: 'Foo' });
        wrapper.find({ ref: 'selectedTags' }).vm.$emit('delete-tag', selectedTag);
        wrapper.setProps({ selectedTags: [] });
        await flushPromises();
        expect(document.activeElement).toEqual(input.element);
        expect(moveCursorToStart).toHaveBeenCalledTimes(0);
      });

      it('moves cursor to the start of the input if selected tags have changed and there are still available', async () => {
        const updatedSelectedTag = 'AppKit';
        // prepare
        wrapper.setProps({ selectedTags: [selectedTag, updatedSelectedTag], input: 'Foo' });
        // delete a tag
        selectedTagsComponent.vm.$emit('delete-tag', {
          tagName: selectedTag,
          event: new KeyboardEvent('keydown', { key: 'Backspace' }),
        });

        await flushPromises();
        // assert it emits the updated selected tags
        expect(wrapper.emitted('update:selectedTags')[0]).toEqual([[updatedSelectedTag]]);
        // assert it moves the caret if more tags still available
        expect(moveCursorToStart).toHaveBeenCalledTimes(1);
      });

      it('moves cursor to the end of the input if user types on top of a tag', async () => {
        const updatedSelectedTag = 'AppKit';
        // prepare
        wrapper.setProps({ selectedTags: [selectedTag, updatedSelectedTag], input: 'Foo' });
        // delete a tag
        wrapper.find({ ref: 'selectedTags' }).vm.$emit('delete-tag', {
          tagName: selectedTag,
          event: new KeyboardEvent('keydown', { key: 'k' }),
        });

        await flushPromises();
        // assert it emits the updated selected tags
        expect(wrapper.emitted('update:selectedTags')[0]).toEqual([[updatedSelectedTag]]);
        // assert it moves the caret if more tags still available
        expect(moveCursorToEnd).toHaveBeenCalledTimes(1);
        expect(moveCursorToStart).toHaveBeenCalledTimes(0);
      });

      it('reset filters if delete key is pressed on input when input and tags are selected', async () => {
        wrapper.setProps({ value: 'foo', selectedTags: [selectedTag] });

        input.trigger('keydown', {
          key: 'a',
          metaKey: true,
        });
        input.trigger('keydown.delete');

        expect(wrapper.emitted('update:selectedTags')[0][0]).toEqual([]);
        await flushPromises();
        expect(document.activeElement).toBe(input.element);
      });

      it('reset filters when `reset-filters` event is called on `selectedTags`', async () => {
        selectedTagsComponent.vm.$emit('reset-filters');

        expect(wrapper.emitted('input')).toEqual([['']]);
        expect(wrapper.emitted('update:selectedTags')).toEqual([[[]]]);
        expect(wrapper.emitted('show-suggested-tags')).toEqual([[true]]);
        await wrapper.vm.$nextTick();
        expect(document.activeElement).toBe(input.element);
      });

      it('keeps the focus on input after resetting filters', async () => {
        const spy = jest.spyOn(selectedTagsComponent.vm, 'focusTag').mockReturnValueOnce();

        // add tags
        wrapper.setProps({ value: '', selectedTags: tags });
        expect(spy).toHaveBeenCalledTimes(0);
        // select all
        wrapper.find({ ref: 'input' }).trigger('keydown', {
          key: 'a',
          metaKey: true,
        });
        expect(spy).toHaveBeenCalledTimes(1);

        // simulate resetting the filters
        selectedTagsComponent.vm.$emit('reset-filters');
        await flushPromises();

        expect(document.activeElement).toBe(input.element);
      });

      it('sets the `keyboardIsVirtual` to true, when resizing the screen and there is a substantial height difference', async () => {
        const { VirtualKeyboardThreshold } = multipleSelection.constants;

        expect(window.visualViewport.addEventListener)
          .toHaveBeenLastCalledWith('resize', wrapper.vm.updateKeyboardType);

        const height = 568;
        const eventProperty = { target: { height: height - VirtualKeyboardThreshold } };
        resizeWindow(320, height, eventProperty);
        expect(wrapper.vm.keyboardIsVirtual).toBe(true);
      });

      it('removes the `visualViewport` listeners', () => {
        wrapper.destroy();
        expect(window.visualViewport.removeEventListener)
          .toHaveBeenLastCalledWith('resize', wrapper.vm.updateKeyboardType);
      });

      it('sets the `keyboardIsVirtual` to false, when resizing the screen and there is little to no height difference', async () => {
        const height = 568;
        // small difference
        const eventProperty = { target: { height: height - 10 } };

        resizeWindow(320, height, eventProperty);
        expect(wrapper.vm.keyboardIsVirtual).toBe(false);
      });

      it('deletes the last tag, if delete button is pressed on a virtual keyboard, when no input', () => {
        wrapper.setData({ keyboardIsVirtual: true });

        wrapper.find({ ref: 'input' }).trigger('keydown.delete');

        expect(wrapper.emitted('update:selectedTags')).toEqual([[[]]]);
      });

      it('deletes selected tag when tag is clicked on a virtual keyboard', async () => {
        wrapper.setData({ keyboardIsVirtual: true });
        wrapper.setProps({ selectedTags: [selectedTag, 'Tag2'] });
        await wrapper.vm.$nextTick();

        selectedTagsComponent.vm.$emit('click-tags', { tagName: 'Tag2' });
        await flushPromises();

        expect(wrapper.emitted('update:selectedTags')).toEqual([[[selectedTag]]]);
      });

      it('deletes selected tag debounced', async () => {
        wrapper.setData({ keyboardIsVirtual: true });

        const selectedTags = wrapper.find({ ref: 'selectedTags' });
        selectedTags.vm.$emit('click-tags', { tagName: selectedTag });
        expect(debounce).toHaveBeenLastCalledWith(wrapper.vm.handleDeleteTag, 280);
        await flushPromises();
        expect(wrapper.emitted('update:selectedTags')).toEqual([[[]]]);
      });

      it('focuses the input and does not delete selected tag when it is clicked on desktop', () => {
        const selectedTags = wrapper.find({ ref: 'selectedTags' });
        selectedTags.vm.$emit('click-tags', selectedTag);
        expect(wrapper.vm.selectedTags).toEqual([selectedTag]);
        expect(document.activeElement).toBe(input.element);
      });
    });

    it('resets filters when `deleteButton` is clicked', async () => {
      wrapper.setProps({ value: '', selectedTags: [] });
      deleteButton.trigger('click');

      // last emitted item is false. We have one true, because we focused.
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true], [false]]);
      expect(wrapper.emitted('input')).toEqual([['']]);
      expect(wrapper.emitted('update:selectedTags')).toEqual([[[]]]);
      expect(document.activeElement).not.toBe(input.element);
      expect(wrapper.vm.resetedTagsViaDeleteButton).toEqual(true);

      wrapper.setProps({ value: 'foo', selectedTags: tags });
      deleteButton.trigger('click');

      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true], [false]]);
      expect(wrapper.emitted('input')).toEqual([[''], ['']]);
      expect(wrapper.emitted('update:selectedTags')).toEqual([[[]], [[]]]);
      expect(document.activeElement).not.toBe(input.element);
      expect(wrapper.vm.resetedTagsViaDeleteButton).toEqual(true);
    });

    it('emits `focus-next` if the down key is pressed on input and there is no suggestedTags', () => {
      wrapper.setProps({ tags: [] });
      input = wrapper.find('input');

      input.trigger('keydown.down');

      expect(wrapper.emitted('focus-next')).toBeTruthy();
    });

    it('focuses the first tag, if the down key is pressed on input', () => {
      const spy = jest.spyOn(suggestedTags.vm, 'focusFirst');
      input.trigger('keydown.down');

      expect(wrapper.emitted('keydown:down')).toBeFalsy();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emits `focus-next` if the down key is pressed on input, and with `positionReversed`', () => {
      wrapper.setProps({ positionReversed: true });
      input = wrapper.find('input');

      input.trigger('keydown.down');

      expect(wrapper.emitted('focus-next')).toBeTruthy();
    });

    it('emits `focus-prev` if the up key is pressed on input and there is no suggestedTags', () => {
      wrapper.setProps({ tags: [] });
      input = wrapper.find('input');

      input.trigger('keydown.up');

      expect(wrapper.emitted('focus-prev')).toBeTruthy();
    });

    it('emits `focus-prev` if the up key is pressed on input, with tags and no `positionReversed`', () => {
      input = wrapper.find('input');

      input.trigger('keydown.up');

      expect(wrapper.emitted('focus-prev')).toBeTruthy();
    });

    it('focuses the first tag, if the up key is pressed on input, and `positionReversed` is true', () => {
      wrapper.setProps({ positionReversed: true });
      const spy = jest.spyOn(suggestedTags.vm, 'focusFirst');
      input.trigger('keydown.up');

      expect(wrapper.emitted('keydown:up')).toBeFalsy();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('resets all the filters after the user selects all the content and writes over it, if key is a single character', async () => {
      isSingleCharacter.mockImplementation(() => true);
      wrapper.setProps({ value: 'foo', selectedTags: tags });

      const singleCharacter = 'a';

      wrapper.find({ ref: 'selectedTags' }).vm.$emit('select-all');
      input.trigger('keydown', { key: singleCharacter });
      input.setValue(singleCharacter);

      expect(wrapper.emitted('input')).toEqual([[''], [singleCharacter]]);
      expect(wrapper.emitted('update:selectedTags')).toEqual([[[]]]);
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toBe(input.element);
    });

    it('resets all the filters, if user selects all text and enters a character with pressing shift', async () => {
      isSingleCharacter.mockImplementation(() => true);
      wrapper.setProps({ value: 'foo', selectedTags: tags });

      const singleCharacter = 'A';

      wrapper.find({ ref: 'selectedTags' }).vm.$emit('select-all');

      input.trigger('keydown', {
        key: singleCharacter,
        shiftKey: true,
      });
      input.setValue(singleCharacter);

      expect(wrapper.emitted('input')).toEqual([[''], [singleCharacter]]);
      expect(wrapper.emitted('update:selectedTags')).toEqual([[[]]]);
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toBe(input.element);
    });

    it('does not reset all the filters after the user selects all the content and types something on top if key is not a single character', () => {
      isSingleCharacter.mockImplementation(() => false);
      wrapper.setProps({ value: 'foo', selectedTags: tags });

      const nonSingleCharacter = '>';

      wrapper.find({ ref: 'selectedTags' }).vm.$emit('select-all');
      input.trigger('keydown', { key: nonSingleCharacter });

      input.trigger('keydown', {
        key: nonSingleCharacter,
        shiftKey: true,
      });

      expect(wrapper.emitted('input')).toBeFalsy();
      expect(wrapper.emitted('update:selectedTags')).toBeFalsy();
    });

    it('does not reset tags if only text is fully selected when typing', () => {
      wrapper.setProps({ value: 'foo', selectedTags: tags });
      input.trigger('keydown', {
        key: 'c', // single char
      });
      expect(wrapper.emitted('show-suggested-tags')).toEqual([[true]]);
      expect(wrapper.emitted('input')).toBeFalsy();
      expect(wrapper.emitted('update:selectedTags')).toBeFalsy();
    });

    it('focuses selected tags if `select-all` is emitted from selectedTags and input has value', () => {
      wrapper.setProps({ value: 'foo', selectedTags: tags });
      const selectedTags = wrapper.find({ ref: 'selectedTags' });
      selectedTags.vm.$emit('select-all');

      expect(wrapper.vm.selectedTag).toEqual(wrapper.vm.activeTag);
    });

    it('focuses selected tags if `cmd + a` is triggered on input that has a value', () => {
      wrapper.setProps({ value: 'foo', selectedTags: tags });
      input.trigger('keydown', {
        key: 'a',
        metaKey: true,
      });

      expect(wrapper.vm.selectedTag).toEqual(wrapper.vm.activeTag);
    });

    it('does not focus selected tags if `cmd + a` is triggered on input that has a value and then user clicks on input', () => {
      wrapper.setProps({ value: 'foo', selectedTags: tags });
      input.trigger('keydown', {
        key: 'a',
        metaKey: true,
      });

      input.trigger('click');

      expect(wrapper.vm.activeTags).toEqual([]);
    });

    it('focuses selected tags if `ctrl + a` is triggered on input that has a value', () => {
      wrapper.setProps({ value: 'foo', selectedTags: tags });
      input.trigger('keydown', {
        key: 'a',
        ctrlKey: true,
      });

      expect(wrapper.vm.selectedTag).toEqual(wrapper.vm.activeTag);
    });

    it('focus on the first tag of selectedTags if cmd + a is triggered on an empty input, there is not a shift init tag and there are selected tags', () => {
      const spy = jest.spyOn(TagList.methods, 'focusTag').mockReturnValueOnce();
      wrapper = shallowMount(FilterInput, {
        propsData,
        stubs: { TagList },
      });

      wrapper.setProps({ value: '', selectedTags: tags });
      wrapper.find({ ref: 'input' }).trigger('keydown', {
        key: 'a',
        metaKey: true,
      });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('assigns selected tags to active tags when cmd + a is triggered on input', () => {
      wrapper.setProps({ value: 'Foo', selectedTags: tags });
      const selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });
      wrapper.find({ ref: 'input' }).trigger('keydown', {
        key: 'a',
        metaKey: true,
      });
      expect(selectedTagsComponent.props('activeTags')).toEqual(wrapper.vm.selectedTags);
    });

    it('focus on the first tag when the left key is triggered on a selected input and tags are selected as well', async () => {
      wrapper.setProps({ selectedTags: tags });
      const selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });

      const spy = jest.spyOn(selectedTagsComponent.vm, 'focusTag').mockReturnValueOnce();
      await flushPromises();
      input.trigger('keydown', {
        key: 'a',
        metaKey: true,
      });
      expect(spy).toHaveBeenCalledTimes(1);
      input.trigger('keydown.left');
      await flushPromises();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('focus on the first tag, when `@focus-prev` is emitted, from selectedTags and position reversed', async () => {
      wrapper.setProps({ selectedTags: tags.slice(1), positionReversed: true });
      await flushPromises();
      const selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });
      const spy = jest.spyOn(suggestedTags.vm, 'focusFirst').mockReturnValueOnce();
      selectedTagsComponent.vm.$emit('focus-prev');
      await flushPromises();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emits `focus-prev`, when `@focus-prev` is emitted, from selectedTags and no positionReversed', async () => {
      wrapper.setProps({ selectedTags: tags.slice(1) });
      await flushPromises();
      const selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });
      const spy = jest.spyOn(suggestedTags.vm, 'focusFirst').mockReturnValueOnce();
      selectedTagsComponent.vm.$emit('focus-prev');
      await flushPromises();
      expect(spy).toHaveBeenCalledTimes(0);
      expect(wrapper.emitted('focus-prev')).toBeTruthy();
    });

    it('emits `focus-next`, when @focus-next is called from SuggestedTags', () => {
      wrapper.find({ ref: 'suggestedTags' }).vm.$emit('focus-next');
      expect(wrapper.emitted('focus-next')).toHaveLength(1);
    });

    it('focuses the input, when @focus-next is called from SuggestedTags, with positionReversed', async () => {
      wrapper.setProps({ positionReversed: true });
      wrapper.find({ ref: 'suggestedTags' }).vm.$emit('focus-next');
      await flushPromises();
      expect(document.activeElement).toEqual(input.element);
    });

    it('emits `focus-prev`, when @focus-prev is called from SuggestedTags, with positionReversed', () => {
      wrapper.setProps({ positionReversed: true });

      wrapper.find({ ref: 'suggestedTags' }).vm.$emit('focus-prev');
      expect(wrapper.emitted('focus-prev')).toHaveLength(1);
    });

    it('focuses the input, when @focus-prev is called from Suggested tags', async () => {
      wrapper.find({ ref: 'suggestedTags' }).vm.$emit('focus-prev');
      await flushPromises();
      expect(document.activeElement).toEqual(input.element);
    });

    it('focus on the last tag when the left key is triggered, on a selected input, and but tags are not highlighted', () => {
      wrapper.setProps({ selectedTags: tags });

      const spy = jest.spyOn(wrapper.find({ ref: 'selectedTags' }).vm, 'focusLast')
        .mockReturnValueOnce();

      input.element.select();
      input.trigger('keydown.left');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('focus on the last tag when the left key is triggered on input, with no highlighted tags', () => {
      wrapper.setProps({ selectedTags: tags });

      const spy = jest.spyOn(wrapper.find({ ref: 'selectedTags' }).vm, 'focusLast')
        .mockReturnValueOnce();

      // input is is not selected, but the cursor is at the first item
      input.trigger('keydown.left');

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Shift and Meta selection', () => {
    const selectedTags = ['Tag1', 'Tag2', 'Tag3'];
    let spyFocusTag;
    let selectedTagsComponent;
    let spySetSelectionRange;

    describe('starting from input', () => {
      beforeEach(async () => {
        jest.resetAllMocks();
        wrapper.setProps({
          selectedTags,
          value: inputValue,
        });

        await wrapper.vm.$nextTick();
        selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });
        spyFocusTag = jest.spyOn(selectedTagsComponent.vm, 'focusTag').mockReturnValueOnce();
        spySetSelectionRange = jest.spyOn(input.element, 'setSelectionRange');
      });

      it('selects the whole range between the text input and tag that has been focused afterwards', () => {
        // Put cursor on the second position of the input
        // eslint-disable-next-line
        input.element.selectionStart = input.element.selectionEnd = 2;

        // Set shift key on the input
        input.trigger('keydown', { shiftKey: true });

        // Focus on the first tag
        selectedTagsComponent.vm.$emit('focus', {
          tagName: selectedTags[0],
          event: { relatedTarget: document.createElement('input') },
        });

        // All tags should be active
        expect(wrapper.vm.activeTags).toEqual(selectedTags);
        // Text selection should have been called from characters 0 to 2
        expect(spySetSelectionRange).toHaveBeenCalledWith(0, 2);
      });

      it('selects selected text and all tags until the last one, when user has selected a text and focused on a tag, while holding the shift key', () => {
        // Select text from character 1 to 2
        input.element.selectionStart = 1;
        input.element.selectionEnd = 2;

        // Set shift key on the input
        input.trigger('keydown', { shiftKey: true });

        // Focus on the middle tag
        selectedTagsComponent.vm.$emit('focus', {
          tagName: selectedTags[1],
          event: { relatedTarget: document.createElement('input') },
        });

        // Tags from middle to the last one should get active
        expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[2]]);
        // Text selection should have been called from characters 1 to 2
        expect(spySetSelectionRange).toHaveBeenCalledWith(1, 2);
      });

      describe('when the left arrow is pressed while holding the shift key on input', () => {
        beforeEach(() => {
          // Put cursor on the beginning of the input
          // eslint-disable-next-line
          input.element.selectionStart = input.element.selectionEnd = 0;

          // Press left key + shift on input
          input.trigger('keydown.left', { shiftKey: true });
        });

        it('selects tags from right to left', () => {
          // Last tag should get active
          expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);

          // Press left key + shift on the last tag
          selectedTagsComponent.vm.$emit('keydown', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown.left', { shiftKey: true }),
          });

          // Previous tag get focus
          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[1] });

          // Last two tags get active
          expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[2]]);
        });

        it('unselects tags from left to right', () => {
          // Press left key + shift on the last tag
          selectedTagsComponent.vm.$emit('keydown', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown.left', { shiftKey: true }),
          });
          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[1] });

          // Last two tags get active
          expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[2]]);

          // Press right key + shift when focusing on the middle tag
          selectedTagsComponent.vm.$emit('keydown', {
            tagName: selectedTags[1],
            event: new KeyboardEvent('keydown.right', { shiftKey: true }),
          });
          // Last tag get focus
          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[2] });

          // Only the last tag get active
          expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);
        });

        it('unselects tags clicking on them using the meta key', () => {
          // Press left key + shift on the last tag
          selectedTagsComponent.vm.$emit('keydown', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown.left', { shiftKey: true }),
          });
          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[1] });

          // Last two tags get active
          expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[2]]);

          // Click on the selected tag 1 while pressing the metaKey
          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[1],
            event: new MouseEvent('click', { metaKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);
          expect(spyFocusTag).toHaveBeenCalledTimes(1);
        });

        it('unselects tags clicking on them using the ctrl key', () => {
          // Press left key + shift on the last tag
          selectedTagsComponent.vm.$emit('keydown', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown.left', { shiftKey: true }),
          });
          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[1] });

          // Last two tags get active
          expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[2]]);

          // Click on the selected tag 1 while pressing the control key
          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[1],
            event: new MouseEvent('click', { ctrlKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);
          expect(spyFocusTag).toHaveBeenCalledTimes(1);
        });

        it('does not select tags if user tabs while holding the shift key from input', () => {
          input.trigger('keydown', { key: 'Tab', shiftKey: true });
          expect(wrapper.vm.activeTags).toEqual([]);

          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[2] });
          expect(wrapper.vm.activeTags).toEqual([]);
        });
      });
    });

    describe('starting from tags', () => {
      beforeEach(async () => {
        jest.resetAllMocks();
        wrapper.setProps({ selectedTags });
        await wrapper.vm.$nextTick();
        selectedTagsComponent = wrapper.find({ ref: 'selectedTags' });
        spyFocusTag = jest.spyOn(selectedTagsComponent.vm, 'focusTag').mockReturnValueOnce();
      });

      it('selects the whole range between the init tag index and the focused tag index from right to left', () => {
        selectedTagsComponent.vm.$emit('keydown', {
          tagName: selectedTags[2],
          event: new KeyboardEvent('keydown', { shiftKey: true }),
        });
        selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[0] });

        expect(wrapper.vm.activeTags).toEqual(selectedTags);
      });

      it('keeps tags selected when focusing on the input after pressing on the right key on the last tag', async () => {
        // Press right key + shift on the last tag
        selectedTagsComponent.vm.$emit('keydown', {
          tagName: selectedTags[2],
          event: new KeyboardEvent('keydown.right', { shiftKey: true }),
        });

        selectedTagsComponent.vm.$emit('focus-next');

        expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);
        await wrapper.vm.$nextTick();
        expect(document.activeElement).toBe(input.element);
      });

      it('selects the whole range between the init tag index and the end of the active tags from left to right', async () => {
        const relatedTargetCard = document.createElement('a');
        // Select init tag
        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[0],
          event: new MouseEvent('click'),
        });

        // Trigger shift + meta + arrow right
        selectedTagsComponent.vm.$emit('keydown', {
          tagName: selectedTags[0],
          event: new KeyboardEvent('keydown', { shiftKey: true, metaKey: true, key: 'ArrowRight' }),
        });

        expect(wrapper.vm.activeTags).toEqual(selectedTags);
        // Focus on the last tag
        expect(spyFocusTag).toHaveBeenNthCalledWith(1, selectedTags[2]);

        // Select init tag again to reset active tags
        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[0],
          event: new MouseEvent('click'),
        });

        selectedTagsComponent.trigger('blur', {
          relatedTarget: relatedTargetCard,
        });

        await wrapper.vm.$nextTick();
        expect(wrapper.vm.activeTags).toEqual([]);

        // Trigger shift + ctrl + arrow right
        selectedTagsComponent.vm.$emit('keydown', {
          tagName: selectedTags[0],
          event: new KeyboardEvent('keydown', { shiftKey: true, ctrlKey: true, key: 'ArrowRight' }),
        });

        expect(wrapper.vm.activeTags).toEqual(selectedTags);
        // Focus on the last tag
        expect(spyFocusTag).toHaveBeenNthCalledWith(2, selectedTags[2]);
      });

      it('selects the whole range between the init tag index and the start of the active tags from right to left', () => {
        // Select init tag
        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[2],
          event: new MouseEvent('click'),
        });

        // Trigger shift + meta + arrow left
        selectedTagsComponent.vm.$emit('keydown', {
          tagName: selectedTags[2],
          event: new KeyboardEvent('keydown', { shiftKey: true, metaKey: true, key: 'ArrowLeft' }),
        });

        expect(wrapper.vm.activeTags).toEqual(selectedTags);
        // Focus on the first tag
        expect(spyFocusTag).toHaveBeenNthCalledWith(1, selectedTags[0]);

        // Select init tag again to reset active tags
        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[2],
          event: new MouseEvent('click'),
        });

        expect(wrapper.vm.activeTags).toEqual([]);

        // Trigger shift + ctrl + arrow left
        selectedTagsComponent.vm.$emit('keydown', {
          tagName: selectedTags[2],
          event: new KeyboardEvent('keydown', { shiftKey: true, ctrlKey: true, key: 'ArrowLeft' }),
        });

        expect(wrapper.vm.activeTags).toEqual(selectedTags);
        // Focus on the first tag
        expect(spyFocusTag).toHaveBeenNthCalledWith(1, selectedTags[0]);
      });

      it('adds a tag to the selection when user click on it holding the cmd key', () => {
        expect(wrapper.vm.activeTags).toEqual([]);
        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[1],
          event: new MouseEvent('click', { metaKey: true }),
        });

        expect(wrapper.vm.activeTags).toEqual([selectedTags[1]]);

        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[0],
          event: new MouseEvent('click', { metaKey: true }),
        });

        expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[0]]);
      });

      it('adds a tag to the selection when user click on it holding the ctrl key', () => {
        expect(wrapper.vm.activeTags).toEqual([]);
        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[1],
          event: new MouseEvent('click', { ctrlKey: true }),
        });

        expect(wrapper.vm.activeTags).toEqual([selectedTags[1]]);

        selectedTagsComponent.vm.$emit('click-tags', {
          tagName: selectedTags[0],
          event: new MouseEvent('click', { ctrlKey: true }),
        });

        expect(wrapper.vm.activeTags).toEqual([selectedTags[1], selectedTags[0]]);
      });

      it('selects the init tag as the length of selected tags when the selection starts on the input value', () => {
        input = wrapper.find({ ref: 'input' });
        input.trigger('keydown.left', {
          shiftKey: true,
        });

        expect(wrapper.vm.initTagIndex).toEqual(selectedTags.length);
        expect(wrapper.vm.activeTags).toEqual([selectedTags[selectedTags.length - 1]]);

        selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[0] });

        expect(wrapper.vm.activeTags).toEqual(selectedTags);
      });

      describe('When the user has selected a tag to init the shift selection', () => {
        beforeEach(async () => {
          selectedTagsComponent.vm.$emit('keydown', {
            tagName: selectedTags[0],
            event: new KeyboardEvent('keydown', { shiftKey: true }),
          });
          selectedTagsComponent.vm.$emit('focus', { tagName: selectedTags[2] });
        });

        it('selects the init tag', () => {
          expect(wrapper.vm.initTagIndex).toBe(0);
        });

        it('resets all the active tags when selected tags get blur', async () => {
          const relatedTargetCard = document.createElement('a');

          selectedTagsComponent.trigger('blur', {
            relatedTarget: relatedTargetCard,
          });
          await wrapper.vm.$nextTick();

          expect(wrapper.vm.activeTags).toEqual([]);
          expect(wrapper.vm.initTagIndex).toEqual(null);
        });

        it('reset filters when typing while being focus on active tags', () => {
          const alphanumKey = 'a';
          const space = ' ';

          selectedTagsComponent.vm.$emit('delete-tag', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown', { key: alphanumKey, shiftKey: false }),
          });

          expect(wrapper.emitted('update:selectedTags')).toHaveLength(1);

          selectedTagsComponent.vm.$emit('delete-tag', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown', { key: space, shiftKey: false }),
          });

          expect(wrapper.emitted('update:selectedTags')).toHaveLength(2);

          // is triggered by only shiftkey modifier combination
          selectedTagsComponent.vm.$emit('delete-tag', {
            tagName: selectedTags[2],
            event: new KeyboardEvent('keydown', { key: alphanumKey, shiftKey: true }),
          });

          expect(wrapper.emitted('update:selectedTags')).toHaveLength(3);
        });

        it('selects the whole range between the init tag index and the focused tag index from left to right', () => {
          expect(wrapper.vm.activeTags).toEqual(selectedTags);
        });

        it('deletes the selection when user types the delete key', () => {
          selectedTagsComponent.vm.$emit('delete-tag', {
            tagName: selectedTags[0],
            event: new KeyboardEvent('keydown', { key: 'Backspace' }),
          });
          expect(wrapper.emitted('update:selectedTags')[0][0]).toEqual([]);
          expect(wrapper.vm.activeTags).toEqual([]);
        });

        it('removes a tag from the shift selection when user click on it holding the cmd key', async () => {
          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[1],
            event: new MouseEvent('click', { metaKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([selectedTags[0], selectedTags[2]]);
          expect(spyFocusTag).toHaveBeenCalledTimes(1);

          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[0],
            event: new MouseEvent('click', { metaKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);
          expect(spyFocusTag).toHaveBeenCalledTimes(2);

          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[2],
            event: new MouseEvent('click', { metaKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([]);

          input = wrapper.find({ ref: 'input' });
          await wrapper.vm.$nextTick();
          // When there aren't activeTags anymore, focus goes to the input
          expect(document.activeElement).toBe(input.element);
        });

        it('removes a tag from the shift selection when user click on it holding the ctrl key', async () => {
          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[1],
            event: new MouseEvent('click', { ctrlKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([selectedTags[0], selectedTags[2]]);
          expect(spyFocusTag).toHaveBeenCalledTimes(1);

          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[0],
            event: new MouseEvent('click', { ctrlKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([selectedTags[2]]);
          expect(spyFocusTag).toHaveBeenCalledTimes(2);

          selectedTagsComponent.vm.$emit('click-tags', {
            tagName: selectedTags[2],
            event: new MouseEvent('click', { ctrlKey: true }),
          });

          expect(wrapper.vm.activeTags).toEqual([]);

          input = wrapper.find({ ref: 'input' });
          await wrapper.vm.$nextTick();
          // When there aren't activeTags anymore, focus goes to the input
          expect(document.activeElement).toBe(input.element);
        });
      });
    });
  });
});
