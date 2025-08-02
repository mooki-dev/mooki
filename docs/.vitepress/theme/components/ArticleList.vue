<template>
  <div class="article-list-container">
    <div class="filters" v-if="showFilters">
      <div class="filter-group">
        <label for="sort-select">Trier par :</label>
        <select id="sort-select" v-model="sortBy" @change="handleSort">
          <option value="date">Date</option>
          <option value="title">Titre</option>
          <option value="readingTime">Temps de lecture</option>
        </select>
      </div>
      
      <div class="filter-group" v-if="availableCategories.length > 0">
        <label for="category-select">Catégorie :</label>
        <select id="category-select" v-model="selectedCategory" @change="handleFilter">
          <option value="">Toutes</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ formatCategoryName(cat) }}
          </option>
        </select>
      </div>
    </div>

    <div class="article-grid">
      <ArticleCard
        v-for="article in paginatedArticles"
        :key="article.url"
        :article="article"
        @tag-click="handleTagClick"
      />
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
          @click="goToPage(page)"
        >
          {{ page }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
}

const props = withDefaults(defineProps<{
  articles: Article[]
  itemsPerPage?: number
  showFilters?: boolean
}>(), {
  itemsPerPage: 10,
  showFilters: true
})

const emit = defineEmits<{
  'tag-click': [tag: string]
  'category-change': [category: string]
}>()

const currentPage = ref(1)
const sortBy = ref<'date' | 'title' | 'readingTime'>('date')
const selectedCategory = ref('')

const filteredArticles = computed(() => {
  let filtered = [...props.articles]
  
  if (selectedCategory.value) {
    filtered = filtered.filter(article => article.category === selectedCategory.value)
  }
  
  // Tri
  switch (sortBy.value) {
    case 'date':
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      break
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
      break
    case 'readingTime':
      filtered.sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0))
      break
  }
  
  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredArticles.value.length / props.itemsPerPage)
)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredArticles.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // ellipsis
      pages.push(total)
    } else if (current >= total - 2) {
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

const availableCategories = computed(() => {
  const categories = new Set<string>()
  props.articles.forEach(article => {
    if (article.category) {
      categories.add(article.category)
    }
  })
  return Array.from(categories).sort()
})

const formatCategoryName = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSort = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
  emit('category-change', selectedCategory.value)
}

const handleTagClick = (tag: string) => {
  emit('tag-click', tag)
}

watch(() => props.articles, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.article-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.filter-group select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-group select:hover {
  border-color: var(--vp-c-brand);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
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
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.pagination-number:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
}

.pagination-number.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.pagination-number:disabled {
  cursor: default;
  border: none;
  background: transparent;
}

@media (max-width: 768px) {
  .article-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-group select {
    flex: 1;
    max-width: 200px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .pagination-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>