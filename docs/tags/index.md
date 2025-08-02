---
title: Tags
description: Explorez les articles par tags
---

# Tags

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useArticles } from '../.vitepress/theme/composables/useArticles'

const { loadArticles, getAllTags, getArticlesByTag, articles } = useArticles()

const allTags = getAllTags()
const selectedTag = ref('')
const showTaggedArticles = ref(false)

onMounted(async () => {
  await loadArticles()
  
  // Vérifier si un tag est passé en paramètre d'URL
  const urlParams = new URLSearchParams(window.location.search)
  const tagParam = urlParams.get('tag')
  
  if (tagParam) {
    handleTagClick(tagParam)
  }
})

const selectedTagArticles = computed(() => {
  if (!selectedTag.value) return []
  return getArticlesByTag(selectedTag.value).value
})

const handleTagClick = (tag) => {
  selectedTag.value = tag
  showTaggedArticles.value = true
  
  // Smooth scroll vers la section des articles
  setTimeout(() => {
    const element = document.getElementById('tagged-articles-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

const backToAllTags = () => {
  selectedTag.value = ''
  showTaggedArticles.value = false
  
  // Scroll vers le haut
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const sortedTagEntries = computed(() => {
  return Object.entries(allTags.value)
    .sort(([,a], [,b]) => b - a) // Tri par nombre d'articles décroissant
})
</script>

<div class="tags-overview" v-show="!showTaggedArticles">
  <TagCloud 
    :tags="allTags" 
    title="Tous les tags"
    :max-tags="50"
    sort-by="count"
    @tag-click="handleTagClick"
  />

  <div class="tags-list-section">
    <h2>Liste complète des tags</h2>
    <div class="tags-list">
    <div 
      v-for="[tag, count] in sortedTagEntries" 
      :key="tag" 
      class="tag-section"
      @click="handleTagClick(tag)"
    >
      <h3 class="tag-title">
        #{{ tag }} 
        <span class="tag-count">({{ count }} article{{ count > 1 ? 's' : '' }})</span>
      </h3>
      <p class="tag-preview">
        Cliquez pour voir les articles
      </p>
    </div>
  </div>
</div>
</div>

<div id="tagged-articles-section" v-show="showTaggedArticles">
  <div class="back-navigation">
    <button @click="backToAllTags" class="back-btn">
      ← Retour à tous les tags
    </button>
  </div>
  
  <TaggedArticles 
    :tag="selectedTag"
    :articles="selectedTagArticles"
    :all-tags="allTags"
    @tag-click="handleTagClick"
  />
</div>

<style scoped>
.tags-overview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tags-list-section h2 {
  margin-top: 3rem;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tags-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.tag-section {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand);
}

.tag-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.tag-preview {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.back-navigation {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  padding: 0 1rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.back-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  transform: translateX(-2px);
}

@media (max-width: 768px) {
  .tags-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .tag-section {
    padding: 1rem;
  }
}
</style>