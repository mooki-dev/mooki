---
title: Méthodes
description: Pratiques, méthodologies et processus de développement
---

# Méthodes

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'

const { loadArticles, getArticlesByCategory } = useArticles()

const articles = getArticlesByCategory('methodes')

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

Pratiques, méthodologies et processus de développement : Agile, Scrum, estimation, spécifications techniques.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>