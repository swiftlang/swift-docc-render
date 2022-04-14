/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ApiChangesStoreBase, { apiChangesCountsFactory } from 'docc-render/stores/ApiChangesStoreBase';

describe('ApiChangesStoreBase', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  it('sets api changes', () => {
    const changes = {
      foo: 'foo',
    };
    ApiChangesStoreBase.setAPIChanges(changes);
    expect(ApiChangesStoreBase.state.apiChanges).toEqual(changes);
  });

  it('sets the selected API changes version', () => {
    ApiChangesStoreBase.setSelectedAPIChangesVersion('latest_major');
    expect(ApiChangesStoreBase.state.selectedAPIChangesVersion).toEqual('latest_major');
  });

  it('updates `apiChangesCounts`', async () => {
    const querySpy = jest.spyOn(document, 'querySelectorAll');

    querySpy.mockReturnValueOnce({ length: 1 });
    querySpy.mockReturnValueOnce({ length: 2 });
    querySpy.mockReturnValueOnce({ length: 3 });

    await ApiChangesStoreBase.updateApiChangesCounts();

    expect(ApiChangesStoreBase.state.apiChangesCounts).toEqual({
      modified: 1,
      added: 2,
      deprecated: 3,
    });
  });

  it('resets API Changes', () => {
    const defaultCounts = apiChangesCountsFactory();
    ApiChangesStoreBase.state.apiChangesCounts.modified = 5;
    ApiChangesStoreBase.state.selectedAPIChangesVersion = 'latest_major';
    expect(ApiChangesStoreBase.state.apiChangesCounts).toHaveProperty('modified', 5);
    ApiChangesStoreBase.resetApiChanges();
    expect(ApiChangesStoreBase.state.apiChangesCounts).toEqual(defaultCounts);
    // assert `selectedAPIChangesVersion` not changed
    expect(ApiChangesStoreBase.state.selectedAPIChangesVersion).toEqual('latest_major');
    expect(ApiChangesStoreBase.state.apiChanges).toEqual(null);
  });
});
