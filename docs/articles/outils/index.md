---
title: Outils
description: Sélection d'outils utiles et comparaisons pour optimiser le workflow
---

# Outils

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'

const { loadArticles, getArticlesByCategory } = useArticles()

const articles = getArticlesByCategory('outils')

onMounted(async () => {
  await loadArticles()
})

const handleTagClick = (tag) => {
  window.location.href = `/tags/${tag}`
}

const handleCategoryChange = (category) => {
  console.log('Catégorie sélectionnée:', category)
}
</script>

Sélection d'outils utiles et comparaisons pour optimiser le workflow : Claude Code, MCP, TUI tools, bookmarks essentiels.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>