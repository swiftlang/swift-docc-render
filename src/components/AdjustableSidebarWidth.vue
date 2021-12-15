<template>
  <div class="adjustable-sidebar-width">
    <div
      ref="aside"
      class="sidebar"
    >
      <div
        :class="{ dragging: isDragging }"
        :style="{ width: widthInPx }"
        class="aside"
      >
        <slot name="aside" />
      </div>
      <div
        class="resize-handle"
        @mousedown.prevent="startDrag"
      />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
import { storage } from 'docc-render/utils/storage';

export const STORAGE_KEY = 'sidebar-width';

export default {
  name: 'AdjustableSidebarWidth',
  props: {
    storageKey: {
      type: String,
      default: STORAGE_KEY,
    },
  },
  data() {
    return {
      isDragging: false,
      width: storage.get(this.storageKey, null),
    };
  },
  computed: {
    widthInPx: ({ width }) => `${width}px`,
  },
  methods: {
    startDrag() {
      if (this.isDragging) return;
      this.isDragging = true;
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    handleDrag(e) {
      e.preventDefault();
      // we don't want to do anything if we aren't resizing.
      if (!this.isDragging) return;
      const { aside } = this.$refs;
      const newWidth = (e.clientX - aside.offsetLeft);
      if (this.width > newWidth && newWidth < 200) {
        // TODO: implement action to close the UI if its too narrow
        // this.width = 0;
        // this.stopDrag(e);
        // return;
      }
      this.width = newWidth;
    },
    stopDrag(e) {
      e.preventDefault();
      if (!this.isDragging) return;
      this.isDragging = false;
      storage.set(this.storageKey, this.width);
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.stopDrag);
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
  }
}

.sidebar {
  position: relative;
}

.aside {
  width: 250px;
  position: relative;
  overflow-x: hidden;

  @include breakpoint(small) {
    width: 100% !important;
    min-width: 0;
    max-width: 100%;
  }
}

.content {
  display: flex;
  flex-flow: column;
  min-width: 0;
  flex: 1 1 auto;
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
  transform: translateX(100%);

  @include breakpoint(small) {
    display: none;
  }

  &:hover {
    background: var(--color-fill-gray-tertiary);
  }
}
</style>
