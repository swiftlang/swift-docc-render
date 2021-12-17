<script>
import { fetchIndexPathsData } from 'docc-render/utils/data';
import Language from 'docc-render/constants/Language';

export default {
  name: 'NavigatorDataProvider',
  props: {
    interfaceLanguage: {
      type: String,
      default: Language.swift.key.url,
    },
    technology: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      navigationIndex: {
        [Language.swift.key.url]: [],
      },
    };
  },
  async created() {
    const { languages } = await fetchIndexPathsData();
    this.navigationIndex = languages;
  },
  computed: {
    technologyTree({ navigationIndex, interfaceLanguage, technology }) {
      let currentLangTechnologies = navigationIndex[interfaceLanguage];
      if (!currentLangTechnologies.length) {
        currentLangTechnologies = navigationIndex[Language.swift.key.url];
      }
      return currentLangTechnologies.find(t => t.path === technology.url);
    },
  },
  render() {
    return this.$scopedSlots.default({
      technology: this.technologyTree,
    });
  },
};
</script>
