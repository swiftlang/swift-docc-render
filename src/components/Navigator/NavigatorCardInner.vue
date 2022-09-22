<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator-card-inner"><slot /></div>
</template>

<script>
export default { name: 'NavigatorCardInner' };
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.navigator-card-inner {
  display: flex;
  flex-flow: column;
  height: 100%;
}
</style>
