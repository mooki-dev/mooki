#!/usr/bin/env node

import { Feed } from 'feed'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { globby } from 'globby'

const SITE_URL = 'https://votre-domaine.com'
const AUTHOR = {
  name: 'mooki',
  email: 'contact@votre-domaine.com',
  link: SITE_URL
}

async function generateRSSFeed() {
  const feed = new Feed({
    title: 'mooki - Blog technique',
    description: 'Blog technique sur le développement, DevOps, architecture et bien plus',
    id: SITE_URL,
    link: SITE_URL,
    language: 'fr-FR',
    image: `${SITE_URL}/logo.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `Tous droits réservés ${new Date().getFullYear()}, mooki`,
    updated: new Date(),
    generator: 'VitePress RSS Generator',
    feedLinks: {
      rss2: `${SITE_URL}/rss.xml`,
      json: `${SITE_URL}/feed.json`,
      atom: `${SITE_URL}/atom.xml`
    },
    author: AUTHOR
  })

  // Trouver tous les articles
  const articlesPath = path.resolve(process.cwd(), 'docs/articles')
  const articleFiles = await globby(['**/*.md'], {
    cwd: articlesPath,
    ignore: ['**/index.md']
  })

  const articles = []

  for (const file of articleFiles) {
    const filePath = path.join(articlesPath, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data, content: markdownContent } = matter(content)

    if (data.title && data.date) {
      const url = `${SITE_URL}/articles/${file.replace(/\.md$/, '')}`
      
      articles.push({
        title: data.title,
        date: new Date(data.date),
        description: data.excerpt || generateExcerpt(markdownContent),
        content: markdownContent,
        url,
        category: data.category ? [{ name: formatCategoryName(data.category) }] : [],
        author: [AUTHOR],
        tags: data.tags || []
      })
    }
  }

  // Trier par date (plus récent en premier)
  articles.sort((a, b) => b.date.getTime() - a.date.getTime())

  // Ajouter les articles au feed (limiter à 20 pour éviter un feed trop lourd)
  articles.slice(0, 20).forEach(article => {
    feed.addItem({
      title: article.title,
      id: article.url,
      link: article.url,
      description: article.description,
      content: article.content,
      author: article.author,
      date: article.date,
      category: article.category
    })
  })

  // Créer le dossier de sortie s'il n'existe pas
  const outputDir = path.resolve(process.cwd(), 'docs/.vitepress/dist')
  await fs.mkdir(outputDir, { recursive: true })

  // Générer les différents formats
  await fs.writeFile(path.join(outputDir, 'rss.xml'), feed.rss2())
  await fs.writeFile(path.join(outputDir, 'atom.xml'), feed.atom1())
  await fs.writeFile(path.join(outputDir, 'feed.json'), feed.json1())

  console.log(`✅ Flux RSS généré avec ${articles.length} articles`)
  console.log(`   - RSS 2.0: /rss.xml`)
  console.log(`   - Atom 1.0: /atom.xml`)
  console.log(`   - JSON Feed: /feed.json`)
}

function generateExcerpt(content, length = 160) {
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (cleanContent.length <= length) {
    return cleanContent
  }

  return cleanContent.substring(0, length).trim() + '...'
}

function formatCategoryName(category) {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRSSFeed().catch(console.error)
}

export { generateRSSFeed }