/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Assessments from 'docc-render/components/Tutorial/Assessments.vue';

const { LinkableSection } = Assessments.components;
const { SuccessMessage } = Assessments.constants;

// Stub scrolling APIs not implemented in Jest.
window.HTMLElement.prototype.scrollIntoView = () => {};
window.scrollBy = () => {};

describe('Assessments', () => {
  let wrapper;

  const anchor = 'Check-your-understanding';

  const assessments = [
    {
      type: 'multiple-choice',
      title: [
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'Is this question 1?',
            },
          ],
        },
      ],
      choices: [
        {
          content: [
            {
              type: 'text',
              text: 'yes',
            },
          ],
          isCorrect: true,
          justification: [
            {
              type: 'text',
              text: 'yes',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'no',
            },
          ],
          isCorrect: false,
          justification: [
            {
              type: 'text',
              text: 'yes',
            },
          ],
        },
      ],
    },
    {
      type: 'multiple-choice',
      title: [
        {
          type: 'paragraph',
          inlineContent: [
            {
              type: 'text',
              text: 'Is this question 42?',
            },
          ],
        },
      ],
      content: [
        {
          type: 'text',
          text: '42',
        },
      ],
      choices: [
        {
          content: [
            {
              type: 'text',
              text: 'yes',
            },
          ],
          isCorrect: false,
          justification: [
            {
              type: 'text',
              text: 'yes',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'no',
            },
          ],
          isCorrect: true,
          justification: [
            {
              type: 'text',
              text: 'yes',
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    wrapper = shallowMount(Assessments, {
      propsData: {
        anchor,
        assessments,
      },
      provide: {
        navigationBarHeight: 52,
      },
    });
  });

  it('renders a `LinkableSection`', () => {
    const section = wrapper.find(LinkableSection);
    expect(section.exists()).toBe(true);
    expect(section.props()).toEqual({
      anchor: 'Check-your-understanding',
      depth: 0,
      tag: 'div',
      title: 'Check Your Understanding',
    });
  });

  it('renders a banner with copy', () => {
    const banner = wrapper.find('.banner');
    expect(banner.exists()).toBe(true);
    expect(banner.contains('h2')).toBe(true);
  });
  it('renders a progress section', () => {
    const progress = wrapper.find(Assessments.components.Progress);
    expect(progress.exists()).toBe(true);
    expect(progress.props('index')).toBe(1);
    expect(progress.props('total')).toBe(2);
  });

  it('renders the first assessment', () => {
    const assessment = wrapper.find(Assessments.components.Quiz);
    expect(assessment.exists()).toBe(true);
    expect(assessment.props('choices')).toEqual(assessments[0].choices);
    expect(assessment.props('isLast')).toBe(false);
    expect(assessment.props('title')).toBe(assessments[0].title);
  });

  describe('when the user advances to the next assessment', () => {
    beforeEach(() => {
      const assessment = wrapper.find(Assessments.components.Quiz);
      assessment.vm.$emit('advance');
    });

    it('renders the progress with the next index', () => {
      const progress = wrapper.find(Assessments.components.Progress);
      expect(progress.props('index')).toBe(2);
    });

    it('renders the next assessment', () => {
      const assessment = wrapper.find(Assessments.components.Quiz);
      expect(assessment.exists()).toBe(true);
      expect(assessment.props('choices')).toEqual(assessments[1].choices);
      expect(assessment.props('content')).toEqual(assessments[1].content);
      expect(assessment.props('isLast')).toBe(true);
      expect(assessment.props('title')).toBe(assessments[1].title);
    });
  });

  describe('scrolling behavior', () => {
    const mountWithNavigationBarHeight = navigationBarHeight => (
      shallowMount(Assessments, {
        propsData: { anchor, assessments },
        provide: { navigationBarHeight },
      })
    );

    let scrollIntoViewMock;
    let scrollByMock;

    beforeEach(() => {
      scrollIntoViewMock = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      scrollByMock = jest.fn();
      window.scrollBy = scrollByMock;
    });

    it('scrolls the user on submit', async (done) => {
      wrapper = mountWithNavigationBarHeight(52);
      const assessment = wrapper.find(Assessments.components.Quiz);
      assessment.vm.$emit('submit');

      await wrapper.vm.$nextTick();

      expect(scrollIntoViewMock).toBeCalled();
      expect(scrollByMock).toBeCalledWith(0, -52 - 12);

      done();
    });

    it('scrolls the user on advance', async (done) => {
      wrapper = mountWithNavigationBarHeight(0);
      const assessment = wrapper.find(Assessments.components.Quiz);
      assessment.vm.$emit('advance');

      await wrapper.vm.$nextTick();

      expect(scrollIntoViewMock).toBeCalled();
      expect(scrollByMock).toBeCalledWith(0, -12);

      done();
    });

    it('scrolls the user on see-results', async (done) => {
      wrapper = mountWithNavigationBarHeight(40);
      const assessment = wrapper.find(Assessments.components.Quiz);
      assessment.vm.$emit('see-results');

      await wrapper.vm.$nextTick();

      expect(scrollIntoViewMock).toBeCalled();
      expect(scrollByMock).toBeCalledWith(0, -52);

      done();
    });
  });
});

describe('success slot for completed assessment', () => {
  const options = {
    propsData: {
      anchor: 'check-your-understanding',
      assessments: [
        {
          choices: [],
          title: [],
          type: 'foo',
        },
      ],
      title: 'Check Your Understanding',
    },
    provide: {
      navigationBarHeight: 52,
    },
  };

  it('renders a default "success" message', () => {
    const wrapper = shallowMount(Assessments, {
      ...options,
    });
    wrapper.setData({ completed: true });

    const success = wrapper.find('.success');
    expect(success.exists()).toBe(true);

    const message = success.find('p');
    expect(message.exists()).toBe(true);
    expect(message.text()).toBe(SuccessMessage);
  });

  it('renders a default "success" message on aria live element for AX', () => {
    const wrapper = shallowMount(Assessments, {
      ...options,
    });
    const ariaLive = wrapper.find('[aria-live="assertive"].visuallyhidden');
    expect(ariaLive.exists()).toBe(true);
    // assert that aria-live's slot is empty
    expect(ariaLive.isEmpty()).toBe(true);

    wrapper.setData({ completed: true });
    // assert that aria-live's slot has been updated
    expect(ariaLive.text()).toBe(SuccessMessage);
  });

  it('renders a "success" slot and slot message when provided', () => {
    const wrapper = shallowMount(Assessments, {
      ...options,
      slots: {
        success: '<marquee>Success Slot</marquee>',
      },
    });
    wrapper.setData({ completed: true });

    const success = wrapper.find('.success');
    expect(success.exists()).toBe(true);
    expect(success.contains('p')).toBe(false);

    const message = success.find('marquee');
    expect(message.exists()).toBe(true);
    expect(message.text()).toBe('Success Slot');

    const ariaLive = wrapper.find('[aria-live="assertive"].visuallyhidden');
    expect(ariaLive.exists()).toBe(true);
    // Aria live is updated
    expect(ariaLive.text()).toBe('Success Slot');
  });
});
