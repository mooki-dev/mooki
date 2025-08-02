/**
 * Utilitaires de navigation pour les tags et catégories
 */
import { withBase } from 'vitepress'

export function navigateToTag(tag: string, router: any) {
  router.go(withBase(`/tags/?tag=${encodeURIComponent(tag)}`))
}

export function navigateToCategory(category: string, router: any) {
  router.go(withBase(`/articles/${category}/`))
}


export function getTagFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('tag')
}

export function getCategoryFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const pathParts = window.location.pathname.split('/')
  // Format: /mooki/articles/[category]/ ou /articles/[category]/
  const articlesIndex = pathParts.indexOf('articles')
  if (articlesIndex !== -1 && pathParts.length > articlesIndex + 1) {
    return pathParts[articlesIndex + 1] || null
  }

  return null
}