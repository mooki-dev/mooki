---
title: Productivité
description: Techniques et méthodes pour optimiser sa productivité en développement
---

# Productivité

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'

const { loadArticles, getArticlesByCategory } = useArticles()

const articles = getArticlesByCategory('productivite')

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

Techniques et méthodes pour optimiser sa productivité en développement : gestion du temps, focus, organisation et bien-être au travail.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>