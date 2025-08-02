---
title: Productivité
description: Techniques et méthodes pour optimiser sa productivité en développement
---

# Productivité

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { loadArticles, getArticlesByCategory } = useArticles()
const router = useRouter()

const articles = getArticlesByCategory('productivite')

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

Techniques et méthodes pour optimiser sa productivité en développement : gestion du temps, focus, organisation et bien-être au travail.

<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>