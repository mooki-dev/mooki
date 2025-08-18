#!/usr/bin/env node

/**
 * Script pour ajouter une nouvelle catégorie au site VitePress
 * Usage: node scripts/add-category.js <nom-categorie> <label-francais> [description]
 * Exemple: node scripts/add-category.js "productivite" "Productivité" "Techniques pour améliorer la productivité"
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
const CATEGORIES_FILE = path.join(DOCS_DIR, '.vitepress', 'theme', 'data', 'categories.ts')

/**
 * Valide les arguments de ligne de commande
 */
function validateArgs() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('❌ Usage: node scripts/add-category.js <nom-categorie> <label-francais> [description]')
    console.error('   Exemple: node scripts/add-category.js "productivite" "Productivité" "Techniques pour améliorer la productivité"')
    process.exit(1)
  }
  
  const categoryId = args[0]
  const categoryLabel = args[1]
  const categoryDescription = args[2] || `Articles de la catégorie ${categoryLabel.toLowerCase()}`
  
  // Validation du nom de catégorie
  if (!/^[a-z0-9-]+$/.test(categoryId)) {
    console.error('❌ Le nom de catégorie doit contenir uniquement des lettres minuscules, chiffres et tirets')
    process.exit(1)
  }
  
  return { categoryId, categoryLabel, categoryDescription }
}

/**
 * Vérifie si une catégorie existe déjà
 */
function checkCategoryExists(categoryId) {
  const categoryDir = path.join(ARTICLES_DIR, categoryId)
  return fs.existsSync(categoryDir)
}

/**
 * Vérifie si une catégorie existe déjà dans le fichier de métadonnées
 */
function checkCategoryInMetadata(categoryId) {
  const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8')
  return content.includes(`id: '${categoryId}'`)
}

/**
 * Crée le dossier de catégorie et le fichier index.md
 */
function createCategoryStructure(categoryId, categoryLabel, categoryDescription) {
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
description: "${categoryDescription}"
---

# ${categoryLabel}

${categoryDescription}.

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
 * Ajoute la catégorie dans le fichier de métadonnées
 */
function updateCategoriesMetadata(categoryId, categoryLabel, categoryDescription) {
  let content = fs.readFileSync(CATEGORIES_FILE, 'utf-8')
  
  // Vérifier si la catégorie existe déjà
  if (checkCategoryInMetadata(categoryId)) {
    console.log(`⚠️  La catégorie '${categoryId}' existe déjà dans les métadonnées`)
    return true
  }
  
  // Chercher la fin du tableau categoriesMetadata
  const endOfArrayRegex = /(\s*\]\s*\/\*\*)/
  const match = content.match(endOfArrayRegex)
  
  if (!match) {
    console.error('❌ Impossible de trouver la fin du tableau categoriesMetadata')
    return false
  }
  
  // Ajouter la nouvelle catégorie
  const newCategoryItem = `  {
    id: '${categoryId}',
    label: '${categoryLabel}',
    description: '${categoryDescription}'
  },`
  
  // Insérer avant la fermeture du tableau
  const newContent = content.replace(
    endOfArrayRegex, 
    `${newCategoryItem}\n$1`
  )
  
  fs.writeFileSync(CATEGORIES_FILE, newContent)
  console.log(`✅ Métadonnées des catégories mises à jour`)
  return true
}

/**
 * Fonction principale
 */
function main() {
  try {
    console.log('🚀 Ajout d\'une nouvelle catégorie...\n')
    
    const { categoryId, categoryLabel, categoryDescription } = validateArgs()
    
    console.log(`📁 Catégorie: ${categoryId}`)
    console.log(`🏷️  Label: ${categoryLabel}`)
    console.log(`📝 Description: ${categoryDescription}\n`)
    
    // Vérifier si la catégorie existe déjà
    const existsInDir = checkCategoryExists(categoryId)
    const existsInMetadata = checkCategoryInMetadata(categoryId)
    
    if (existsInDir && existsInMetadata) {
      console.log(`⚠️  La catégorie '${categoryId}' existe déjà partout`)
      console.log('\n✨ Rien à faire, la catégorie est déjà configurée!')
      return
    }
    
    if (!existsInDir || !existsInMetadata) {
      console.log(`✨ Configuration de la catégorie '${categoryId}'`)
    }
    
    // 1. Créer la structure de dossier
    createCategoryStructure(categoryId, categoryLabel, categoryDescription)
    
    // 2. Mettre à jour le fichier de métadonnées
    updateCategoriesMetadata(categoryId, categoryLabel, categoryDescription)
    
    console.log('\n🎉 Catégorie ajoutée avec succès!')
    console.log('\n📝 Prochaines étapes:')
    console.log(`   1. Redémarrer le serveur de développement VitePress`)
    console.log(`   2. Visiter /articles/${categoryId}/ pour vérifier`)
    console.log(`   3. Créer vos premiers articles dans docs/articles/${categoryId}/`)
    console.log(`   4. Les catégories s'afficheront automatiquement dans la navigation une fois qu'elles contiennent des articles`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la catégorie:', error.message)
    process.exit(1)
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main, createCategoryStructure, updateCategoriesMetadata }