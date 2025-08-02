/**
 * Utilitaires de navigation pour les tags et catégories
 */
import { withBase } from 'vitepress'

export function navigateToTag(tag: string) {
  window.location.href = withBase(`tags/?tag=${encodeURIComponent(tag)}`)
}

export function navigateToCategory(category: string) {
  window.location.href = withBase(`articles/${category}/`)
}

export function navigateToArticle(url: string) {
  // Si l'URL commence déjà par le base, ne pas l'ajouter
  if (url.startsWith('/mooki/') || url.startsWith('http')) {
    window.location.href = url
  } else {
    window.location.href = withBase(url)
  }
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