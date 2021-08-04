/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TutorialsOverviewStore from 'docc-render/stores/TutorialsOverviewStore';

describe('TutorialsOverviewStore', () => {
  it('has a default state', () => {
    expect(TutorialsOverviewStore.state).toEqual({
      activeTutorialLink: null,
      activeVolume: null,
    });
  });

  describe('reset', () => {
    it('restores the default state', () => {
      TutorialsOverviewStore.state.activeTutorialLink = 'foobar';
      TutorialsOverviewStore.state.activeVolume = 'foobar';
      TutorialsOverviewStore.reset();
      expect(TutorialsOverviewStore.state).toEqual({
        activeTutorialLink: null,
        activeVolume: null,
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
});
