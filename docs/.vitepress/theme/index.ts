// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'

// Import des composants personnalisés
import ArticleCard from './components/ArticleCard.vue'
import ArticleList from './components/ArticleList.vue'
import TagCloud from './components/TagCloud.vue'
import RecentPosts from './components/RecentPosts.vue'
import RelatedPosts from './components/RelatedPosts.vue'
import TaggedArticles from './components/TaggedArticles.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // Enregistrement global des composants
    app.component('ArticleCard', ArticleCard)
    app.component('ArticleList', ArticleList)
    app.component('TagCloud', TagCloud)
    app.component('RecentPosts', RecentPosts)
    app.component('RelatedPosts', RelatedPosts)
    app.component('TaggedArticles', TaggedArticles)
  }
} satisfies Theme
