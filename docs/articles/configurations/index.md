---
title: Configurations
description: Setups, configs et personnalisations d'outils et environnements
---

# Configurations

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'

const { loadArticles, getArticlesByCategory } = useArticles()

const articles = getArticlesByCategory('configurations')

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

Setups, configs et personnalisations d'outils et environnements : Hyprland, Neovim, Arch, Docker Compose et plus.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>