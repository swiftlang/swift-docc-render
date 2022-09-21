import { shallowMount } from '@vue/test-utils';
import TaskList from 'docc-render/components/ContentNode/TaskList.vue';

describe('ContentNode', () => {
  const createWrapper = options => shallowMount(TaskList, options);

  it('renders a list with a disabled checkbox for each list item', () => {
    const tasks = [
      { checked: false },
      { checked: true },
    ];

    const wrapper = createWrapper({
      propsData: { tasks },
    });
    expect(wrapper.is('ul.tasklist')).toBe(true);

    const checkboxes = wrapper.findAll('li input[disabled][type="checkbox"]');
    expect(checkboxes.length).toBe(tasks.length);
    expect(checkboxes.at(0).element.checked).toBe(tasks[0].checked);
    expect(checkboxes.at(1).element.checked).toBe(tasks[1].checked);
  });

  it('renders slot content for tasks', () => {
    const tasks = [
      { checked: false, text: 'foo' },
      { checked: true, text: 'bar' },
    ];

    const wrapper = createWrapper({
      propsData: { tasks },
      scopedSlots: {
        task: function render(slotProps) {
          return this.$createElement('p', slotProps.task.text);
        },
      },
    });

    const paragraphs = wrapper.findAll('li p');
    expect(paragraphs.length).toBe(tasks.length);
    expect(paragraphs.at(0).text()).toBe(tasks[0].text);
    expect(paragraphs.at(1).text()).toBe(tasks[1].text);
  });
});
