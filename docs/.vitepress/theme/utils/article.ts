import matter from 'gray-matter'
import readingTime from 'reading-time'
import { globby } from 'globby'
import fs from 'fs/promises'
import path from 'path'

export interface ArticleFrontmatter {
  title: string
  date: string
  tags?: string[]
  author?: string
  excerpt?: string
  cover?: string
  category?: string
  readingTime?: number
}

export interface Article extends ArticleFrontmatter {
  url: string
  content: string
}

export interface TableOfContentsItem {
  level: number
  title: string
  id: string
  children?: TableOfContentsItem[]
}

/**
 * Calcule le temps de lecture d'un texte
 */
export function calculateReadingTime(content: string): number {
  const stats = readingTime(content, {
    wordsPerMinute: 200, // Vitesse moyenne en français
  })
  return Math.ceil(stats.minutes)
}

/**
 * Extrait la table des matières d'un contenu markdown
 */
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: TableOfContentsItem[] = []
  const stack: TableOfContentsItem[] = []

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    const item: TableOfContentsItem = { level, title, id }

    // Trouve le parent approprié
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }

    if (stack.length === 0) {
      toc.push(item)
    } else {
      const parent = stack[stack.length - 1]
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(item)
    }

    stack.push(item)
  }

  return toc
}

/**
 * Récupère tous les articles d'un dossier
 */
export async function getAllArticles(articlesPath: string): Promise<Article[]> {
  const articleFiles = await globby(['**/*.md'], {
    cwd: articlesPath,
    ignore: ['**/index.md', '**/README.md']
  })

  const articles: Article[] = []

  for (const file of articleFiles) {
    const filePath = path.join(articlesPath, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data, content: markdownContent } = matter(content)

    // Calcule le temps de lecture si non défini
    if (!data.readingTime) {
      data.readingTime = calculateReadingTime(markdownContent)
    }

    // Extrait la catégorie du chemin si non définie
    if (!data.category) {
      const pathParts = file.split('/')
      if (pathParts.length > 1) {
        data.category = pathParts[0]
      }
    }

    const url = `/articles/${file.replace(/\.md$/, '')}`

    articles.push({
      ...data as ArticleFrontmatter,
      url,
      content: markdownContent
    })
  }

  return articles
}

/**
 * Groupe les articles par catégorie
 */
export function groupArticlesByCategory(articles: Article[]): Record<string, Article[]> {
  const grouped: Record<string, Article[]> = {}

  for (const article of articles) {
    const category = article.category || 'non-categorise'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(article)
  }

  // Trie les articles dans chaque catégorie par date
  for (const category in grouped) {
    grouped[category].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  return grouped
}

/**
 * Extrait tous les tags uniques avec leur nombre d'occurrences
 */
export function extractAllTags(articles: Article[]): Record<string, number> {
  const tagCounts: Record<string, number> = {}

  for (const article of articles) {
    if (article.tags) {
      for (const tag of article.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    }
  }

  return tagCounts
}

/**
 * Récupère les articles par tag
 */
export function getArticlesByTag(articles: Article[], tag: string): Article[] {
  return articles
    .filter(article => article.tags?.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Formate le nom d'une catégorie pour l'affichage
 */
export function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Génère un excerpt à partir du contenu si non fourni
 */
export function generateExcerpt(content: string, length: number = 160): string {
  // Retire les balises markdown courantes
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/[*_~`]/g, '') // Emphasis
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/`[^`]+`/g, '') // Inline code
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
    .replace(/\n+/g, ' ') // Newlines
    .trim()

  if (cleanContent.length <= length) {
    return cleanContent
  }

  return cleanContent.substring(0, length).trim() + '...'
}