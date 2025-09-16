/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import ContentNode from 'docc-render/components/ContentNode.vue';
import Quiz from 'docc-render/components/Tutorial/Assessments/Quiz.vue';

const i18nStub = {
  name: 'i18n',
  template: '<span>Answer is <slot name="result"/></span>',
};

const textContent = str => ([{
  type: 'text',
  text: str,
}]);

describe('Quiz', () => {
  let wrapper;

  const propsData = {
    title: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'tutorials.assessment.check-your-understanding.',
          },
        ],
      },
    ],
    content: textContent('blah blah blah'),
    choices: [
      {
        content: textContent('foo'),
        isCorrect: true,
        justification: textContent('whatever'),
      },
      {
        content: textContent('bar'),
        isCorrect: false,
        justification: textContent('what'),
      },
      {
        content: textContent('baz'),
        isCorrect: false,
        justification: textContent('who'),
      },
      {
        content: textContent('bam'),
        isCorrect: false,
        justification: textContent('when'),
      },
    ],
    correctAnswers: [
      {
        content: textContent('foo'),
        isCorrect: true,
        justification: textContent('whatever'),
      },
      {
        content: textContent('bam'),
        isCorrect: true,
        justification: textContent('when'),
      },
    ],
    selectedChoices: [
      {
        content: textContent('foo'),
        isCorrect: true,
        justification: textContent('whatever'),
      },
      {
        content: textContent('bar'),
        isCorrect: false,
        justification: textContent('whatever'),
      },
      {
        content: textContent('baz'),
        isCorrect: false,
        justification: textContent('whatever'),
      },
    ],
    checkedAnswers: [
      {
        content: textContent('foo'),
        isCorrect: true,
        justification: textContent('whatever'),
      },
      {
        content: textContent('bar'),
        isCorrect: false,
        justification: textContent('whatever'),
      },
      {
        content: textContent('baz'),
        isCorrect: false,
        justification: textContent('whatever'),
      },
    ],
  };

  describe('default', () => {
    beforeEach(() => {
      wrapper = shallowMount(Quiz, {
        propsData,
        stubs: { i18n: i18nStub },
      });
    });

    it('renders a div.quiz root', () => {
      expect(wrapper.element.matches('div.quiz')).toBe(true);
    });

    it('renders a title', () => {
      const node = wrapper.findComponent('.title');
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toBe(propsData.title);
    });

    it('renders a `ContentNode`', () => {
      const node = wrapper.findAll(ContentNode).at(1);
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toEqual(propsData.content);
    });

    it('renders a fieldset element with choices', () => {
      const choices = wrapper.findComponent('fieldset.choices');
      expect(choices.exists()).toBe(true);

      const legend = choices.find('legend');
      expect(legend.exists()).toBe(true);
      expect(legend.text()).toBe('tutorials.assessment.legend');

      const items = choices.findAll('label.choice');
      expect(items.length).toBe(propsData.choices.length);

      expect(items.at(0).findComponent(ContentNode).props('content'))
        .toEqual(propsData.choices[0].content);
      expect(items.at(1).findComponent(ContentNode).props('content'))
        .toEqual(propsData.choices[1].content);
      expect(items.at(2).findComponent(ContentNode).props('content'))
        .toEqual(propsData.choices[2].content);
    });

    it('does not render an "answer" by default', () => {
      expect(wrapper.findComponent('answer').exists()).toBe(false);
    });

    it('does not render an icon by default', () => {
      expect(wrapper.findComponent('.choice-icon').exists()).toBe(false);
    });

    it('does not enable the Submit button by default', () => {
      const check = wrapper.findComponent('.check');
      expect(check.exists()).toBe(true);
      expect(check.text()).toBe('tutorials.submit');
      expect(check.attributes('disabled')).toBe('true');
    });
  });

  describe('when choice is clicked', () => {
    let choices;
    let submit;

    beforeEach(() => {
      wrapper = shallowMount(Quiz, {
        propsData,
        stubs: { i18n: i18nStub },
        attachToDocument: true,
      });
      choices = wrapper.findAll('.choice');
      submit = wrapper.findComponent('.check');
    });

    it('adds "active" class when choice is clicked', async () => {
      const choice = choices.at(0);

      expect(choice.classes('active')).toBe(false);
      await choice.trigger('click');
      expect(choice.classes('active')).toBe(true);
    });

    it('renders a success icon, only for the chosen choice', async () => {
      const choice = choices.at(0);
      await choice.trigger('click');
      await submit.trigger('click');

      expect(choice.classes()).toContain('correct');
      expect(wrapper.findAll('.choice-icon')).toHaveLength(1);
      // cant match directly with element, VTU is buggy
      expect(choice.find('.choice-icon').html()).toContain('<checkcircleicon');
    });

    it('renders an error icon only for the chosen choice', async () => {
      const choice = choices.at(1);
      await choice.trigger('click');
      await submit.trigger('click');

      expect(wrapper.findAll('.choice-icon')).toHaveLength(1);
      // cant match directly with element, VTU is buggy
      expect(choice.find('.choice-icon').html()).toContain('<resetcircleicon');
    });

    it('updates the aria live text telling the user if the answer chosen is correct or incorrect', async () => {
      let ariaLive = wrapper.findComponent('[aria-live="assertive"].visuallyhidden');
      expect(ariaLive.exists()).toBe(true);
      expect(ariaLive.text()).toBe('');

      let choice = choices.at(1);
      await choice.trigger('click');
      await submit.trigger('click');

      ariaLive = wrapper.findComponent('[aria-live="assertive"].visuallyhidden > span');
      expect(ariaLive.text()).toBe('Answer is tutorials.assessment.incorrect');

      choice = choices.at(0);
      await choice.trigger('click');
      await submit.trigger('click');

      ariaLive = wrapper.findComponent('[aria-live="assertive"].visuallyhidden > span');
      expect(ariaLive.text()).toBe('Answer is tutorials.assessment.correct');
    });
  });
});
