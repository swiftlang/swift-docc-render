<script>
import { fetchIndexPathsData } from 'docc-render/utils/data';
import Language from 'docc-render/constants/Language';

/**
 * Fetches the sidebar navigator data and provides it via a scoped slot,
 * extracting for current language
 */
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
      isFetching: false,
      navigationIndex: {
        [Language.swift.key.url]: [],
      },
    };
  },
  computed: {
    /**
     * Extracts the technology data, for the currently chosen language
     * @return {Object}
     */
    technologyWithChildren({ navigationIndex, interfaceLanguage, technology }) {
      // get the technologies for the current language
      let currentLangTechnologies = navigationIndex[interfaceLanguage] || [];
      // if no such items, we use the default swift one
      if (!currentLangTechnologies.length) {
        currentLangTechnologies = navigationIndex[Language.swift.key.url];
      }
      // find the current technology
      return currentLangTechnologies.find(t => t.path === technology.url);
    },
  },
  async created() {
    try {
      this.isFetching = true;
      const { languages } = await fetchIndexPathsData();
      this.navigationIndex = languages;
    } catch (e) {
      console.log(e);
    } finally {
      this.isFetching = false;
    }
  },
  render() {
    return this.$scopedSlots.default({
      technology: this.technologyWithChildren,
      isFetching: this.isFetching,
    });
  },
};
</script>
