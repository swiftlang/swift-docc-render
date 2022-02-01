<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
import {
  BreakpointAttributes,
  BreakpointName,
  BreakpointScopes,
} from 'docc-render/utils/breakpoints';

const maxQuery = maxWidth => (maxWidth ? `(max-width: ${maxWidth}px)` : '');
const minQuery = minWidth => (minWidth ? `(min-width: ${minWidth}px)` : '');

export function createMediaQueryString({ minWidth, maxWidth }) {
  return ['only screen', minQuery(minWidth), maxQuery(maxWidth)]
    .filter(Boolean)
    .join(' and ');
}

function breakpointMediaQuery({ maxWidth, minWidth }) {
  return window.matchMedia(createMediaQueryString({ minWidth, maxWidth }));
}

export default {
  name: 'BreakpointEmitter',
  constants: {
    BreakpointAttributes,
    BreakpointName,
    BreakpointScopes,
  },
  props: {
    scope: {
      type: String,
      default: () => BreakpointScopes.default,
      validator: v => v in BreakpointScopes,
    },
  },
  render() {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({ matchingBreakpoint: this.matchingBreakpoint });
    }
    return null;
  },
  data: () => ({
    matchingBreakpoint: null,
  }),
  methods: {
    initMediaQuery(breakpointName, breakpoints) {
      // get the query
      const query = breakpointMediaQuery(breakpoints);
      // save a reference to a callback
      const changeHandler = event => this.handleMediaQueryChange(event, breakpointName);
      // init listener. Use the deprecated method as `addEventListener` is not supported by Safari
      query.addListener(changeHandler);
      this.$once('hook:beforeDestroy', () => {
        query.removeListener(changeHandler);
      });
      // invoke the handler
      changeHandler(query);
    },
    handleMediaQueryChange(event, breakpointName) {
      if (!event.matches) return;
      this.matchingBreakpoint = breakpointName;
      this.$emit('change', breakpointName);
    },
  },
  mounted() {
    const breakpoints = BreakpointAttributes[this.scope] || {};

    Object.entries(breakpoints).forEach(([breakpointName, breakpointValues]) => {
      this.initMediaQuery(breakpointName, breakpointValues);
    });
  },
};
</script>
