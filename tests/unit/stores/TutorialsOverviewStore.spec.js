/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { filterInactiveReferences } from 'docc-render/utils/references';
import TutorialsOverviewStore from 'docc-render/stores/TutorialsOverviewStore';

const references = {
  foo: { identifier: 'foo' },
  bar: { identifier: 'bar' },
};

describe('TutorialsOverviewStore', () => {
  it('has a default state', () => {
    expect(TutorialsOverviewStore.state).toEqual({
      activeTutorialLink: null,
      activeVolume: null,
      references: {},
    });
  });

  describe('reset', () => {
    it('restores the default state', () => {
      TutorialsOverviewStore.state.activeTutorialLink = 'foobar';
      TutorialsOverviewStore.state.activeVolume = 'foobar';
      TutorialsOverviewStore.state.references = references;
      TutorialsOverviewStore.reset();
      expect(TutorialsOverviewStore.state).toEqual({
        activeTutorialLink: null,
        activeVolume: null,
        references: {},
      });
    });
  });

  describe('setActiveSidebarLink', () => {
    it('sets the `activeTutorialLink` state', () => {
      TutorialsOverviewStore.setActiveSidebarLink('foobar');
      expect(TutorialsOverviewStore.state.activeTutorialLink).toBe('foobar');
    });
  });

  describe('setActiveVolume', () => {
    it('sets the `activeVolume` state', () => {
      TutorialsOverviewStore.setActiveVolume('foobar');
      expect(TutorialsOverviewStore.state.activeVolume).toBe('foobar');
    });
  });

  describe('setReferences', () => {
    it('sets the `references` state', () => {
      TutorialsOverviewStore.setReferences(references);
      expect(TutorialsOverviewStore.state.references)
        .toEqual(filterInactiveReferences(references));
    });
  });

  describe('updateReferences', () => {
    it('updates the current `references` state', () => {
      const prevState = TutorialsOverviewStore.state;
      TutorialsOverviewStore.updateReferences();
      expect(TutorialsOverviewStore.state.references)
        .toEqual(filterInactiveReferences(prevState.references));
    });
  });
});
