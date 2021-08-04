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
// eslint-disable-next-line import/no-named-default
import { default as TutorialAssessments } from 'docc-render/components/Tutorial/Assessments.vue';
import Assessments from 'docc-render/components/Article/Assessments.vue';

describe('Assessments', () => {
  const propsData = {
    anchor: 'check-your-understanding',
    assessments: [
      {
        choices: [],
        title: [],
        type: 'foo',
      },
    ],
  };

  it('renders a `TutorialAssessments`', () => {
    const wrapper = shallowMount(Assessments, { propsData });

    const assessments = wrapper.find(TutorialAssessments);
    expect(assessments.exists()).toBe(true);
    expect(assessments.props()).toEqual(propsData);

    const message = assessments.find('p');
    expect(message.exists()).toBe(true);
    expect(message.text()).toBe(
      'Great job, you\'ve answered all the questions for this article.',
    );
  });
});
