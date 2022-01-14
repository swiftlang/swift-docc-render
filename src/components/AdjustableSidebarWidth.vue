<template>
  <div class="adjustable-sidebar-width">
    <div
      v-if="!hideSidebar"
      ref="aside"
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

export const STORAGE_KEY = 'sidebar-width';

const eventsMap = {
  touch: {
    move: 'touchmove',
    end: 'touchend',
  },
  mouse: {
    move: 'mousemove',
    end: 'mouseup',
  },
};
export default {
  name: 'AdjustableSidebarWidth',
  props: {
    storageKey: {
      type: String,
      default: STORAGE_KEY,
    },
    openExternally: {
      type: Boolean,
      default: false,
    },
    minWidth: {
      type: Number,
      default: () => 0,
    },
    hideSidebar: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isDragging: false,
      width: Math.min(storage.get(this.storageKey, this.minWidth), window.innerWidth),
      isTouch: false,
    };
  },
  computed: {
    widthInPx: ({ width }) => `${width}px`,
    isMaxWidth: ({ width }) => width === window.innerWidth,
    events: ({ isTouch }) => (isTouch ? eventsMap.touch : eventsMap.mouse),
  },
  methods: {
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
      const { aside } = this.$refs;
      const clientX = this.isTouch ? e.touches[0].clientX : e.clientX;
      let newWidth = (clientX - aside.offsetLeft);
      if (this.width > newWidth && newWidth < 200) {
        // TODO: implement snapping to close if too narrow
        // this.width = 0;
        // this.stopDrag(e);
        // return;
      }
      // prevent going outside of the window zone
      if (newWidth > window.innerWidth) {
        newWidth = window.innerWidth;
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
      storage.set(this.storageKey, this.width);
      document.removeEventListener(this.events.move, this.handleDrag);
      document.removeEventListener(this.events.end, this.stopDrag);
      // emit the width, in case the debounce muted the last change
      this.emitEventChange(this.width);
    },
    emitEventChange(width) {
      this.$emit('width-change', width);
    },
  },
  watch: {
    width: {
      immediate: true,
      handler: debounce(function widthHandler(value) {
        this.emitEventChange(value);
      }, 250, true, true),
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
    position: absolute;
    z-index: 1;
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
