---
layout: home

hero:
  name: "mooki"
  text: "Base de connaissances technique"
  tagline: "Articles, guides, configurations et réflexions sur le développement, l'infrastructure et les méthodes de travail"
  image:
    src: /hero-image.png
    alt: mooki
  actions:
    - theme: brand
      text: Derniers Articles
      link: /articles/
    - theme: alt
      text: Catégories
      link: /#categories

features:
  - title: DevOps
    details: CI/CD, conteneurisation, monitoring et déploiement
    link: /articles/devops/
  - title: Backend
    details: APIs, microservices, bases de données et technologies serveur
    link: /articles/backend/
  - title: Linux
    details: Configuration système, outils en ligne de commande et administration Linux
    link: /articles/linux/
  - title: Architecture
    details: Patterns architecturaux, conception logicielle et principes de développement
    link: /articles/software-design-architecture/
---

<script setup>
import { onMounted } from 'vue'
import { useArticles } from './.vitepress/theme/composables/useArticles'
import { useRouter, withBase } from 'vitepress'

const { loadArticles, getRecentArticles, getAllTags, getCategoryStats } = useArticles()
const router = useRouter()

const recentArticles = getRecentArticles(5)
const popularTags = getAllTags()
const categoryStats = getCategoryStats()

onMounted(async () => {
  await loadArticles()
})

const handleTagClick = (tag) => {
  // Navigation SPA vers la page tags avec le tag préchargé
  router.go(withBase(`/tags/?tag=${tag}`))
}

const navigateToCategory = (category) => {
  // Navigation SPA vers la catégorie
  router.go(withBase(`/articles/${category}/`))
}
</script>

## Articles Récents

<RecentPosts :posts="recentArticles" :limit="5" title="" />

## Catégories {#categories}

<div class="categories-grid">

  <!-- <div class="category-card" @click="navigateToCategory('ai')">
    <h3>IA</h3>
    <p>Intelligence artificielle, outils d'IA et automatisation pour développeurs</p>
  </div> -->

<div class="category-card" @click="navigateToCategory('backend')">
    <h3>Backend</h3>
    <p>APIs, microservices, bases de données et technologies serveur</p>
  </div>

  <div class="category-card" @click="navigateToCategory('devops')">
    <h3>DevOps</h3>
    <p>CI/CD, conteneurisation, monitoring et déploiement</p>
  </div>

  <!-- <div class="category-card" @click="navigateToCategory('frontend')">
    <h3>Frontend</h3>
    <p>Interfaces utilisateur, frameworks frontend et expérience utilisateur</p>
  </div> -->

  <div class="category-card" @click="navigateToCategory('linux')">
    <h3>Linux</h3>
    <p>Configuration système, outils en ligne de commande et administration Linux</p>
  </div>

  <!-- <div class="category-card" @click="navigateToCategory('security')">
    <h3>Sécurité</h3>
    <p>Sécurité informatique, bonnes pratiques et défense</p>
  </div> -->

  <div class="category-card" @click="navigateToCategory('software-design-architecture')">
    <h3>Conception et Architecture Logicielle</h3>
    <p>Patterns architecturaux, conception logicielle et principes de développement</p>
  </div>

  <!-- <div class="category-card" @click="navigateToCategory('ux-design')">
    <h3>UX/UI Design</h3>
    <p>Expérience utilisateur, interfaces et design d'interaction</p>
  </div> -->

</div>


## Tags Populaires

<TagCloud :tags="popularTags" :max-tags="20" @tag-click="handleTagClick" />

<style scoped>
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.category-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid var(--vp-c-divider);
  display: block;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand);
}


.category-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.category-card p {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>
