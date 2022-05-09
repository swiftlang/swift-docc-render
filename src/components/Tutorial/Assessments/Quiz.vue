<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="quiz">
    <ContentNode class="title" :content="title" />
    <ContentNode class="question-content" v-if="content" :content="content" />
    <div class="choices">
      <label
        v-for="(choice, index) in choices"
        :key="index"
        :class="choiceClasses[index]"
        >
          <component :is="getIconComponent(index)" class="choice-icon" />
          <input type="radio" :value="index" v-model="selectedIndex" name="assessment">
          <ContentNode class="question" :content="choice.content" />
          <template v-if="userChoices[index].checked">
            <ContentNode class="answer" :content="choice.justification" />
            <p class="answer" v-if="choice.reaction">{{ choice.reaction }}</p>
          </template>
      </label>
      <div aria-live="assertive" class="visuallyhidden">
        {{ ariaLiveText }}
      </div>
    </div>
    <div class="controls">
      <ButtonLink
        class="check"
        @click.native="submit"
        :disabled="selectedIndex === null || showNextQuestion"
      >
       Submit
      </ButtonLink>
      <ButtonLink
        v-if="isLast"
        class="results"
        @click.native="seeResults"
        :disabled="!showNextQuestion"
      >
        Next
      </ButtonLink>
      <ButtonLink
        v-else
        class="next"
        :disabled="!showNextQuestion"
        @click.native="advance"
      >
        Next Question
      </ButtonLink>
    </div>
  </div>
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';
import ButtonLink from 'docc-render/components/ButtonLink.vue';
import ResetCircleIcon from 'theme/components/Icons/ResetCircleIcon.vue';
import CheckCircleIcon from 'theme/components/Icons/CheckCircleIcon.vue';

export default {
  name: 'Quiz',
  components: {
    CheckCircleIcon, ResetCircleIcon, ContentNode, ButtonLink,
  },
  props: {
    content: {
      type: Array,
      required: false,
    },
    choices: {
      type: Array,
      required: true,
    },
    isLast: {
      type: Boolean,
      default: false,
    },
    title: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      userChoices: this.choices.map(() => ({ checked: false })),
      selectedIndex: null,
      checkedIndex: null,
    };
  },
  computed: {
    correctChoices() {
      return this.choices.reduce((set, choice, i) => (
        choice.isCorrect ? set.add(i) : set
      ), new Set());
    },
    choiceClasses() {
      return this.userChoices.map((choice, i) => ({
        choice: true,
        active: this.selectedIndex === i,
        disabled: choice.checked || this.showNextQuestion,
        correct: choice.checked && this.choices[i].isCorrect,
        incorrect: choice.checked && !this.choices[i].isCorrect,
      }));
    },
    showNextQuestion() {
      return Array.from(this.correctChoices).every(correctChoice => (
        this.userChoices[correctChoice].checked
      ));
    },
    ariaLiveText: ({ checkedIndex, choices }) => {
      if (checkedIndex === null) return '';
      const { isCorrect } = choices[checkedIndex];
      return `Answer number ${checkedIndex + 1} is ${isCorrect ? 'correct' : 'incorrect'}`;
    },
  },
  methods: {
    getIconComponent(index) {
      const choice = this.userChoices[index];
      if (!choice || !choice.checked) return undefined;
      return this.choices[index].isCorrect
        ? CheckCircleIcon
        : ResetCircleIcon;
    },
    submit() {
      this.$set(this.userChoices, this.selectedIndex, { checked: true });
      this.checkedIndex = this.selectedIndex;
      this.$emit('submit');
    },
    advance() {
      this.$emit('advance');
    },
    seeResults() {
      this.$emit('see-results');
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.title {
  @include font-styles(label-reduced);
  color: var(--colors-header-text, var(--color-header-text));
  margin: 25px 0;
}

.question-content /deep/ code {
  @include font-styles(assessments-code);
}

.choices {
  display: flex;
  flex-direction: column;
  padding: 0;
  list-style: none;
  margin: 25px 0;
}

.choice {
  @include font-styles(body-reduced);
  flex: 1;
  border-radius: $border-radius;
  margin: 8px 0;
  padding: 1.5rem 40px;
  cursor: pointer;
  background: var(--colors-text-background, var(--color-text-background));
  // Vertically align the choice content, with or without the answer
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  border-color: var(--colors-grid, var(--color-grid));
  position: relative;

  /deep/ img {
    max-height: rem(400px);
  }
  &:first-of-type {
    margin-top: 0;
  }

  /deep/ code {
    @include font-styles(assessments-code);
  }
}

.controls {
  text-align: center;
  margin-bottom: 40px;

  .button-cta {
    margin: 0.5rem;
    margin-top: 0;
    padding: 0.3rem 3rem;
    min-width: 8rem;
  }
}

// hide the checkbox
input[type="radio"] {
  position: absolute;
  width: 100%;
  left: 0;
  height: 100%;
  opacity: 0;
  z-index: -1;
}

.active {
  border-color: var(--color-tutorial-quiz-border-active);
  @include focus-shadow();
}

.active * {
  color: var(--colors-text, var(--color-text));
}

.correct {
  background: var(--color-form-valid-background);
  border-color: var(--color-form-valid);

  .choice-icon {
    fill: var(--color-form-valid);
  }
}
.incorrect {
  background: var(--color-form-error-background);
  border-color: var(--color-form-error);

  .choice-icon {
    fill: var(--color-form-error);
  }
}

.correct,
.incorrect {
  position: relative;

  .choice-icon {
    position: absolute;
    top: 11px;
    left: 10px;
    font-size: 20px;
    width: 1.05em;
  }
}

.disabled {
  pointer-events: none;
}

.answer {
  margin: .5rem 1.5rem .5rem 0;

  &:last-of-type {
    margin-bottom: 0;
  }

  @include font-styles(caption);
}

/deep/ .question  > .code-listing {
  padding: unset;
  border-radius: 0;
}

/deep/ pre {
  padding:0;
}

/deep/ img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
}

</style>
