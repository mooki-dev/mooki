#!/usr/bin/env node

// import { generateSitemap } from 'sitemap-ts' - Remplacé par génération manuelle
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { globby } from 'globby'

const SITE_URL = process.env.SITE_URL || 'https://mooki-dev.github.io/mooki'

async function generateSitemapXML() {
  const urls = []

  // Pages statiques
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/articles/', changefreq: 'daily', priority: 0.9 },
    { url: '/tags/', changefreq: 'weekly', priority: 0.7 },
    { url: '/about', changefreq: 'monthly', priority: 0.6 }
  ]

  urls.push(...staticPages)

  // Articles
  const articlesPath = path.resolve(process.cwd(), 'docs/articles')
  const articleFiles = await globby(['**/*.md'], {
    cwd: articlesPath,
    ignore: ['**/index.md']
  })

  for (const file of articleFiles) {
    const filePath = path.join(articlesPath, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data } = matter(content)

    if (data.title && data.date) {
      const url = `/articles/${file.replace(/\.md$/, '')}`
      const lastmod = data.date ? new Date(data.date).toISOString() : undefined

      urls.push({
        url,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod
      })
    }
  }

  // Catégories
  const categories = [
    'guides',
    'configurations',
    'outils',
    'methodes',
    'reflexions',
    'projets'
  ]

  for (const category of categories) {
    urls.push({
      url: `/articles/${category}/`,
      changefreq: 'weekly',
      priority: 0.7
    })
  }

  // Tags (exemple, dans une vraie app ces données viendraient d'une analyse des articles)
  const commonTags = [
    'javascript', 'css', 'performance', 'docker', 'kubernetes',
    'architecture', 'security', 'linux', 'git', 'testing'
  ]

  for (const tag of commonTags) {
    urls.push({
      url: `/tags/${tag}`,
      changefreq: 'weekly',
      priority: 0.6
    })
  }

  // Créer le dossier de sortie s'il n'existe pas
  const outputDir = path.resolve(process.cwd(), 'docs/.vitepress/dist')
  await fs.mkdir(outputDir, { recursive: true })

  // Générer le sitemap XML manuellement pour éviter les erreurs
  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, changefreq = 'weekly', priority = 0.5, lastmod }) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`

  // Sauvegarder le sitemap
  await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemapXML)

  console.log(`✅ Sitemap généré avec ${urls.length} URLs`)
  console.log(`   Sitemap: /sitemap.xml`)
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemapXML().catch(console.error)
}

export { generateSitemapXML }