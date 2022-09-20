<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="betainfo">
    <div class="betainfo-container">
      <GridRow>
        <GridColumn :span="{ large: 12 }">
          <p class="betainfo-label">Beta Software</p>
          <div class="betainfo-content">
            <slot name="content">
              <p>This documentation refers to beta software and may be changed.</p>
            </slot>
          </div>
          <slot name="after" />
        </GridColumn>
      </GridRow>
    </div>
  </div>
</template>
<script>
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';

export default {
  name: 'BetaLegalText',
  components: { GridColumn, GridRow },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.betainfo {
  font-size: rem(16px);
  padding: 3rem 0;
  background-color: var(--color-fill-secondary);

  &-container {
    @include dynamic-content-container;
  }

  &-label {
    font-weight: $font-weight-semibold;
    font-size: rem(16px);
  }

  &-content /deep/ p {
    margin-bottom: 10px;
  }
}
</style>
