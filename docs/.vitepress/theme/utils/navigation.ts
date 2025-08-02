/**
 * Utilitaires de navigation pour les tags et catégories
 */

export function navigateToTag(tag: string) {
  window.location.href = `/tags/?tag=${encodeURIComponent(tag)}`
}

export function navigateToCategory(category: string) {
  window.location.href = `/articles/${category}/`
}

export function navigateToArticle(url: string) {
  window.location.href = url
}

export function getTagFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('tag')
}

export function getCategoryFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const pathParts = window.location.pathname.split('/')
  // Format: /articles/[category]/
  if (pathParts.length >= 3 && pathParts[1] === 'articles') {
    return pathParts[2] || null
  }
  
  return null
}