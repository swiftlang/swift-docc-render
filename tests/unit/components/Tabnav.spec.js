/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable */

import Tabnav from "docc-render/components/Tabnav.vue";
import { shallowMount } from "@vue/test-utils";
import TabnavItem from "docc-render/components/TabnavItem.vue";

const { ProvideKey } = Tabnav.constants;

const propsData = {
  value: "foo"
};
describe("Tabnav", () => {
  it("renders the Tabnav", () => {
    const wrapper = shallowMount(Tabnav, {
      propsData
    });
    expect(wrapper.html()).toMatchInlineSnapshot(`
      <nav class="tabnav">
        <ul class="tabnav-items"></ul>
      </nav>
    `);
  });

  it("renders the default slot", () => {
    const wrapper = shallowMount(Tabnav, {
      propsData,
      slots: {
        default: '<div class="foo">Foo</div>'
      }
    });
    expect(wrapper.find(".foo").exists()).toEqual(true);
  });

  it("provides object with current selected tab and method to change it", () => {
    let data;

    const wrapper = shallowMount(Tabnav, {
      propsData,
      slots: {
        default: {
          inject: [ProvideKey],
          template: "<div>Foo</div>",
          mounted() {
            data = this[ProvideKey];
          }
        }
      }
    });

    expect(data).toEqual({
      activeTab: propsData.value,
      selectTab: expect.any(Function)
    });
    // test the setter function
    data.selectTab("bar");
    // assert the component emitted the correct event
    expect(wrapper.emitted("input")).toEqual([["bar"]]);
  });

  it("works with `TabnavItem`", () => {
    const wrapper = shallowMount(Tabnav, {
      propsData,
      stubs: { TabnavItem },
      slots: {
        default:
          '<TabnavItem value="one">One</TabnavItem>' + '<TabnavItem value="two">Two</TabnavItem>'
      }
    });
    wrapper
      .findAll(".tabnav-link")
      .at(1)
      .trigger("click");
    expect(wrapper.emitted("input")).toEqual([["two"]]);
  });

  it('applies a position class', () => {
    const wrapper = shallowMount(Tabnav, {
      propsData: {
        ...propsData,
        position: 'center',
      },
    });
    expect(wrapper.find('.tabnav').classes()).toContain('tabnav--center');
  });

  it('applies a `vertical` class', () => {
    const wrapper = shallowMount(Tabnav, {
      propsData: {
        ...propsData,
        vertical: true,
      },
    });
    expect(wrapper.find('.tabnav').classes()).toContain('tabnav--vertical');
  });
});
