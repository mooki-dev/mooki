---
title: Guides
description: Tutorials détaillés et pas-à-pas pour maîtriser les technologies
---

# Guides

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { loadArticles, getArticlesByCategory } = useArticles()
const router = useRouter()

const articles = getArticlesByCategory('guides')

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

Tutorials détaillés et pas-à-pas pour maîtriser les technologies : Spring Boot, Docker, Kubernetes, Linux et bien plus.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>