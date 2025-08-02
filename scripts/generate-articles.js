#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { globby } from 'globby'
import readingTime from 'reading-time'

/**
 * Générateur automatique d'articles
 * Scan le dossier articles/ et génère automatiquement les métadonnées
 */

const ARTICLES_DIR = 'docs/articles'
const OUTPUT_FILE = 'docs/.vitepress/theme/data/articles.json'

/**
 * Calcule le temps de lecture d'un contenu
 */
function calculateReadingTime(content) {
  const stats = readingTime(content, {
    wordsPerMinute: 200 // Vitesse moyenne en français
  })
  return Math.ceil(stats.minutes)
}

/**
 * Extrait la catégorie depuis le chemin du fichier
 */
function extractCategoryFromPath(filePath) {
  const pathParts = filePath.split('/')
  // Format attendu: articles/[category]/[file].md
  if (pathParts.length >= 2) {
    return pathParts[pathParts.length - 2] // Avant-dernier élément
  }
  return 'non-categorise'
}

/**
 * Génère l'URL de l'article basée sur le chemin du fichier
 */
function generateArticleUrl(filePath) {
  // Retire l'extension .md et ajoute le préfixe /articles/
  const urlPath = filePath.replace(/\.md$/, '')
  return `/articles/${urlPath}`
}

/**
 * Génère un excerpt à partir du contenu si non fourni
 */
function generateExcerpt(content, length = 160) {
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

/**
 * Traite un fichier article et extrait ses métadonnées
 */
async function processArticleFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), ARTICLES_DIR, filePath)
    const content = await fs.readFile(fullPath, 'utf-8')
    const { data: frontmatter, content: markdownContent } = matter(content)

    // Métadonnées obligatoires
    if (!frontmatter.title) {
      console.warn(`⚠️  Article sans titre: ${filePath}`)
      return null
    }

    if (!frontmatter.date) {
      console.warn(`⚠️  Article sans date: ${filePath}`)
      return null
    }

    // Construire l'objet article
    const article = {
      title: frontmatter.title,
      date: frontmatter.date.toISOString ? frontmatter.date.toISOString().split('T')[0] : frontmatter.date,
      excerpt: frontmatter.excerpt || generateExcerpt(markdownContent),
      tags: frontmatter.tags || [],
      cover: frontmatter.cover || null,
      readingTime: frontmatter.readingTime || calculateReadingTime(markdownContent),
      url: generateArticleUrl(filePath),
      category: frontmatter.category || extractCategoryFromPath(filePath),
      author: frontmatter.author || 'mooki'
    }

    return article
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message)
    return null
  }
}

/**
 * Génère automatiquement tous les articles
 */
async function generateArticles() {
  console.log('🔍 Scan des articles dans', ARTICLES_DIR)

  try {
    // Trouve tous les fichiers .md sauf les index
    const articleFiles = await globby(['**/*.md'], {
      cwd: ARTICLES_DIR,
      ignore: ['**/index.md', '**/README.md']
    })

    console.log(`📝 ${articleFiles.length} fichiers d'articles trouvés`)

    // Traite chaque fichier
    const articles = []
    for (const file of articleFiles) {
      const article = await processArticleFile(file)
      if (article) {
        articles.push(article)
        console.log(`✅ ${article.title} (${article.category})`)
      }
    }

    // Trie par date décroissante
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Assure que le dossier de destination existe
    const outputDir = path.dirname(OUTPUT_FILE)
    await fs.mkdir(outputDir, { recursive: true })

    // Écrit le fichier de sortie
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(articles, null, 2),
      'utf-8'
    )

    console.log(`📦 ${articles.length} articles générés dans ${OUTPUT_FILE}`)
    
    // Statistiques par catégorie
    const categoryStats = articles.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Statistiques par catégorie:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} article${count > 1 ? 's' : ''}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    process.exit(1)
  }
}

// Exécute le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateArticles()
}

export { generateArticles }