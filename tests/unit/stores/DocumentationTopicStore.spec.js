/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import ApiChangesStoreBase from 'docc-render/stores/ApiChangesStoreBase';
import OnThisPageSectionsStoreBase from 'docc-render/stores/OnThisPageSectionsStoreBase';

describe('DocumentationTopicStore', () => {
  const defaultState = {
    preferredLanguage: null,
    contentWidth: 0,
    ...ApiChangesStoreBase.state,
    ...OnThisPageSectionsStoreBase.state,
  };

  beforeEach(() => {
    localStorage.clear();
    DocumentationTopicStore.reset();
    // force reset the api changes
    DocumentationTopicStore.setAPIChanges(null);
    DocumentationTopicStore.state.contentWidth = 0;
  });

  it('has a default state', () => {
    expect(DocumentationTopicStore.state).toEqual(defaultState);
  });

  describe('reset', () => {
    it('restores the default state', () => {
      DocumentationTopicStore.state.apiChanges = {};
      expect(DocumentationTopicStore.state).not.toEqual(defaultState);
      DocumentationTopicStore.reset();
      // assert all the state is reset
      expect(DocumentationTopicStore.state).toEqual(defaultState);
    });
  });

  describe('addOnThisPageSection', () => {
    it('adds an item to the `onThisPageSections` state', () => {
      DocumentationTopicStore.addOnThisPageSection({
        anchor: 'foo',
        title: 'Foo',
      });
      expect(DocumentationTopicStore.state).toEqual({
        ...defaultState,
        onThisPageSections: [
          {
            anchor: 'foo',
            title: 'Foo',
          },
        ],
      });
      DocumentationTopicStore.addOnThisPageSection({
        anchor: 'bar',
        title: 'Bar',
      });
      expect(DocumentationTopicStore.state).toEqual({
        ...defaultState,
        onThisPageSections: [
          {
            anchor: 'foo',
            title: 'Foo',
          },
          {
            anchor: 'bar',
            title: 'Bar',
          },
        ],
      });
    });
  });

  describe('setPreferredLanguage', () => {
    it('sets the `preferredLanguage` state', () => {
      DocumentationTopicStore.setPreferredLanguage('objc');
      expect(DocumentationTopicStore.state.preferredLanguage).toBe('objc');
    });
  });

  it('sets the content width', () => {
    DocumentationTopicStore.setContentWidth(99);
    expect(DocumentationTopicStore.state.contentWidth).toBe(99);
  });

  describe('APIChanges', () => {
    it('sets the API changes', () => {
      const apiChanges = { foo: 'bar' };

      DocumentationTopicStore.setAPIChanges(apiChanges);

      expect(DocumentationTopicStore.state).toEqual({
        ...defaultState,
        apiChanges,
      });
    });

    it('updates API changes counts', async () => {
      const spy = jest.spyOn(document, 'querySelectorAll');
      await DocumentationTopicStore.updateApiChangesCounts();
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, '.changed-modified:not(.changed-total)');
      expect(spy).toHaveBeenNthCalledWith(2, '.changed-added:not(.changed-total)');
      expect(spy).toHaveBeenNthCalledWith(3, '.changed-deprecated:not(.changed-total)');
      jest.restoreAllMocks();
    });

    it('resets API changes counts', () => {
      DocumentationTopicStore.state.apiChangesCounts.modified = 5;
      DocumentationTopicStore.state.apiChangesCounts.added = 5;

      expect(DocumentationTopicStore.state.apiChangesCounts)
        .not.toEqual(defaultState.apiChangesCounts);

      DocumentationTopicStore.resetApiChanges();
      expect(DocumentationTopicStore.state.apiChangesCounts)
        .toEqual(defaultState.apiChangesCounts);
      expect(DocumentationTopicStore.state.apiChanges)
        .toEqual(null);
    });
  });
});
