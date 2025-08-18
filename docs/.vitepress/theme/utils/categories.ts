import fs from 'fs'
import path from 'path'
import { categoriesMetadata, categoriesMetadataMap, type CategoryMetadata } from '../data/categories'
import articlesData from '../data/articles.json'

/**
 * Interface pour un élément de navigation des catégories
 */
export interface CategoryNavItem {
  text: string
  link: string
}

/**
 * Interface pour les statistiques d'une catégorie
 */
export interface CategoryStats {
  count: number
  latest: string
}

/**
 * Extrait toutes les catégories utilisées dans les articles
 * et les combine avec les métadonnées définies
 */
export function getActiveCategories(): CategoryMetadata[] {
  // Récupérer les catégories utilisées dans les articles
  const usedCategories = new Set<string>()
  
  articlesData.forEach(article => {
    if (article.category) {
      usedCategories.add(article.category)
    }
  })

  // Filtrer les métadonnées pour ne garder que les catégories utilisées
  const activeCategories = categoriesMetadata.filter(category => 
    usedCategories.has(category.id)
  )

  // Trier alphabétiquement par label
  return activeCategories.sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

/**
 * Récupère toutes les catégories (même celles sans articles)
 * Utile pour les scripts de maintenance
 */
export function getAllCategories(): CategoryMetadata[] {
  return [...categoriesMetadata].sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

/**
 * Génère les éléments de navigation pour les catégories actives
 */
export function getCategoryNavItems(): CategoryNavItem[] {
  return getActiveCategories().map(category => ({
    text: category.label,
    link: `/articles/${category.id}/`
  }))
}

/**
 * Récupère les métadonnées d'une catégorie par son ID
 */
export function getCategoryMetadata(categoryId: string): CategoryMetadata | undefined {
  return categoriesMetadataMap.get(categoryId)
}

/**
 * Vérifie si une catégorie existe dans les métadonnées
 */
export function categoryExists(categoryId: string): boolean {
  return categoriesMetadataMap.has(categoryId)
}

/**
 * Récupère les statistiques des catégories (nombre d'articles, dernier article)
 */
export function getCategoryStats(): Record<string, CategoryStats> {
  const stats: Record<string, CategoryStats> = {}
  
  articlesData.forEach(article => {
    const categoryId = article.category || 'non-categorise'
    
    if (!stats[categoryId]) {
      stats[categoryId] = { count: 0, latest: article.date }
    }
    
    stats[categoryId].count++
    
    if (new Date(article.date) > new Date(stats[categoryId].latest)) {
      stats[categoryId].latest = article.date
    }
  })
  
  return stats
}

/**
 * Vérifie si un dossier de catégorie existe physiquement
 */
export function categoryDirectoryExists(categoryId: string): boolean {
  const categoryPath = path.resolve(process.cwd(), 'docs', 'articles', categoryId)
  return fs.existsSync(categoryPath)
}

/**
 * Ajoute une nouvelle catégorie aux métadonnées
 * Fonction utilitaire pour les scripts
 */
export function addCategoryMetadata(categoryId: string, label: string, description?: string): CategoryMetadata {
  const newCategory: CategoryMetadata = {
    id: categoryId,
    label,
    description
  }
  
  // Cette fonction est principalement pour l'usage dans les scripts
  // Le fichier categories.ts devra être mis à jour manuellement ou par script
  return newCategory
}