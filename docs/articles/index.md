---
title: Tous les articles
description: Liste complète des articles du blog mooki
---

# Tous les articles

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { articles, loadArticles } = useArticles()
const router = useRouter()

onMounted(async () => {
  await loadArticles()
})

const handleTagClick = (tag) => {
  // Navigation SPA vers la page tags avec le tag préchargé
  router.go(withBase(`/tags/?tag=${tag}`))
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