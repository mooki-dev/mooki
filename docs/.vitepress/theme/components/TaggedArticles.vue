<template>
  <div class="tagged-articles">
    <div class="tag-header">
      <h2 class="tag-title">
        Articles tagués "{{ tag }}"
        <span class="article-count">({{ articles.length }} article{{ articles.length > 1 ? 's' : '' }})</span>
      </h2>
      <p class="tag-description" v-if="description">{{ description }}</p>
    </div>
    
    <div class="articles-grid" v-if="articles.length > 0">
      <ArticleCard
        v-for="article in articles"
        :key="article.url"
        :article="article"
        @tag-click="$emit('tag-click', $event)"
      />
    </div>
    
    <div class="no-articles" v-else>
      <p>Aucun article trouvé pour le tag "{{ tag }}".</p>
      <router-link to="/articles/" class="browse-link">
        Parcourir tous les articles →
      </router-link>
    </div>
    
    <div class="related-tags" v-if="relatedTags.length > 0">
      <h3>Tags associés</h3>
      <div class="tags-list">
        <button
          v-for="relatedTag in relatedTags"
          :key="relatedTag.name"
          class="related-tag"
          @click="$emit('tag-click', relatedTag.name)"
        >
          {{ relatedTag.name }} ({{ relatedTag.count }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ArticleCard from './ArticleCard.vue'

interface Article {
  title: string
  date: string
  excerpt: string
  tags?: string[]
  cover?: string
  readingTime?: number
  url: string
  category?: string
  author?: string
}

interface TagInfo {
  name: string
  count: number
}

const props = defineProps<{
  tag: string
  articles: Article[]
  allTags?: Record<string, number>
  description?: string
}>()

defineEmits<{
  'tag-click': [tag: string]
}>()

// Calculer les tags associés (tags qui apparaissent souvent avec le tag actuel)
const relatedTags = computed(() => {
  if (!props.allTags) return []
  
  const tagCounts: Record<string, number> = {}
  
  // Compter les co-occurrences de tags
  props.articles.forEach(article => {
    if (article.tags) {
      article.tags.forEach(articleTag => {
        if (articleTag !== props.tag) {
          tagCounts[articleTag] = (tagCounts[articleTag] || 0) + 1
        }
      })
    }
  })
  
  // Convertir en tableau et trier par fréquence
  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Limiter à 8 tags associés
})
</script>

<style scoped>
.tagged-articles {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.tag-header {
  margin-bottom: 2rem;
  text-align: center;
}

.tag-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.article-count {
  font-size: 1rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.tag-description {
  font-size: 1.125rem;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.no-articles {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-2);
}

.browse-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  transition: gap 0.2s ease;
}

.browse-link:hover {
  gap: 0.75rem;
  text-decoration: underline;
}

.related-tags {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.related-tags h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.related-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.related-tag:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .tagged-articles {
    padding: 1rem;
  }
  
  .tag-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>