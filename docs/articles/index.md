---
title: Tous les articles
description: Liste complète des articles du blog mooki
---

# Tous les articles

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../.vitepress/theme/composables/useArticles'

const { articles, loadArticles } = useArticles()

onMounted(async () => {
  await loadArticles()
})

const handleTagClick = (tag) => {
  // Navigation vers la page tags avec le tag préchargé
  window.location.href = `/tags/?tag=${tag}`
}

const handleCategoryChange = (category) => {
  // Logique de filtrage par catégorie
  console.log('Catégorie sélectionnée:', category)
}
</script>

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>