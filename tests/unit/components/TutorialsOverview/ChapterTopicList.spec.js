/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import ChapterTopicList from 'docc-render/components/TutorialsOverview/ChapterTopicList.vue';

const {
  TopicKind,
  TopicKindClass,
  TopicKindIconLabel,
} = ChapterTopicList.constants;
const { TimerIcon } = ChapterTopicList.components;

describe('ChapterTopicList', () => {
  let wrapper;

  const stubs = { 'router-link': RouterLinkStub };
  const propsData = {
    topics: [
      {
        kind: TopicKind.tutorial,
        estimatedTime: '4min',
        title: 'Foo',
        url: '/tutorials/blah/foo',
      },
      {
        kind: TopicKind.article,
        title: 'Bar',
        url: '/tutorials/blah/bar',
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(ChapterTopicList, {
      propsData,
      stubs,
      mocks: {
        $route: {
          query: {
            context: 'foo',
          },
        },
      },
    });
  });

  it('renders an ol.topic-list root', () => {
    expect(wrapper.is('ol.topic-list')).toBe(true);
  });

  it('renders an li with link/time for every topic', () => {
    const items = wrapper.findAll('li.topic');
    expect(items.length).toBe(propsData.topics.length);

    items.wrappers.forEach((item, i) => {
      const topic = propsData.topics[i];
      const {
        title, url, kind, estimatedTime,
      } = topic;

      const link = item.find(RouterLinkStub);
      expect(link.exists()).toBe(true);
      expect(link.props('to')).toBe(`${url}?context=foo`);

      expect(link.find('.link').text()).toBe(title);
      expect(link.attributes('aria-label'))
        .toBe(`${title} - ${TopicKindIconLabel[kind]}${estimatedTime ? ' - 4 minutes Estimated Time' : ''}`);

      if (estimatedTime) {
        const time = item.find('.time');
        expect(time.find('.time-label').text()).toBe(estimatedTime);
        expect(time.contains(TimerIcon)).toBe(true);
      } else {
        expect(item.classes()).toContain('no-time-estimate');
        expect(item.find('.time').exists()).toBeFalsy();
      }
    });
  });

  it('renders aria labels even if no `estimatedTime` on a topic', () => {
    wrapper.setProps({
      topics: [
        {
          kind: TopicKind.tutorial,
          title: 'Foo',
          url: '/tutorials/blah/foo',
        },
      ],
    });
    expect(wrapper.find('li.topic .container').attributes('aria-label')).toEqual('Foo - Tutorial');
  });

  it('adds modifiers for the kind of topic (article or tutorial)', () => {
    const items = wrapper.findAll('li.topic');
    expect(items.at(0).classes(TopicKindClass.tutorial)).toBe(true);
    expect(items.at(0).classes(TopicKindClass.article)).toBe(false);
    expect(items.at(1).classes(TopicKindClass.tutorial)).toBe(false);
    expect(items.at(1).classes(TopicKindClass.article)).toBe(true);
  });
});
