import { DefaultTheme } from 'vitepress'
import fg from 'fast-glob'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'

interface SidebarConfig {
  [path: string]: DefaultTheme.SidebarItem[]
}

export function generateSidebar(): SidebarConfig {
  const sidebar: SidebarConfig = {
    '/articles/': generateArticlesSidebar(),
    '/tags/': generateTagsSidebar(),
    '/about': generateAboutSidebar(),
    '/': generateDefaultSidebar()
  }

  return sidebar
}

function generateArticlesSidebar(): DefaultTheme.SidebarItem[] {
  const categories = [
    { id: 'configurations', label: 'Configurations' },
    { id: 'guides', label: 'Guides' },
    { id: 'methodes', label: 'Méthodes' },
    { id: 'outils', label: 'Outils' },
    { id: 'productivite', label: 'Productivité' },
    { id: 'projets', label: 'Projets' },
    { id: 'reflexions', label: 'Réflexions' }

  ]

  const sidebarItems: DefaultTheme.SidebarItem[] = [
    {
      text: 'Tous les articles',
      link: '/articles/'
    }
  ]

  // Pour chaque catégorie, récupérer les articles
  for (const category of categories) {
    const articlesInCategory = getArticlesInCategory(category.id)
    
    if (articlesInCategory.length > 0) {
      sidebarItems.push({
        text: category.label,
        collapsed: true,
        items: articlesInCategory
      })
    }
  }

  // Ajouter les articles non catégorisés
  const uncategorizedArticles = getUncategorizedArticles()
  if (uncategorizedArticles.length > 0) {
    sidebarItems.push({
      text: 'Non catégorisés',
      collapsed: true,
      items: uncategorizedArticles
    })
  }

  return sidebarItems
}

function getArticlesInCategory(categoryId: string): DefaultTheme.SidebarItem[] {
  const articlesPath = path.resolve(__dirname, '../../../articles', categoryId)
  
  if (!fs.existsSync(articlesPath)) {
    return []
  }

  const files = fg.sync('*.md', {
    cwd: articlesPath,
    absolute: false
  })

  return files
    .filter(file => file !== 'index.md')
    .map(file => {
      const filePath = path.join(articlesPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(content)
      
      return {
        text: data.title || file.replace('.md', ''),
        link: `/articles/${categoryId}/${file.replace('.md', '')}`
      }
    })
    .sort((a, b) => {
      // Trier par titre
      return a.text.localeCompare(b.text, 'fr')
    })
}

function getUncategorizedArticles(): DefaultTheme.SidebarItem[] {
  const articlesPath = path.resolve(__dirname, '../../../articles')
  
  if (!fs.existsSync(articlesPath)) {
    return []
  }

  const files = fg.sync('*.md', {
    cwd: articlesPath,
    absolute: false
  })

  return files
    .filter(file => file !== 'index.md')
    .map(file => {
      const filePath = path.join(articlesPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(content)
      
      return {
        text: data.title || file.replace('.md', ''),
        link: `/articles/${file.replace('.md', '')}`
      }
    })
    .sort((a, b) => a.text.localeCompare(b.text, 'fr'))
}

function generateTagsSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Navigation',
      items: [
        { text: 'Accueil', link: '/' },
        { text: 'Tous les articles', link: '/articles/' },
        { text: 'Tags', link: '/tags/' }
      ]
    },
    {
      text: 'Catégories',
      items: [
        { text: 'Configurations', link: '/articles/configurations/' },
        { text: 'Guides', link: '/articles/guides/' },
        { text: 'Méthodes', link: '/articles/methodes/' },
        { text: 'Outils', link: '/articles/outils/' },
        { text: 'Productivité', link: '/articles/productivite/' },
        { text: 'Projets', link: '/articles/projets/' },
        { text: 'Réflexions', link: '/articles/reflexions/' }

      ]
    }
  ]
}

function generateAboutSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Navigation',
      items: [
        { text: 'Accueil', link: '/' },
        { text: 'Articles', link: '/articles/' },
        { text: 'Tags', link: '/tags/' },
        { text: 'À propos', link: '/about' }
      ]
    },
    {
      text: 'Contenu',
      items: [
        { text: 'Configurations', link: '/articles/configurations/' },
        { text: 'Guides', link: '/articles/guides/' },
        { text: 'Méthodes', link: '/articles/methodes/' },
        { text: 'Outils', link: '/articles/outils/' },
        { text: 'Productivité', link: '/articles/productivite/' },
        { text: 'Projets', link: '/articles/projets/' },
        { text: 'Réflexions', link: '/articles/reflexions/' }
      ]
    }
  ]
}

function generateDefaultSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Navigation',
      items: [
        { text: 'Accueil', link: '/' },
        { text: 'Articles', link: '/articles/' },
        { text: 'Tags', link: '/tags/' },
        { text: 'À propos', link: '/about' }
      ]
    },
    {
      text: 'Démarrage',
      items: [
        { text: 'Articles récents', link: '/#articles-recents' },
        { text: 'Catégories', link: '/#categories' },
        { text: 'Tags populaires', link: '/tags/' }
      ]
    }
  ]
}