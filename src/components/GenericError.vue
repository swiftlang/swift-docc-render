<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="generic-error">
    <div class="container">
      <h1 class="title error-content">{{message}}</h1>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'GenericError',
  props: {
    message: {
      type: String,
      default: 'An unknown error occurred.',
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.container {
  @include section-content;
  margin-top: 92px;
  margin-bottom: 140px;
}

.error-content {
  box-sizing: border-box;
  width: 502px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 54px;
  @include breakpoint(medium) {
    width: 420px;
    margin-bottom: 45px;
  }
  @include breakpoint(small) {
    max-width: 330px;
    width: auto;
    margin-bottom: 35px
  }
}

.title {
  text-align: center;
  @include font-styles(headline);
}
</style>
