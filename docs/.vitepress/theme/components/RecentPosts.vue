<template>
  <div class="recent-posts">
    <h3 class="recent-posts-title">
      {{ title }}
    </h3>
    <div class="posts-list">
      <article 
        v-for="post in recentPosts" 
        :key="post.url"
        class="post-item"
        @click="navigateToPost(post.url)"
      >
        <div class="post-meta">
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          <span class="reading-time" v-if="post.readingTime">
            {{ post.readingTime }} min
          </span>
        </div>
        <h4 class="post-title">{{ post.title }}</h4>
        <div class="post-tags" v-if="post.tags && post.tags.length">
          <span 
            v-for="tag in post.tags.slice(0, 2)" 
            :key="tag"
            class="post-tag"
          >
            #{{ tag }}
          </span>
        </div>
      </article>
    </div>
    <div class="view-all" v-if="showViewAll">
      <a :href="viewAllLink" class="view-all-link">
        Voir tous les articles →
      </a>
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
  tags?: string[]
  readingTime?: number
}

const props = withDefaults(defineProps<{
  posts: Post[]
  limit?: number
  title?: string
  showViewAll?: boolean
  viewAllLink?: string
}>(), {
  limit: 5,
  title: 'Articles Récents',
  showViewAll: true,
  viewAllLink: '/articles/'
})

const router = useRouter()

const recentPosts = computed(() => {
  return [...props.posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, props.limit)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return "Aujourd'hui"
  } else if (diffDays === 1) {
    return "Hier"
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `Il y a ${months} mois`
  } else {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }
}

const navigateToPost = (url: string) => {
  router.go(withBase(url))
}
</script>

<style scoped>
.recent-posts {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1.5rem;
}

.recent-posts-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-item:hover {
  border-color: var(--vp-c-brand);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
}

.reading-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.reading-time::before {
  content: "•";
  color: var(--vp-c-text-3);
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.post-tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 12px;
  white-space: nowrap;
}

.view-all {
  margin-top: 1.25rem;
  text-align: center;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--vp-c-brand);
  font-weight: 500;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: gap 0.2s ease;
}

.view-all-link:hover {
  gap: 0.625rem;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .recent-posts {
    padding: 1rem;
  }
  
  .post-item {
    padding: 0.75rem;
  }
  
  .post-title {
    font-size: 0.9375rem;
  }
}
</style>