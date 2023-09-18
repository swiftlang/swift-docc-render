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
  template: '<div aria-live="assertive" class="visuallyhidden">Answer is <slot name="result"/></div>',
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
      expect(wrapper.is('div.quiz')).toBe(true);
    });

    it('renders a title', () => {
      const node = wrapper.find('.title');
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toBe(propsData.title);
    });

    it('renders a `ContentNode`', () => {
      const node = wrapper.findAll(ContentNode).at(1);
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toEqual(propsData.content);
    });

    it('renders a ul.choices', () => {
      const choices = wrapper.find('div.choices');
      expect(choices.exists()).toBe(true);

      const items = choices.findAll('label.choice');
      expect(items.length).toBe(propsData.choices.length);

      expect(items.at(0).find(ContentNode).props('content'))
        .toEqual(propsData.choices[0].content);
      expect(items.at(1).find(ContentNode).props('content'))
        .toEqual(propsData.choices[1].content);
      expect(items.at(2).find(ContentNode).props('content'))
        .toEqual(propsData.choices[2].content);
    });

    it('does not render an "answer" by default', () => {
      expect(wrapper.find('answer').exists()).toBe(false);
    });

    it('does not render an icon by default', () => {
      expect(wrapper.find('.choice-icon').exists()).toBe(false);
    });

    it('does not enable the Submit button by default', () => {
      const check = wrapper.find('.check');
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
      submit = wrapper.find('.check');
    });

    it('adds "active" class when choice is clicked', async () => {
      const choice = choices.at(0);

      expect(choice.classes('active')).toBe(false);
      choice.trigger('click');
      expect(choice.classes('active')).toBe(true);
    });

    it('renders a success icon, only for the chosen choice', () => {
      const choice = choices.at(0);
      choice.trigger('click');
      submit.trigger('click');

      expect(choice.classes()).toContain('correct');
      expect(wrapper.findAll('.choice-icon')).toHaveLength(1);
      // cant match directly with element, VTU is buggy
      expect(choice.find('.choice-icon').html()).toContain('<checkcircleicon');
    });

    it('renders an error icon only for the chosen choice', () => {
      const choice = choices.at(1);
      choice.trigger('click');
      submit.trigger('click');

      expect(wrapper.findAll('.choice-icon')).toHaveLength(1);
      // cant match directly with element, VTU is buggy
      expect(choice.find('.choice-icon').html()).toContain('<resetcircleicon');
    });

    it('updates the aria live text telling the user if the answer chosen is correct or incorrect', () => {
      let ariaLive = wrapper.find('[aria-live="assertive"].visuallyhidden');
      expect(ariaLive.exists()).toBe(true);
      expect(ariaLive.text()).toBe('');

      let choice = choices.at(1);
      choice.trigger('click');
      submit.trigger('click');

      ariaLive = wrapper.find('[aria-live="assertive"].visuallyhidden');
      expect(ariaLive.text()).toBe('Answer is tutorials.assessment.incorrect');

      choice = choices.at(0);
      choice.trigger('click');
      submit.trigger('click');

      ariaLive = wrapper.find('[aria-live="assertive"].visuallyhidden');
      expect(ariaLive.text()).toBe('Answer is tutorials.assessment.correct');
    });
  });
});
