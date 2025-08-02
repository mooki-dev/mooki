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
  - title: Guides
    details: Tutoriels détaillés et pas-à-pas pour maîtriser les technologies
    link: /articles/guides/
  - title: Configurations
    details: Setups, configs et personnalisations d'outils et environnements
    link: /articles/configurations/
  - title: Outils
    details: Sélection d'outils utiles et comparaisons pour optimiser le workflow
    link: /articles/outils/
  - title: Méthodes
    details: Pratiques, méthodologies et processus de développement
    link: /articles/methodes/
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
  <div class="category-card" @click="navigateToCategory('guides')">
    <h3>Guides</h3>
    <p>Tutorials Spring, Docker, Kubernetes, Linux...</p>
  </div>
  
  <div class="category-card" @click="navigateToCategory('configurations')">
    <h3>Configurations</h3>
    <p>Hyprland, Neovim, Arch, Docker Compose...</p>
  </div>
  
  <div class="category-card" @click="navigateToCategory('outils')">
    <h3>Outils</h3>
    <p>Claude Code, MCP, TUI tools, bookmarks...</p>
  </div>
  
  <div class="category-card" @click="navigateToCategory('methodes')">
    <h3>Méthodes</h3>
    <p>Agile, Scrum, estimation, spécifications...</p>
  </div>
  
  <div class="category-card" @click="navigateToCategory('reflexions')">
    <h3>Réflexions</h3>
    <p>Clean Code, SOLID, performance vs fonctionnel...</p>
  </div>
  
  <div class="category-card" @click="navigateToCategory('projets')">
    <h3>Projets</h3>
    <p>Starters, templates, auto-hébergement...</p>
  </div>

  <div class="category-card" @click="navigateToCategory('productivite')">
    <h3>Productivité</h3>
    <p>Focus, gestion du temps, outils de productivité...</p>
  </div>
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