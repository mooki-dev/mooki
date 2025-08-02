---
title: Projets
description: Templates, starters et projets d'auto-hébergement
---

# Projets

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { loadArticles, getArticlesByCategory } = useArticles()
const router = useRouter()

const articles = getArticlesByCategory('projets')

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

Templates, starters et projets d'auto-hébergement : Spring Boot starters, configurations Docker, setups de développement.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>