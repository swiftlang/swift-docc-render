/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TopicStore from 'docc-render/stores/TopicStore';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';

const { BreakpointName } = BreakpointEmitter.constants;

describe('TopicStore', () => {
  beforeEach(() => {
    TopicStore.reset();
  });

  it('has a default state', () => {
    expect(TopicStore.state).toEqual({
      linkableSections: [],
      breakpoint: BreakpointName.large,
    });
  });

  it('resets all the state properties', () => {
    TopicStore.addLinkableSection({
      anchor: 'foo',
      title: 'Foo',
    });

    TopicStore.updateBreakpoint('my breakpoint');

    TopicStore.reset();

    expect(TopicStore.state).toEqual({
      linkableSections: [],
      breakpoint: BreakpointName.large,
    });
  });

  describe('addLinkableSection', () => {
    beforeEach(() => {
      TopicStore.addLinkableSection({
        anchor: 'foo',
        title: 'Foo',
      });
      TopicStore.addLinkableSection({
        anchor: 'bar',
        title: 'Bar',
      });
      TopicStore.addLinkableSection({
        anchor: 'baz',
        title: 'Baz',
      });
    });

    it('adds a section to `linkableSections` with default visibility', () => {
      expect(TopicStore.state.linkableSections).toEqual([
        {
          anchor: 'foo',
          sectionNumber: 0,
          title: 'Foo',
          visibility: 0,
        },
        {
          anchor: 'bar',
          sectionNumber: 1,
          title: 'Bar',
          visibility: 0,
        },
        {
          anchor: 'baz',
          sectionNumber: 2,
          title: 'Baz',
          visibility: 0,
        },
      ]);
    });

    describe('updateLinkableSection', () => {
      beforeEach(() => {
        TopicStore.updateLinkableSection({
          anchor: 'foo',
          visibility: 0.42,
        });
      });

      it('updates the visibility of the section with the given anchor', () => {
        expect(TopicStore.state.linkableSections).toEqual([
          {
            anchor: 'foo',
            sectionNumber: 0,
            title: 'Foo',
            visibility: 0.42,
          },
          {
            anchor: 'bar',
            sectionNumber: 1,
            title: 'Bar',
            visibility: 0,
          },
          {
            anchor: 'baz',
            sectionNumber: 2,
            title: 'Baz',
            visibility: 0,
          },
        ]);
      });
    });
  });
});
