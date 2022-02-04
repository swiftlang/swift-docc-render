<template>
  <div class="adjustable-sidebar-width">
    <div
      v-if="!hideSidebar"
      ref="sidebar"
      class="sidebar"
      :class="{ 'fully-closed': !width, 'fully-open': isMaxWidth }"
    >
      <div
        :class="{ dragging: isDragging, 'force-open': openExternally }"
        :style="{ width: widthInPx }"
        class="aside"
      >
        <slot name="aside" />
      </div>
      <div
        class="resize-handle"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
      />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
import { storage } from 'docc-render/utils/storage';
import debounce from 'docc-render/utils/debounce';
import { waitFrames } from '@/utils/loading';

export const STORAGE_KEY = 'sidebar';

export const eventsMap = {
  touch: {
    move: 'touchmove',
    end: 'touchend',
  },
  mouse: {
    move: 'mousemove',
    end: 'mouseup',
  },
};

const calcWidthPercent = (percent, windowWidth = window.innerWidth) => Math.floor(Math.min(
  windowWidth * (percent / 100),
  windowWidth,
));

export default {
  name: 'AdjustableSidebarWidth',
  props: {
    openExternally: {
      type: Boolean,
      default: false,
    },
    minWidthPercent: {
      type: Number,
      default: () => 0,
    },
    maxWidthPercent: {
      type: Number,
      default: 80,
    },
    hideSidebar: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // computed is not ready yet in `data`.
    return {
      isDragging: false,
      width: Math.min(
        storage.get(STORAGE_KEY, calcWidthPercent(this.minWidthPercent)),
        calcWidthPercent(this.maxWidthPercent),
      ),
      isTouch: false,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    absoluteMaxWidth: ({ maxWidthPercent, windowWidth }) => (
      calcWidthPercent(maxWidthPercent, windowWidth)
    ),
    minWidth: ({ minWidthPercent, windowWidth }) => calcWidthPercent(minWidthPercent, windowWidth),
    widthInPx: ({ width }) => `${width}px`,
    isMaxWidth: ({ width, absoluteMaxWidth }) => width === absoluteMaxWidth,
    events: ({ isTouch }) => (isTouch ? eventsMap.touch : eventsMap.mouse),
  },
  mounted() {
    window.addEventListener('keydown', this.onEscapeClick);
    window.addEventListener('resize', this.storeWindowSize);
    window.addEventListener('orientationchange', this.storeWindowSize);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('keydown', this.onEscapeClick);
      window.removeEventListener('resize', this.storeWindowSize);
      window.removeEventListener('orientationchange', this.storeWindowSize);
    });
  },
  watch: {
    // make sure a route navigation closes the sidebar
    $route: 'closeMobileSidebar',
    width: {
      immediate: true,
      handler: debounce(function widthHandler(value) {
        this.emitEventChange(value);
      }, 250, true, true),
    },
    windowWidth() {
      // make sure sidebar is never wider than the windowWidth
      if (this.width > this.absoluteMaxWidth) {
        this.width = this.absoluteMaxWidth;
      } else if (this.width < this.minWidth) {
        this.width = this.minWidth;
      }
    },
  },
  methods: {
    onEscapeClick({ key }) {
      if (key === 'Escape') this.closeMobileSidebar();
    },
    async storeWindowSize() {
      await this.$nextTick();
      this.windowWidth = window.innerWidth;
    },
    closeMobileSidebar() {
      if (!this.openExternally) return;
      this.$emit('update:openExternally', false);
    },
    startDrag({ type }) {
      this.isTouch = type === 'touchstart';
      if (this.isDragging) return;
      this.isDragging = true;
      document.addEventListener(this.events.move, this.handleDrag);
      document.addEventListener(this.events.end, this.stopDrag);
    },
    /**
     * Handle dragging the resize element
     * @param {MouseEvent|TouchEvent} e
     */
    handleDrag(e) {
      e.preventDefault();
      // we don't want to do anything if we aren't resizing.
      if (!this.isDragging) return;
      const { sidebar } = this.$refs;
      const clientX = this.isTouch ? e.touches[0].clientX : e.clientX;
      let newWidth = (clientX - sidebar.offsetLeft);
      // prevent going outside of the window zone
      if (newWidth > this.absoluteMaxWidth) {
        newWidth = this.absoluteMaxWidth;
      }
      // prevent from shrinking too much
      this.width = Math.max(newWidth, this.minWidth);
    },
    /**
     * Stop the dragging upon mouse up
     * @param {MouseEvent} e
     */
    stopDrag(e) {
      e.preventDefault();
      if (!this.isDragging) return;
      this.isDragging = false;
      storage.set(STORAGE_KEY, this.width);
      document.removeEventListener(this.events.move, this.handleDrag);
      document.removeEventListener(this.events.end, this.stopDrag);
      // emit the width, in case the debounce muted the last change
      this.emitEventChange(this.width);
    },
    emitEventChange(width) {
      this.$emit('width-change', width);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.adjustable-sidebar-width {
  display: flex;
  @include breakpoint(small) {
    display: block;
    position: relative;
  }
}

.sidebar {
  position: relative;
  @include breakpoint(small) {
    position: static;
  }
}

.aside {
  width: 250px;
  position: relative;
  height: 100%;
  max-width: 100vw;

  @include breakpoint(small) {
    width: 0 !important;
    min-width: 0;
    max-width: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 9999;
    transform: translateX(-100px);
    transition: width 0.15s linear, transform 0.15s ease-in;

    &.force-open {
      width: 100% !important;
      transform: translateX(0);
    }
  }
}

.content {
  display: flex;
  flex-flow: column;
  min-width: 0;
  flex: 1 1 auto;
  height: 100%;
}

.resize-handle {
  position: absolute;
  cursor: col-resize;
  top: 0;
  bottom: 0;
  right: 0;
  width: 5px;
  height: 100%;
  user-select: none;
  z-index: 1;
  transition: background-color .15s;
  transform: translateX(50%);

  .fully-closed &, .fully-open & {
    width: 10px;
  }

  @include breakpoint(small) {
    display: none;
  }

  &:hover {
    background: var(--color-fill-gray-tertiary);
  }
}
</style>
