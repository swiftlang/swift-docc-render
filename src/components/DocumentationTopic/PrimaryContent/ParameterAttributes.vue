<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="parameter-attributes">
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.default)"
      v-bind="{ kind: AttributeKind.default, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ attribute.title || 'Default' }}: <code>{{ attribute.value }}</code>
      </template>
    </ParameterMetaAttribute>
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.minimum)"
      v-bind="{ kind: AttributeKind.minimum, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ attribute.title || 'Minimum' }}: <code>{{ attribute.value }}</code>
      </template>
    </ParameterMetaAttribute>
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.minimumExclusive)"
      v-bind="{ kind: AttributeKind.minimumExclusive, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ attribute.title || 'Minimum' }}: <code>&gt; {{ attribute.value }}</code>
      </template>
    </ParameterMetaAttribute>
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.maximum)"
      v-bind="{ kind: AttributeKind.maximum, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ attribute.title || 'Maximum' }}: <code>{{ attribute.value }}</code>
      </template>
    </ParameterMetaAttribute>
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.maximumExclusive)"
      v-bind="{ kind: AttributeKind.maximumExclusive, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ attribute.title || 'Maximum' }}: <code>&lt; {{ attribute.value }}</code>
      </template>
    </ParameterMetaAttribute>
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.allowedTypes)"
      v-bind="{ kind: AttributeKind.allowedTypes, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ fallbackToValues(attribute).length > 1 ? 'Possible types' : 'Type' }}:
        <code>
          <template v-for="(possibleType, i) in fallbackToValues(attribute)">
            <template v-for="(token, j) in possibleType">
              <DeclarationToken v-bind="token" :key="`${i}-${j}`"
              /><template v-if="i + 1 < fallbackToValues(attribute).length">, </template>
            </template>
          </template>
        </code>
      </template>
    </ParameterMetaAttribute>
    <ParameterMetaAttribute
      v-if="shouldRender(AttributeKind.allowedValues)"
      v-bind="{ kind: AttributeKind.allowedValues, attributes: attributesObject, changes }">
      <template slot-scope="{ attribute }">
        {{ fallbackToValues(attribute).length > 1 ? 'Possible values' : 'Value' }}:
        <code>{{ fallbackToValues(attribute).join(', ') }}</code>
      </template>
    </ParameterMetaAttribute>
  </div>
</template>

<script>

import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';
import ParameterMetaAttribute
  from 'docc-render/components/DocumentationTopic/PrimaryContent/ParameterMetaAttribute.vue';

const AttributeKind = {
  allowedTypes: 'allowedTypes',
  allowedValues: 'allowedValues',
  default: 'default',
  maximum: 'maximum',
  maximumExclusive: 'maximumExclusive',
  minimum: 'minimum',
  minimumExclusive: 'minimumExclusive',
};

/**
 * Renders `attributes` property,
 * usually in `PropertyTable` or `RestParameters`
 */
export default {
  name: 'ParameterAttributes',
  components: { ParameterMetaAttribute, DeclarationToken },
  constants: { AttributeKind },
  props: {
    attributes: {
      type: Array,
      default: () => ([]),
    },
    changes: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    AttributeKind: () => AttributeKind,
    /**
     * Converts the attributes array into an object.
     * @param {array} attributes - array of attributes
     * @returns {object}
     */
    attributesObject: ({ attributes }) => attributes.reduce((all, attr) => ({
      ...all,
      [attr.kind]: attr,
    }), {}),
  },
  methods: {
    // checks whether provided `kind` should be rendered
    shouldRender(kind) {
      return Object.prototype.hasOwnProperty.call(this.attributesObject, kind);
    },
    fallbackToValues: (attribute) => {
      const attrs = attribute || [];
      return Array.isArray(attrs) ? attrs : (attrs).values;
    },
  },
};
</script>
