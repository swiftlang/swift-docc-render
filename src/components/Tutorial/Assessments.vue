<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <LinkableSection
    :anchor="anchor"
    :title="title"
    class="assessments-wrapper"
  >
    <Row class="assessments" ref="assessments">
      <MainColumn>
        <Row class="banner">
          <HeaderColumn>
            <h2 class="title">{{title}}</h2>
          </HeaderColumn>
        </Row>
        <div v-if="!completed">
          <Progress v-bind="progress" ref="progress"/>
          <Quiz
            :choices="activeAssessment.choices"
            :content="activeAssessment.content"
            :isLast="isLast"
            :key="activeIndex"
            :title="activeAssessment.title"
            @submit="onSubmit"
            @advance="onAdvance"
            @see-results="onSeeResults"
          />
        </div>
        <div v-else class="success">
          <slot name="success">
            <p>{{ SuccessMessage }}</p>
          </slot>
        </div>
        <div aria-live="assertive" class="visuallyhidden">
          <slot name="success" v-if="completed">
            {{ SuccessMessage }}
          </slot>
        </div>
      </MainColumn>
    </Row>
  </LinkableSection>
</template>

<script>
import GridColumn from 'docc-render/components/GridColumn.vue';
import GridRow from 'docc-render/components/GridRow.vue';
import LinkableElement from 'docc-render/components/LinkableElement.vue';

import AssessmentsProgress from './AssessmentsProgress.vue';
import Quiz from './Assessments/Quiz.vue';

const additionalScrollOffset = 12;
const SuccessMessage = 'Great job, you\'ve answered all the questions for this tutorial.';

export default {
  name: 'Assessments',
  constants: { SuccessMessage },
  components: {
    LinkableSection: LinkableElement,
    Quiz,
    Progress: AssessmentsProgress,
    Row: GridRow,
    HeaderColumn: {
      render(createElement) {
        return createElement(
          GridColumn,
          {
            props: {
              isCentered: { large: true },
              span: {
                large: 10,
              },
            },
          },
          this.$slots.default,
        );
      },
    },
    MainColumn: {
      render(createElement) {
        return createElement(
          GridColumn,
          {
            props: {
              isCentered: { large: true },
              span: {
                large: 10,
                medium: 10,
                small: 12,
              },
            },
          },
          this.$slots.default,
        );
      },
    },
  },
  props: {
    assessments: {
      type: Array,
      required: true,
    },
    anchor: {
      type: String,
      required: true,
    },
  },
  inject: ['navigationBarHeight'],
  data() {
    return {
      activeIndex: 0,
      completed: false,
      SuccessMessage,
    };
  },
  computed: {
    activeAssessment() {
      return this.assessments[this.activeIndex];
    },
    isLast() {
      return this.activeIndex === this.assessments.length - 1;
    },
    progress() {
      return {
        // use a friendly 1 based index value for displaying progress
        index: this.activeIndex + 1,
        total: this.assessments.length,
      };
    },
    title() {
      return 'Check Your Understanding';
    },
  },
  methods: {
    scrollTo(element, additionalOffset = 0) {
      element.scrollIntoView(true);

      // Scroll down to display the content below the navigation bar.
      window.scrollBy(0, -this.navigationBarHeight - additionalOffset);
    },
    onSubmit() {
      this.$nextTick(() => {
        this.scrollTo(this.$refs.progress.$el, additionalScrollOffset);
      });
    },
    onAdvance() {
      this.activeIndex += 1;

      this.$nextTick(() => {
        this.scrollTo(this.$refs.progress.$el, additionalScrollOffset);
      });
    },
    onSeeResults() {
      this.completed = true;

      this.$nextTick(() => {
        this.scrollTo(this.$refs.assessments.$el, additionalScrollOffset);
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.title  {
  @include font-styles(heading-2);
  color: var(--colors-header-text, var(--color-header-text));
  p {
    color: var(--colors-text, var(--color-text));
  }
}

.assessments {
  box-sizing: content-box;
  padding: 0 1rem;
  background: var(--color-tutorial-assessments-background);
  @include breakpoint-content();
  margin-bottom: $tutorial-section-spacing-single-side;
}

.banner {
  padding: 40px 0;
  border-bottom: 1px solid;
  margin-bottom: 40px;
  border-color: var(--colors-grid, var(--color-grid));
  text-align: center;
}

.success {
  text-align: center;
  padding-bottom: 40px;
  @include font-styles(alert-content);
  color: var(--colors-text, var(--color-text));
}

.assessments-wrapper {
  padding-top: $tutorial-section-spacing-single-side;
}
</style>
