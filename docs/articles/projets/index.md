---
title: Projets
description: Templates, starters et projets d'auto-hébergement
---

# Projets

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'

const { loadArticles, getArticlesByCategory } = useArticles()

const articles = getArticlesByCategory('projets')

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

Templates, starters et projets d'auto-hébergement : Spring Boot starters, configurations Docker, setups de développement.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>