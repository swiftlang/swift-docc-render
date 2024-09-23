/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import IndexStore from 'docc-render/stores/IndexStore';
import Language from 'docc-render/constants/Language';

const flatChildren = {
  [Language.swift.key.url]: [
    {
      title: 'item 1',
    },
  ],
  [Language.objectiveC.key.url]: [
    {
      title: 'item 2',
    },
  ],
};

const references = {
  foo: { identifier: 'foo' },
  bar: { identifier: 'bar' },
};

const apiChanges = {
  interfaceLanguages: {
    [Language.swift.key.url]: [],
  },
};

const includedArchiveIdentifiers = ['foo', 'bar'];

const technologyProps = {
  [Language.swift.key.url]: {
    technology: 'title',
    technologyPath: 'path',
    isTechnologyBeta: false,
  },
};

describe('IndexStore', () => {
  const defaultState = {
    flatChildren: null,
    references: {},
    apiChanges: null,
    includedArchiveIdentifiers: [],
    errorFetching: false,
    technologyProps: {},
  };

  beforeEach(() => {
    localStorage.clear();
    IndexStore.reset();
  });

  it('has a default state', () => {
    expect(IndexStore.state).toEqual(defaultState);
  });

  describe('reset', () => {
    it('restores the default state', () => {
      IndexStore.state.flatChildren = flatChildren;
      IndexStore.state.references = references;
      IndexStore.state.apiChanges = apiChanges;
      IndexStore.state.includedArchiveIdentifiers = includedArchiveIdentifiers;
      IndexStore.state.errorFetching = true;
      IndexStore.state.technologyProps = technologyProps;

      expect(IndexStore.state).not.toEqual(defaultState);
      IndexStore.reset();
      // assert all the state is reset
      expect(IndexStore.state).toEqual(defaultState);
    });
  });

  it('sets `flatChildren`', () => {
    IndexStore.setFlatChildren(flatChildren);
    expect(IndexStore.state.flatChildren).toEqual(flatChildren);
  });

  it('sets `references`', () => {
    IndexStore.setReferences(references);
    expect(IndexStore.state.references).toEqual(references);
  });

  it('sets `apiChanges`', () => {
    IndexStore.setApiChanges(apiChanges);
    expect(IndexStore.state.apiChanges).toEqual(apiChanges);
  });

  it('sets `includedArchiveIdentifiers`', () => {
    IndexStore.setIncludedArchiveIdentifiers(includedArchiveIdentifiers);
    expect(IndexStore.state.includedArchiveIdentifiers).toEqual(includedArchiveIdentifiers);
  });

  it('sets `errorFetching`', () => {
    IndexStore.setErrorFetching(true);
    expect(IndexStore.state.errorFetching).toEqual(true);
  });

  it('sets `technologyProps`', () => {
    IndexStore.setTechnologyProps(technologyProps);
    expect(IndexStore.state.technologyProps).toEqual(technologyProps);
  });
});
