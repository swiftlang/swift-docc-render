<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
/**
 * A generic component to use for animating heights from 0 to auto.
 * To be used to wrap components that are hidden via `v-if`.
 * It sets a default animation on height only,
 * which that can be overridden by just defining new transition timings.
 *
 * @example
 * <TransitionExpand>
 *   <dropdown-content v-if="isVisible" />
 * </TransitionExpand>
 */
export default {
  name: 'TransitionExpand',
  functional: true,
  render(createElement, context) {
    const data = {
      props: {
        // transition name
        name: 'expand',
      },
      on: {
        // to be called after the transition ends
        afterEnter(element) {
          // return the element's height to `auto` after animation end
          // eslint-disable-next-line no-param-reassign
          element.style.height = 'auto';
        },
        enter(element) {
          // get the current width of the component
          const { width } = getComputedStyle(element);

          /* eslint-disable no-param-reassign */
          // set the element absolute and not visible for one frame, to take its proper height.
          element.style.width = width;
          element.style.position = 'absolute';
          element.style.visibility = 'hidden';
          element.style.height = 'auto';

          // get the height of the element
          const { height } = getComputedStyle(element);

          // revert back to normal, except setting it as hidden
          element.style.width = null;
          element.style.position = null;
          element.style.visibility = null;
          element.style.height = 0;

          // Force repaint to make sure the
          // animation is triggered correctly.
          // eslint-disable-next-line no-unused-expressions
          getComputedStyle(element).height;

          requestAnimationFrame(() => {
            // set a static height. This starts the animation
            element.style.height = height;
          });
        },
        leave(element) {
          const { height } = getComputedStyle(element);
          // set a static height before the collapsing animation starts
          element.style.height = height;
          // Force repaint to make sure the
          // animation is triggered correctly.
          // eslint-disable-next-line no-unused-expressions
          getComputedStyle(element).height;

          requestAnimationFrame(() => {
            // start hiding the component.
            element.style.height = 0;
          });
        },
      },
    };
    return createElement('transition', data, context.children);
  },
};
</script>
<style>
.expand-enter-active,
.expand-leave-active {
  /* transition the height for 0.3s */
  transition: height .3s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}
</style>
