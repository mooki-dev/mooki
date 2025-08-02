#!/usr/bin/env node

/**
 * Script pour ajouter une nouvelle catégorie au site VitePress
 * Usage: node scripts/add-category.js <nom-categorie> <label-francais>
 * Exemple: node scripts/add-category.js "productivite" "Productivité"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..')
const DOCS_DIR = path.join(ROOT_DIR, 'docs')
const ARTICLES_DIR = path.join(DOCS_DIR, 'articles')
const CONFIG_FILE = path.join(DOCS_DIR, '.vitepress', 'config.mts')
const SIDEBAR_FILE = path.join(DOCS_DIR, '.vitepress', 'theme', 'utils', 'sidebar.ts')

/**
 * Valide les arguments de ligne de commande
 */
function validateArgs() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('❌ Usage: node scripts/add-category.js <nom-categorie> <label-francais>')
    console.error('   Exemple: node scripts/add-category.js "productivite" "Productivité"')
    process.exit(1)
  }
  
  const categoryId = args[0]
  const categoryLabel = args[1]
  
  // Validation du nom de catégorie
  if (!/^[a-z0-9-]+$/.test(categoryId)) {
    console.error('❌ Le nom de catégorie doit contenir uniquement des lettres minuscules, chiffres et tirets')
    process.exit(1)
  }
  
  return { categoryId, categoryLabel }
}

/**
 * Vérifie si une catégorie existe déjà
 */
function checkCategoryExists(categoryId) {
  const categoryDir = path.join(ARTICLES_DIR, categoryId)
  return fs.existsSync(categoryDir)
}

/**
 * Crée le dossier de catégorie et le fichier index.md
 */
function createCategoryStructure(categoryId, categoryLabel) {
  const categoryDir = path.join(ARTICLES_DIR, categoryId)
  const indexFile = path.join(categoryDir, 'index.md')
  
  // Créer le dossier
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true })
    console.log(`✅ Dossier créé: ${categoryDir}`)
  }
  
  // Créer le fichier index.md
  const indexContent = `---
title: "${categoryLabel}"
description: "Articles de la catégorie ${categoryLabel}"
---

# ${categoryLabel}

Cette catégorie contient des articles sur ${categoryLabel.toLowerCase()}.

## Articles dans cette catégorie

<script setup>
import { data as articles } from '../.vitepress/theme/data/articles.data.js'
import ArticleCard from '../.vitepress/theme/components/ArticleCard.vue'
import { computed } from 'vue'

const categoryArticles = computed(() => {
  return articles
    .filter(article => article.category === '${categoryId}')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
</script>

<div v-if="categoryArticles.length === 0" class="no-articles">
  <p>Aucun article dans cette catégorie pour le moment.</p>
</div>

<div v-else class="articles-grid">
  <ArticleCard 
    v-for="article in categoryArticles" 
    :key="article.url"
    :article="article" 
  />
</div>

<style scoped>
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.no-articles {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
</style>
`
  
  if (!fs.existsSync(indexFile)) {
    fs.writeFileSync(indexFile, indexContent)
    console.log(`✅ Fichier index créé: ${indexFile}`)
  } else {
    console.log(`⚠️  Le fichier index existe déjà: ${indexFile}`)
  }
}

/**
 * Ajoute la catégorie dans le fichier de configuration VitePress
 */
function updateVitePressConfig(categoryId, categoryLabel) {
  let content = fs.readFileSync(CONFIG_FILE, 'utf-8')
  
  // Chercher la section des catégories dans la navigation
  const categoryItemsRegex = /(text: 'Catégories',\s*items: \[)([\s\S]*?)(\s*\])/
  const match = content.match(categoryItemsRegex)
  
  if (!match) {
    console.error('❌ Impossible de trouver la section des catégories dans le config')
    return false
  }
  
  const currentItems = match[2]
  const newItem = `          { text: '${categoryLabel}', link: '/articles/${categoryId}/' },`
  
  // Vérifier si la catégorie existe déjà
  if (currentItems.includes(`/articles/${categoryId}/`)) {
    console.log(`⚠️  La catégorie '${categoryId}' existe déjà dans la configuration`)
    return true
  }
  
  // Ajouter la nouvelle catégorie (trié alphabétiquement par label)
  const items = currentItems.split('\n')
    .filter(line => line.trim())
    .map(line => line.trim())
  
  items.push(newItem.trim())
  items.sort((a, b) => {
    const textA = a.match(/text: '([^']+)'/)?.[1] || ''
    const textB = b.match(/text: '([^']+)'/)?.[1] || ''
    return textA.localeCompare(textB, 'fr')
  })
  
  // S'assurer que tous les éléments sauf le dernier ont une virgule
  const formattedItems = items.map((item, index) => {
    const cleanItem = item.replace(/,$/, '') // Enlever virgule existante
    return index === items.length - 1 ? `          ${cleanItem}` : `          ${cleanItem},`
  })
  
  const newItemsSection = formattedItems.join('\n')
  const newContent = content.replace(categoryItemsRegex, `$1\n${newItemsSection}\n$3`)
  
  fs.writeFileSync(CONFIG_FILE, newContent)
  console.log(`✅ Configuration VitePress mise à jour`)
  return true
}

/**
 * Ajoute la catégorie dans le fichier sidebar.ts
 */
function updateSidebarConfig(categoryId, categoryLabel) {
  let content = fs.readFileSync(SIDEBAR_FILE, 'utf-8')
  
  // 1. Ajouter dans la liste des catégories de generateArticlesSidebar
  const categoriesArrayRegex = /(const categories = \[)([\s\S]*?)(\s*\])/
  const categoriesMatch = content.match(categoriesArrayRegex)
  
  if (categoriesMatch) {
    const currentCategories = categoriesMatch[2]
    const newCategoryItem = `    { id: '${categoryId}', label: '${categoryLabel}' },`
    
    if (!currentCategories.includes(`id: '${categoryId}'`)) {
      const categories = currentCategories.split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
      
      categories.push(newCategoryItem.trim())
      categories.sort((a, b) => {
        const labelA = a.match(/label: '([^']+)'/)?.[1] || ''
        const labelB = b.match(/label: '([^']+)'/)?.[1] || ''
        return labelA.localeCompare(labelB, 'fr')
      })
      
      // S'assurer que tous les éléments sauf le dernier ont une virgule
      const formattedCategories = categories.map((cat, index) => {
        const cleanCat = cat.replace(/,$/, '') // Enlever virgule existante
        return index === categories.length - 1 ? `    ${cleanCat}` : `    ${cleanCat},`
      })
      
      const newCategoriesSection = formattedCategories.join('\n')
      content = content.replace(categoriesArrayRegex, `$1\n${newCategoriesSection}\n$3`)
      console.log(`✅ Catégorie ajoutée dans generateArticlesSidebar`)
    }
  }
  
  // 2. Ajouter dans generateTagsSidebar
  content = addCategoryToSidebarFunction(content, 'generateTagsSidebar', categoryId, categoryLabel)
  
  // 3. Ajouter dans generateAboutSidebar
  content = addCategoryToSidebarFunction(content, 'generateAboutSidebar', categoryId, categoryLabel)
  
  fs.writeFileSync(SIDEBAR_FILE, content)
  console.log(`✅ Configuration sidebar mise à jour`)
}

/**
 * Aide pour ajouter une catégorie dans une fonction de sidebar spécifique
 */
function addCategoryToSidebarFunction(content, functionName, categoryId, categoryLabel) {
  const functionRegex = new RegExp(`(function ${functionName}\\(\\)[\\s\\S]*?text: 'Catégories',\\s*items: \\[)([\\s\\S]*?)(\\s*\\])`, 'g')
  const match = content.match(functionRegex)
  
  if (match) {
    const fullMatch = match[0]
    const itemsRegex = /(text: 'Catégories',\s*items: \[)([\s\S]*?)(\s*\])/
    const itemsMatch = fullMatch.match(itemsRegex)
    
    if (itemsMatch) {
      const currentItems = itemsMatch[2]
      const newItem = `        { text: '${categoryLabel}', link: '/articles/${categoryId}/' },`
      
      if (!currentItems.includes(`/articles/${categoryId}/`)) {
        const items = currentItems.split('\n')
          .filter(line => line.trim())
          .map(line => line.trim())
        
        items.push(newItem.trim())
        items.sort((a, b) => {
          const textA = a.match(/text: '([^']+)'/)?.[1] || ''
          const textB = b.match(/text: '([^']+)'/)?.[1] || ''
          return textA.localeCompare(textB, 'fr')
        })
        
        // S'assurer que tous les éléments sauf le dernier ont une virgule
        const formattedItems = items.map((item, index) => {
          const cleanItem = item.replace(/,$/, '') // Enlever virgule existante
          return index === items.length - 1 ? `        ${cleanItem}` : `        ${cleanItem},`
        })
        
        const newItemsSection = formattedItems.join('\n')
        const newFullMatch = fullMatch.replace(itemsRegex, `$1\n${newItemsSection}\n$3`)
        content = content.replace(fullMatch, newFullMatch)
        console.log(`✅ Catégorie ajoutée dans ${functionName}`)
      }
    }
  }
  
  return content
}

/**
 * Fonction principale
 */
function main() {
  try {
    console.log('🚀 Ajout d\'une nouvelle catégorie...\n')
    
    const { categoryId, categoryLabel } = validateArgs()
    
    console.log(`📁 Catégorie: ${categoryId}`)
    console.log(`🏷️  Label: ${categoryLabel}\n`)
    
    // Vérifier si la catégorie existe déjà
    if (checkCategoryExists(categoryId)) {
      console.log(`⚠️  La catégorie '${categoryId}' existe déjà`)
    } else {
      console.log(`✨ Création de la nouvelle catégorie '${categoryId}'`)
    }
    
    // 1. Créer la structure de dossier
    createCategoryStructure(categoryId, categoryLabel)
    
    // 2. Mettre à jour la configuration VitePress
    updateVitePressConfig(categoryId, categoryLabel)
    
    // 3. Mettre à jour la configuration du sidebar
    updateSidebarConfig(categoryId, categoryLabel)
    
    console.log('\n🎉 Catégorie ajoutée avec succès!')
    console.log('\n📝 Prochaines étapes:')
    console.log(`   1. Redémarrer le serveur de développement VitePress`)
    console.log(`   2. Visiter /articles/${categoryId}/ pour vérifier`)
    console.log(`   3. Créer vos premiers articles dans docs/articles/${categoryId}/`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la catégorie:', error.message)
    process.exit(1)
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main, createCategoryStructure, updateVitePressConfig, updateSidebarConfig }