/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  getSelectionText,
  isSingleCharacter,
  moveCursorToStart,
  moveCursorToEnd,
} from 'docc-render/utils/input-helper';
import { parseDataFromClipboard, prepareDataForHTMLClipboard } from 'docc-render/utils/clipboard';
import { insertAt } from 'docc-render/utils/strings';
import debounce from 'docc-render/utils/debounce';

const DebounceDelay = 280;
const VirtualKeyboardThreshold = 100;

export default {
  data() {
    return {
      keyboardIsVirtual: false,
      // tracks tags that are selected (for copy or delete)
      activeTags: [],
      initTagIndex: null,
      focusedTagIndex: null,
      metaKey: false,
      shiftKey: false,
      tabbing: false,
      debouncedHandleDeleteTag: null,
    };
  },
  constants: {
    DebounceDelay,
    VirtualKeyboardThreshold,
  },
  computed: {
    virtualKeyboardBind: ({ keyboardIsVirtual }) => ({ keyboardIsVirtual }),
    allSelectedTagsAreActive: ({ selectedTags, activeTags }) => (
      selectedTags.every(tag => activeTags.includes(tag))
    ),
  },
  methods: {
    selectRangeActiveTags(startIndex = this.focusedTagIndex, endIndex = this.selectedTags.length) {
      this.activeTags = this.selectedTags.slice(
        startIndex,
        endIndex,
      );
    },

    selectTag(tag) {
      this.updateSelectedTags([tag]);
      if (!this.clearFilterOnTagSelect) return;
      this.setFilterInput('');
    },

    unselectActiveTags() {
      if (this.activeTags.length) {
        this.deleteTags(this.activeTags);
        this.resetActiveTags();
      }
    },
    async deleteHandler(e) {
      if (this.activeTags.length > 0) {
        this.setSelectedTags(this.selectedTags.filter(tag => !this.activeTags.includes(tag)));
      }
      if (this.inputIsSelected() && this.allSelectedTagsAreActive) {
        // stop the default event, so it doesnt trigger the `@input` handler
        e.preventDefault();
        // reset the filters
        await this.resetFilters();
      } else if (this.$refs.input.selectionEnd === 0 && this.hasSelectedTags) {
        // stop the backspace from navigating back the page
        e.preventDefault();
        if (this.keyboardIsVirtual) {
          // Because mobile and tablet users don't usually have a displayed virtual keyboard
          // all the time, behaviour has been changed to allow a safer approach:
          // delete the last tag directly when the user clicks on the delete key
          this.setSelectedTags(this.selectedTags.slice(0, -1));
        } else {
          // Default behaviour for desktop users is to focus on the last tag and then
          // delete it when they click on the delete key while focused on the tag
          this.$refs.selectedTags.focusLast();
        }
      }

      this.unselectActiveTags();
    },
    leftKeyInputHandler(event) {
      this.assignEventValues(event);

      if (this.hasSelectedTags) {
        if (this.activeTags.length && !this.shiftKey) {
          // prevent the left key from deselecting text on the input
          event.preventDefault();
          // if there are activeTags and shift key has stopped,
          // focus the first tag from those activeTags
          this.$refs.selectedTags.focusTag(this.activeTags[0]);
          return;
        }

        // if user has shift key pressed and the cursor is on the start
        if (
          this.shiftKey
          && this.$refs.input.selectionStart === 0
        ) {
          // selectionDirection !== 'forward' means that user is moving from input to tags
          if (this.$refs.input.selectionDirection !== 'forward') {
            // init focusedTagIndex as the last tag in selectedTags
            if (this.focusedTagIndex === null) {
              this.focusedTagIndex = this.selectedTags.length;
            }
            // move focusedTagIndex index one to the left
            if (this.focusedTagIndex > 0) {
              this.focusedTagIndex -= 1;
            }

            this.initTagIndex = this.selectedTags.length;
            this.selectTagsPressingShift();
            return;
          }
        }

        if (this.$refs.input.selectionEnd === 0 || this.inputIsSelected()) {
          // go to the last tag when the cursor is on the beginning of the input
          // or the whole input is selected
          this.$refs.selectedTags.focusLast();
        }
      }
    },

    rightKeyInputHandler(event) {
      this.assignEventValues(event);

      if (this.activeTags.length) {
        // If shift key is pressed and user focus is coming from a tag
        if (this.shiftKey && this.focusedTagIndex < this.selectedTags.length) {
          // when there is a init tag, keep it active
          if (this.initTagIndex < this.selectedTags.length) {
            this.selectRangeActiveTags(this.initTagIndex, this.focusedTagIndex + 1);
            return;
          }
          // prevent the right key from deselecting text on the input
          event.preventDefault();
          // move focusedTagIndex index one to the right
          this.focusedTagIndex += 1;
          // select range between focusedTagIndex index and end of tags
          this.selectRangeActiveTags();
        }
      }
    },
    /**
     * Handles hitting `Enter` key when in the input.
     */
    async enterHandler() {
      // on Enter, move the blur the input. It will hide the suggested tags automatically.
      this.$refs.input.blur();
    },
    /**
     * Handles arbitrary keydown cases for the input
     */
    inputKeydownHandler(event) {
      const { key } = event;

      if (this.inputIsSelected()) {
        // Reset the filters when a character is typed,
        // if the entire input is selected, but not the tags
        if (isSingleCharacter(key) && this.allSelectedTagsAreActive) {
          this.resetFilters();
        }
      }
      this.multipleTagsSelectionHandler({ event, tagName: '' });
    },

    /**
     * Handles arbitrary keydown cases for the selected tags
     */
    selectedTagsKeydownHandler({ event, tagName }) {
      // Prevent click from being fired when pressing Enter key
      if (event.key === 'Enter') {
        event.preventDefault();
      }
      this.multipleTagsSelectionHandler({ event, tagName });
    },

    /**
     * Select exact input text from input to tags
     */
    selectInputTextToTags() {
      const { input } = this.$refs;

      // If user hasn't selected a partial text,
      // select all the text from the cursor to the beginning of the text
      if (input.selectionStart === input.selectionEnd) {
        input.setSelectionRange(0, input.selectionEnd);
      } else {
        input.setSelectionRange(input.selectionStart, input.selectionEnd);
      }
      // We need to focus the input to get the selected text visible
      this.focusInput();
    },

    /**
     * Select range of tags using the shiftKey
     */
    selectTagsPressingShift() {
      // If the user has selected a tag to init the shift selection
      if (this.initTagIndex !== null) {
        if (this.shiftKey && !this.metaKey) {
          // Select the whole range between the init tag index and the focused tag index
          // Comparing initTagIndex and focusedTagIndex to know which direction the slice
          // function has
          if (this.initTagIndex < this.focusedTagIndex) {
            this.selectRangeActiveTags(this.initTagIndex, this.focusedTagIndex + 1);
          } else {
            this.selectRangeActiveTags(this.focusedTagIndex, this.initTagIndex + 1);
          }
        }
      }
    },

    /**
     * Handler when the user focus on a tag
     */
    focusTagHandler({ event = {}, tagName }) {
      // Update focusedTagIndex with the current value
      this.focusedTagIndex = this.selectedTags.indexOf(tagName);

      // relatedTarget tells from where the focus element comes from
      const target = event.relatedTarget;
      // If user clicks on a tag after being focus on the input
      if (
        target
        // TODO: Might need to make it match the exact input, not any generic input
        && target.matches('input')
        && this.shiftKey
        && !this.metaKey
        && !this.tabbing
        && this.$refs.input.selectionEnd !== 0
      ) {
        // We select from the exact input text to the tags
        this.selectInputTextToTags();
        // We select the tags
        this.selectRangeActiveTags();
        return;
      }

      // We select range of tags using the shiftKey on focus so it works for
      // mouse and keyboard focus
      this.selectTagsPressingShift();
    },

    /**
     * Focus on the input coming from the tags
     */
    focusInputFromTags() {
      // move the cursor to the start when focusing the input from tags
      this.focusInput();
      moveCursorToStart(this.$refs.input);
    },

    /**
     * Select whole range from the initTag to the beginning or end of the tags
     */
    selectToDirections(key) {
      if (this.metaKey && this.shiftKey) {
        if (key === 'ArrowRight') {
          // Select all from cursor to end of the tags
          this.selectRangeActiveTags(this.initTagIndex, this.selectedTags.length);

          if (this.input.length) {
            this.$refs.input.select();
          } else {
            // Focus tag at the end of the tags
            this.$refs.selectedTags.focusTag(this.selectedTags[this.selectedTags.length - 1]);
          }
        } else if (key === 'ArrowLeft') {
          // Select all from cursor to beginning of the tags
          this.selectRangeActiveTags(0, this.initTagIndex + 1);

          if (!this.input.length) {
            // Focus tag at the beginning of the tags
            this.$refs.selectedTags.focusTag(this.selectedTags[0]);
          }
        }
      }
    },

    /**
     * Select and unselect tags using the metaKey only for mouse events
     */
    metaKeyClickSelection(event, tagName) {
      if (this.metaKey && event instanceof MouseEvent) {
        // If a user clicks with the mouse holding the meta key
        if (this.activeTags.includes(tagName)) {
          // deletes a tag when it's included in the active tags
          this.activeTags.splice(this.activeTags.indexOf(tagName), 1);

          // Remove focus from tag and focus first active tag or input depending on
          // if there are active tags or not
          if (this.activeTags.length) {
            this.$refs.selectedTags.focusTag(this.activeTags[0]);
          } else {
            this.focusInput();
          }
        } else {
          // If a tag is not included in the active tags we should add it to the active tags
          this.activeTags.push(tagName);
        }
      }
    },

    /**
     * Assign event values to update metaKey and shiftKey data values with current ones
     */
    assignEventValues(event = {}) {
      const {
        shiftKey = false, metaKey = false, ctrlKey = false, key,
      } = event;
      this.tabbing = key === 'Tab';
      this.metaKey = metaKey || ctrlKey;
      this.shiftKey = shiftKey;
    },

    /**
     * Init tag
     */
    initTag(tagName) {
      if (
        this.initTagIndex === null
        && !this.activeTags.includes(tagName)
      ) {
        if (tagName) {
          // Init the shift key when the user click on the shift key for the first time
          this.initTagIndex = this.selectedTags.indexOf(tagName);
          // Add the init shift key to the active tags
          this.activeTags.push(tagName);
        } else {
          // When selecting from the input value there isn't shift init tag
          // so we take the total selected tags length
          this.initTagIndex = this.selectedTags.length;
        }
      }
    },

    multipleTagsSelectionHandler({ event = new KeyboardEvent('keydown', {}), tagName }) {
      const { key = '' } = event;

      // Prevent function to run when pressing the Enter key
      if (key === 'Enter') return;

      this.assignEventValues(event);

      if ((this.shiftKey || this.metaKey) && !this.tabbing) {
        // Init tag when shift key or meta key are pressed
        this.initTag(tagName);
      } else if (key !== 'Backspace') {
        // Reset the shift selected tags when user clicks in any key unless
        // using the shift, meta or delete key
        this.resetActiveTags();
      }

      this.selectToDirections(key);
    },

    resetActiveTags() {
      this.activeTags = [];
      this.initTagIndex = null;
      this.metaKey = false;
      this.tabbing = false;
      this.shiftKey = false;
      this.focusedTagIndex = null;
    },

    selectInputAndTags() {
      this.activeTags = [...this.selectedTags];

      if (this.input.length) {
        this.$refs.input.select();
        // set init tag as if shift key would have been triggered from input
        this.initTagIndex = this.activeTags.length;
        // set focused tag index to 0 keeping the real focus on the input
        this.focusedTagIndex = 0;
      } else if (this.activeTags.length) {
        // set init tag on the last tag from the selected tags
        this.initTagIndex = this.activeTags.length - 1;
        // focus on the first tag
        this.$refs.selectedTags.focusTag(this.activeTags[0]);
      }
    },
    /**
     * Handles clicking or hitting enter on a focused tag.
     * @param {Event} value
     */
    handleSingleTagClick({ event, tagName }) {
      if (this.keyboardIsVirtual) {
        // init debounce function
        if (!this.debouncedHandleDeleteTag) {
          this.debouncedHandleDeleteTag = debounce(this.handleDeleteTag, DebounceDelay);
        }
        // remove the tag if it's on mobile
        // and prevent handleDeleteTag to be called too fast
        this.debouncedHandleDeleteTag({ tagName, event });
      } else {
        this.assignEventValues(event);
        this.metaKeyClickSelection(event, tagName);
        this.multipleTagsSelectionHandler({ event, tagName });
      }
    },
    /**
     * Returns whether the entire input text is selected
     * @returns {boolean}
     */
    inputIsSelected() {
      return this.input.length && getSelectionText() === this.input;
    },
    /**
     * Return whether the input has a partial seleced
     * @returns {boolean}
     */
    inputHasPartialTextSelected() {
      const selectedText = getSelectionText();
      // make sure its not a full match
      return !this.inputIsSelected()
        // make sure we at least have some selected
        && selectedText.length
        // make sure the input includes what is currently selected
        && this.input.includes(selectedText);
    },
    /**
     * Debounced `window.visualViewport@resize` callback.
     * Difference beyond `VirtualKeyboardThreshold` considers a virtual keyboard is being displayed.
     */
    updateKeyboardType: debounce(function updateKeyboardTypeDebounced(event) {
      // Calculate the difference between the total window height and
      // window height without virtual keyboard
      const heightDifference = window.innerHeight - event.target.height;

      // If the height difference is bigger than 100, it means that a virtual keyboard
      // has been displayed. 100px is the minimum height to consider a virtual keyboard.
      if (heightDifference >= VirtualKeyboardThreshold) {
        this.keyboardIsVirtual = true;
      }
    }, DebounceDelay),
    setFilterInput(value) {
      this.$emit('update:input', value);
    },
    setSelectedTags(tags) {
      this.$emit('update:selectedTags', tags);
    },
    /**
     * Appends provided tags to the already existing tags.
     * Removes duplicates.
     * @param {string[]} tags
     */
    updateSelectedTags(tags) {
      this.setSelectedTags([...new Set([...this.selectedTags, ...tags])]);
    },
    /**
     * Handles Copy-ing from the input or Selected tags
     * @param {ClipboardEvent} event
     * @returns {{ input: string, tags string[] }}
     */
    handleCopy(event) {
      event.preventDefault();
      // plain text payload
      const copyBuffer = [];
      // JSON payload
      const copyJSONBuffer = {
        tags: [],
        input: getSelectionText(),
      };

      if (this.activeTags.length) {
        const tagsToCopy = this.activeTags;
        copyJSONBuffer.tags = tagsToCopy;
        copyBuffer.push(tagsToCopy.join(' '));
      }

      // prepare plain text copy payload.
      copyBuffer.push(copyJSONBuffer.input);
      // if we have no tags or input selected, dont proceed with copy command
      if (!copyJSONBuffer.tags.length && !copyJSONBuffer.input.length) return copyJSONBuffer;
      // save data as JSON in clipboard, for easy retrieval.
      event.clipboardData.setData('text/html', prepareDataForHTMLClipboard(copyJSONBuffer));
      // fill in plain text payload
      event.clipboardData.setData('text/plain', copyBuffer.join(' '));

      return copyJSONBuffer;
    },
    /**
     * Handles cutting action from the input
     * @param {ClipboardEvent} event
     */
    handleCut(event) {
      event.preventDefault();
      const { input, tags } = this.handleCopy(event);
      // dont overwrite the content, if nothing is copied
      if (!input && !tags.length) return;
      // remove what is copied from the selection and input
      const remainingTags = this.selectedTags.filter(tag => !tags.includes(tag));
      const remainingInput = this.input.replace(input, '');
      // set the leftover content
      this.setSelectedTags(remainingTags);
      this.setFilterInput(remainingInput);
    },
    /**
     * Handles pasting into the input
     * @param {ClipboardEvent} event
     */
    handlePaste(event) {
      event.preventDefault();
      const { types } = event.clipboardData;
      let tags = [];
      let input = event.clipboardData.getData('text/plain');
      // try to get the data from `text/html` content
      if (types.includes('text/html')) {
        const pasteBuffer = event.clipboardData.getData('text/html');
        const data = parseDataFromClipboard(pasteBuffer);
        // if there is match, get the `tags` and `input` from the JSON data
        if (data) {
          ({ tags = [], input = '' } = data);
        }
      }
      const selection = getSelectionText();
      // if we have selected parts of the input, we need to replace it.
      // this works if you have selected all as well.
      if (selection.length) {
        input = this.input.replace(selection, input);
      } else {
        // inject the new text there hte cursor is currently at.
        input = insertAt(this.input, input, document.activeElement.selectionStart);
      }

      this.setFilterInput(input.trim());
      if (this.allSelectedTagsAreActive) {
        this.setSelectedTags(tags);
      } else {
        this.updateSelectedTags(tags);
      }
      this.resetActiveTags();
    },
    /**
     * Handles deleting a tag
     * @param {string} tag
     * @returns {Promise<void>}
     */
    async handleDeleteTag({ tagName, event = {} }) {
      const { key } = event;

      if (!this.activeTags.length) {
        this.deleteTags([tagName]);
      }

      this.unselectActiveTags();

      // await the parent to update the list
      await this.$nextTick();
      moveCursorToEnd(this.$refs.input);
      // Move cursor position to the beginning of the input field when deleting a selected tag.
      // The default browser behavior is to move the cursor to the end of the input field, which
      // is not what we want.
      if (this.hasSelectedTags) {
        await this.focusInput();

        if (key === 'Backspace') {
          moveCursorToStart(this.$refs.input);
        }
      }
    },
  },
  mounted() {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateKeyboardType);
      this.$once('hook:beforeDestroy', () => {
        window.visualViewport.removeEventListener('resize', this.updateKeyboardType);
      });
    }
  },
};
