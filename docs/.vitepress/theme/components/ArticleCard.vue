<template>
  <article class="article-card" @click="navigateToArticle">
    <div class="article-image" v-if="article.cover">
      <img :src="article.cover" :alt="article.title" loading="lazy" />
    </div>
    <div class="article-content">
      <div class="article-meta">
        <time :datetime="article.date">{{ formatDate(article.date) }}</time>
        <span class="reading-time">{{ article.readingTime }} min de lecture</span>
      </div>
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-excerpt">{{ article.excerpt }}</p>
      <div class="article-tags" v-if="article.tags && article.tags.length">
        <span 
          v-for="tag in article.tags.slice(0, 10)" 
          :key="tag"
          class="tag"
          @click.stop="$emit('tag-click', tag)"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, withBase } from 'vitepress'

interface Article {
  title: string
  date: string
  excerpt: string
  tags?: string[]
  cover?: string
  readingTime?: number
  url: string
}

const props = defineProps<{
  article: Article
}>()

const router = useRouter()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const navigateToArticle = () => {
  router.go(withBase(props.article.url))
}
</script>

<style scoped>
.article-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
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

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 16px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--vp-c-brand);
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .article-card {
    margin-bottom: 1rem;
  }
  
  .article-image {
    height: 150px;
  }
}
</style>