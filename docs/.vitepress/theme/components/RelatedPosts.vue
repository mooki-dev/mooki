<template>
  <div class="related-posts" v-if="relatedPosts.length > 0">
    <h3 class="related-posts-title">{{ title }}</h3>
    <div class="related-grid">
      <article 
        v-for="post in relatedPosts" 
        :key="post.url"
        class="related-item"
        @click="navigateToPost(post.url)"
      >
        <div class="related-image" v-if="post.cover">
          <img :src="post.cover" :alt="post.title" loading="lazy" />
        </div>
        <div class="related-content">
          <h4 class="related-title">{{ post.title }}</h4>
          <p class="related-excerpt">{{ post.excerpt }}</p>
          <div class="related-meta">
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            <span class="match-score" v-if="showScore && post.score">
              {{ Math.round(post.score * 100) }}% similaire
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, withBase } from 'vitepress'

interface Post {
  title: string
  date: string
  url: string
  excerpt: string
  tags?: string[]
  category?: string
  cover?: string
  score?: number
}

const props = withDefaults(defineProps<{
  currentPost: Post
  allPosts: Post[]
  limit?: number
  title?: string
  showScore?: boolean
}>(), {
  limit: 3,
  title: 'Articles Similaires',
  showScore: false
})

const router = useRouter()

const calculateSimilarity = (post1: Post, post2: Post): number => {
  let score = 0
  
  // Similarité par catégorie (40% du score)
  if (post1.category && post2.category && post1.category === post2.category) {
    score += 0.4
  }
  
  // Similarité par tags (50% du score)
  if (post1.tags && post2.tags) {
    const tags1 = new Set(post1.tags)
    const tags2 = new Set(post2.tags)
    const intersection = new Set([...tags1].filter(x => tags2.has(x)))
    const union = new Set([...tags1, ...tags2])
    
    if (union.size > 0) {
      const jaccardIndex = intersection.size / union.size
      score += jaccardIndex * 0.5
    }
  }
  
  // Proximité temporelle (10% du score)
  const date1 = new Date(post1.date).getTime()
  const date2 = new Date(post2.date).getTime()
  const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24)
  const timeScore = Math.max(0, 1 - (daysDiff / 365)) // Score décroissant sur 1 an
  score += timeScore * 0.1
  
  return score
}

const relatedPosts = computed(() => {
  const scoredPosts = props.allPosts
    .filter(post => post.url !== props.currentPost.url)
    .map(post => ({
      ...post,
      score: calculateSimilarity(props.currentPost, post)
    }))
    .filter(post => post.score > 0.1) // Seuil minimum de similarité
    .sort((a, b) => b.score - a.score)
    .slice(0, props.limit)
  
  return scoredPosts
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const navigateToPost = (url: string) => {
  router.go(withBase(url))
}
</script>

<style scoped>
.related-posts {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.related-posts-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.related-item {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--vp-c-divider);
}

.related-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand);
}

.related-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-item:hover .related-image img {
  transform: scale(1.05);
}

.related-content {
  padding: 1rem;
}

.related-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-excerpt {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

.match-score {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .related-posts {
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
  
  .related-posts-title {
    font-size: 1.25rem;
  }
}

/* Style pour quand il n'y a pas d'image */
.related-item:not(:has(.related-image)) .related-content {
  padding: 1.25rem;
}

.related-item:not(:has(.related-image)) .related-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.related-item:not(:has(.related-image)) .related-excerpt {
  -webkit-line-clamp: 3;
  margin-bottom: 1rem;
}
</style>