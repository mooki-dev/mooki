---
title: Tutoriels
description: Apprentissage technique step-by-step pour maîtriser les technologies modernes
---

# Tutoriels

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { loadArticles, getArticlesByCategory } = useArticles()
const router = useRouter()

const articles = getArticlesByCategory('tutoriels')

onMounted(async () => {
  await loadArticles()
})

const handleTagClick = (tag) => {
  router.go(withBase(`/tags/?tag=${tag}`))
}

const handleCategoryChange = (category) => {
  console.log('Catégorie sélectionnée:', category)
}
</script>

Guides d'apprentissage technique step-by-step : Docker, Kubernetes, Spring Boot, React, FastAPI et architectures modernes.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>