---
title: Backend
description: Découvrez des articles sur le développement backend, les architectures, les bases de données et les meilleures pratiques.
---

# Comparaisons

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../../.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { loadArticles, getArticlesByCategory } = useArticles()
const router = useRouter()

const articles = getArticlesByCategory('backend')

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

<ArticleList
  :articles="articles"
  :items-per-page="10"
  :show-filters="false"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>
