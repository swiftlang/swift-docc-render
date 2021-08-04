/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { ChangeNames } from 'docc-render/constants/Changes';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import { hasMultipleLines } from 'docc-render/utils/multipleLines';

const latestPrefix = 'latest_';

export const Platforms = {
  xcode: { value: 'xcode', label: 'Xcode' },
  other: { value: 'other', label: 'Other' },
};

// Calculates if apiChangesDiff element has multiple lines
export const APIChangesMultipleLines = {
  constants: { multipleLinesClass },
  data() {
    return {
      multipleLinesClass,
    };
  },
  computed: {
    hasMultipleLinesAfterAPIChanges: ({ change, changeType, $refs }) => {
      if (!change && !changeType) return false;

      return hasMultipleLines($refs.apiChangesDiff);
    },
  },
};

export const getAPIChanges = {
  methods: {
    toVersionRange({ platform, versions }) {
      return `${platform} ${versions[0]} – ${platform} ${versions[1]}`;
    },
    toOptionValue: scope => `${latestPrefix}${scope}`,
    toScope: optionValue => optionValue.slice(latestPrefix.length, optionValue.length),
    getOptionsForDiffAvailability(diffAvailability = {}) {
      return this.getOptionsForDiffAvailabilities([diffAvailability]);
    },
    getOptionsForDiffAvailabilities(diffAvailabilities = []) {
      // create a diff availability hash composed of lists of the availability
      // hash for each topic
      const allDiffAvailabilities = diffAvailabilities.reduce((memo, diffAvailability = {}) => (
        Object.keys(diffAvailability).reduce((result, key) => (
          { ...result, [key]: (result[key] || []).concat(diffAvailability[key]) }
        ), memo)
      ), {});

      const diffKeys = Object.keys(allDiffAvailabilities);

      // reduce each list into a single option for each key ("gm, "beta", etc),
      // preferring the "Xcode" platform when possible
      const diffAvailability = diffKeys.reduce((memo, key) => {
        const diffs = allDiffAvailabilities[key];
        return {
          ...memo,
          [key]: diffs.find(d => d.platform === Platforms.xcode.label) || diffs[0],
        };
      }, {});

      // create a list of value/label pairs for each item in the diff availability
      // with the preferred order of "sdk", "beta", "minor", "major", (any others)
      const toOption = key => ({
        label: this.toVersionRange(diffAvailability[key]),
        value: this.toOptionValue(key),
        platform: diffAvailability[key].platform,
      });
      const {
        sdk,
        beta,
        minor,
        major,
        ...others
      } = diffAvailability;
      const sortedOptions = []
        .concat(sdk ? toOption('sdk') : [])
        .concat(beta ? toOption('beta') : [])
        .concat(minor ? toOption('minor') : [])
        .concat(major ? toOption('major') : [])
        .concat(Object.keys(others).map(toOption));

      return this.splitOptionsPerPlatform(sortedOptions);
    },
    changesClassesFor(identifier, apiChanges) {
      const change = this.changeFor(identifier, apiChanges);
      return this.getChangesClasses(change);
    },
    getChangesClasses: change => ({
      [`changed changed-${change}`]: !!change,
    }),
    changeFor(identifier, apiChanges) {
      const { change } = (apiChanges || {})[identifier] || {};
      return change;
    },
    /**
     * Splits the array into an object with `xcode` items and `other`.
     * To be used when iterating over items in the select changes dropdowns
     * @param { Object[] } options
     * @returns {{ xcode: Object[], other: Object[] }}
     */
    splitOptionsPerPlatform(options) {
      return options.reduce((all, current) => {
        const platform = current.platform === Platforms.xcode.label
          ? Platforms.xcode.value
          : Platforms.other.value;

        all[platform].push(current);
        return all;
      }, { [Platforms.xcode.value]: [], [Platforms.other.value]: [] });
    },
    getChangeName(change) {
      return ChangeNames[change];
    },
  },
  computed: {
    availableOptions({ diffAvailability = {}, toOptionValue }) {
      return new Set(Object.keys(diffAvailability).map(toOptionValue));
    },
  },
};
