import { ref, computed } from 'vue'
import articlesData from '../data/articles.js'

export interface Article {
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

const articles = ref<Article[]>([])
const isLoaded = ref(false)

export function useArticles() {
  const loadArticles = async () => {
    if (!isLoaded.value) {
      articles.value = articlesData
      isLoaded.value = true
    }
  }

  const getRecentArticles = (limit: number = 5) => {
    return computed(() => 
      articles.value
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
    )
  }

  const getArticlesByCategory = (category: string) => {
    return computed(() =>
      articles.value
        .filter(article => article.category === category)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
  }

  const getArticlesByTag = (tag: string) => {
    return computed(() =>
      articles.value
        .filter(article => article.tags?.includes(tag))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
  }

  const getAllTags = () => {
    return computed(() => {
      const tagCounts: Record<string, number> = {}
      
      articles.value.forEach(article => {
        if (article.tags) {
          article.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })
      
      return tagCounts
    })
  }

  const getCategoryStats = () => {
    return computed(() => {
      const stats: Record<string, { count: number; latest: string }> = {}
      
      articles.value.forEach(article => {
        const category = article.category || 'non-categorise'
        
        if (!stats[category]) {
          stats[category] = { count: 0, latest: article.date }
        }
        
        stats[category].count++
        
        if (new Date(article.date) > new Date(stats[category].latest)) {
          stats[category].latest = article.date
        }
      })
      
      return stats
    })
  }

  const searchArticles = (query: string) => {
    return computed(() => {
      const lowerQuery = query.toLowerCase()
      
      return articles.value.filter(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    })
  }

  return {
    articles: computed(() => articles.value),
    isLoaded: computed(() => isLoaded.value),
    loadArticles,
    getRecentArticles,
    getArticlesByCategory,
    getArticlesByTag,
    getAllTags,
    getCategoryStats,
    searchArticles
  }
}