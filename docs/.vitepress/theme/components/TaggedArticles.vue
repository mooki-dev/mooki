<template>
  <div class="tagged-articles" ref="taggedArticlesContainer">
    <div class="tag-header">
      <h2 class="tag-title">
        Articles tagués "{{ tag }}"
        <span class="article-count">({{ articles.length }} article{{ articles.length > 1 ? 's' : '' }})</span>
      </h2>
      <p class="tag-description" v-if="description">{{ description }}</p>
    </div>
    
    <template v-if="articles.length > 0">
      <div class="articles-grid">
        <ArticleCard
          v-for="article in paginatedArticles"
          :key="article.url"
          :article="article"
          @tag-click="$emit('tag-click', $event)"
        />
      </div>

      <div class="articles-info">
        <p class="articles-count">
          {{ articles.length }} article{{ articles.length > 1 ? 's' : '' }}
          <span v-if="totalPages > 1"> - Page {{ currentPage }} sur {{ totalPages }}</span>
        </p>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ← Précédent
        </button>
        
        <div class="pagination-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-number"
            :class="{ active: page === currentPage }"
            :disabled="page === -1"
            @click="page !== -1 && goToPage(page)"
          >
            {{ page === -1 ? '...' : page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Suivant →
        </button>
      </div>
    </template>
    
    <div class="no-articles" v-else>
      <p>Aucun article trouvé pour le tag "{{ tag }}".</p>
      <span @click="navigateToAllArticles" class="browse-link">
        Parcourir tous les articles →
      </span>
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
import { computed, ref, watch } from 'vue'
import { useRouter, withBase } from 'vitepress'
import ArticleCard from './ArticleCard.vue'

const router = useRouter()

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12 // Nombre d'articles par page
const taggedArticlesContainer = ref<HTMLElement>()

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

// Pagination logic
const totalPages = computed(() => 
  Math.ceil(props.articles.length / itemsPerPage)
)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.articles.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1)
      pages.push(total)
    }
  }
  
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll vers le début de la liste d'articles après le re-render
    setTimeout(() => {
      if (taggedArticlesContainer.value) {
        taggedArticlesContainer.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }
}

// Navigation vers tous les articles
const navigateToAllArticles = () => {
  router.go(withBase('/articles/'))
}

// Réinitialiser la page quand le tag change
watch(() => props.tag, () => {
  currentPage.value = 1
})

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
  cursor: pointer;
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

.articles-info {
  text-align: center;
  margin: 1.5rem 0;
}

.articles-count {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.pagination-btn {
  display: flex;
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
}

.pagination-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.pagination-number.active {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: white;
}

.pagination-number:disabled {
  cursor: default;
  border-color: transparent;
  background: transparent;
  color: var(--vp-c-text-3);
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
  
  .pagination {
    gap: 0.5rem;
  }
  
  .pagination-numbers {
    gap: 0.25rem;
  }
}
</style>