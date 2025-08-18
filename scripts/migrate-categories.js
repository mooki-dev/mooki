#!/usr/bin/env node

/**
 * Script pour migrer les anciennes catégories vers les nouvelles catégories professionnelles
 * Usage: node scripts/migrate-categories.js [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Charger articles.json
const articlesJsonPath = path.join(__dirname, '../docs/.vitepress/theme/data/articles.json')
const articlesData = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf-8'))

// Mapping des anciennes catégories vers les nouvelles
const CATEGORY_MIGRATION = {
  // Catégories qui restent identiques
  'ai': 'ai',
  'backend': 'backend', 
  'linux': 'linux',
  'software-design-architecture': 'software-design-architecture',
  'security': 'security',
  'securite': 'security', // migration français → anglais
  
  // Migrations vers devops
  'infrastructure': 'devops',
  
  // Migrations vers developer-experience
  'productivite': 'developer-experience',
  'methodes': 'developer-experience',
  'outils': 'developer-experience',
  'configurations': 'developer-experience', // sauf les configs Linux spécifiques
  
  // Migrations vers frontend (pour UX/UI)
  'ux-design': 'frontend',
  
  // Migrations spéciales basées sur le contenu
  'reflexions': null, // nécessite analyse manuelle
  'guides': null,     // nécessite analyse manuelle  
  'tutoriels': null,  // nécessite analyse manuelle
  'projets': null,    // nécessite analyse manuelle
  'comparaisons': null, // nécessite analyse manuelle
  'ia': 'ai'          // migration français → anglais
}

// Analyse manuelle basée sur le titre/contenu pour les catégories spéciales
const MANUAL_MIGRATIONS = {
  // Articles reflexions
  'developpeurs-artistes-refoules-esthetique-code-propre': 'software-design-architecture',
  'over-engineering-quand-le-mieux-devient-lennemi-du-bien': 'software-design-architecture',
  'signes-astrologiques-du-developpeur-quel-framework-es-tu': 'developer-experience',
  'dark-theme-vs-light-theme-la-guerre-des-deux-mondes': 'frontend',
  'learning-to-say-i-dont-know': 'developer-experience',
  'les-commentaires-dans-le-code-toujours-utiles': 'software-design-architecture',
  'simplicity-is-often-best': 'software-design-architecture',
  'solid-patterns': 'software-design-architecture',
  'impostor-syndrome-overcome': 'developer-experience',
  'les-bases-de-donnees-vectorielles-pourquoi-cest-le-futur': 'backend',
  
  // Articles guides  
  'docker-compose-orchestrer-sans-se-prendre-la-tete': 'devops',
  'self-hosting-data-control': 'devops',
  'technical-communication-non-technical-audience': 'developer-experience',
  'client-site-carbon-neutral-cahier-charges-prod': 'frontend',
  'ai-code-review-refactoring': 'ai',
  
  // Articles tutoriels - Backend
  'docker-java-multi-stage': 'backend',
  'junit5-testing': 'backend',
  'fastapi-modern-template': 'backend', 
  'microservices-architecture-best-practices': 'backend',
  'spring-boot-bases': 'backend',
  
  // Articles tutoriels - DevOps
  'docker-pour-les-nuls-guide-ultime-debutants': 'devops',
  'kubernetes-orchestration-beginners': 'devops',
  
  // Articles tutoriels - Frontend
  'state-management-modern': 'frontend',
  
  // Articles tutoriels - Performance (à classer selon le contexte)
  'one-billion-row-challenge-java-performance-ultime': 'backend',
  
  // Articles projets
  'site-web-1kb-defi-minimaliste': 'frontend',
  'spring-starter-minimal': 'backend',
  
  // Articles comparaisons
  'maven-vs-gradle-comparaison-complete-2025': 'backend'
}

/**
 * Détermine la nouvelle catégorie pour un article
 */
function getNewCategory(article) {
  const currentCategory = article.category
  const articleSlug = article.url.split('/').pop()
  
  // Vérification manuelle d'abord
  if (MANUAL_MIGRATIONS[articleSlug]) {
    return MANUAL_MIGRATIONS[articleSlug]
  }
  
  // Migration automatique
  if (CATEGORY_MIGRATION[currentCategory]) {
    return CATEGORY_MIGRATION[currentCategory]
  }
  
  // Cas spéciaux pour configurations Linux
  if (currentCategory === 'configurations' && 
      (article.title.toLowerCase().includes('linux') || 
       article.title.toLowerCase().includes('arch') ||
       article.title.toLowerCase().includes('neovim') ||
       article.title.toLowerCase().includes('hyprland'))) {
    return 'linux'
  }
  
  // Fallback
  console.warn(`⚠️  Catégorie non mappée pour ${article.title}: ${currentCategory}`)
  return currentCategory // garder l'ancienne catégorie
}

/**
 * Analyse et affiche le plan de migration
 */
function analyzeMigration() {
  console.log('📊 Analyse du plan de migration des catégories\n')
  
  const migrationPlan = new Map()
  const newCategoriesCount = new Map()
  
  articlesData.forEach(article => {
    const oldCategory = article.category
    const newCategory = getNewCategory(article)
    
    if (!migrationPlan.has(oldCategory)) {
      migrationPlan.set(oldCategory, new Map())
    }
    
    const oldCategoryMap = migrationPlan.get(oldCategory)
    if (!oldCategoryMap.has(newCategory)) {
      oldCategoryMap.set(newCategory, [])
    }
    
    oldCategoryMap.get(newCategory).push(article.title)
    
    // Compter les articles par nouvelle catégorie
    newCategoriesCount.set(newCategory, (newCategoriesCount.get(newCategory) || 0) + 1)
  })
  
  // Affichage du plan de migration
  console.log('📋 Plan de migration par ancienne catégorie:')
  for (const [oldCategory, newCategoriesMap] of migrationPlan) {
    console.log(`\n🔄 ${oldCategory}:`)
    for (const [newCategory, articles] of newCategoriesMap) {
      const arrow = oldCategory === newCategory ? '→' : '➜'
      console.log(`   ${arrow} ${newCategory} (${articles.length} articles)`)
      articles.forEach(title => {
        console.log(`      • ${title}`)
      })
    }
  }
  
  // Résumé final
  console.log('\n📈 Résumé par nouvelle catégorie:')
  const sortedNewCategories = [...newCategoriesCount.entries()].sort((a, b) => b[1] - a[1])
  for (const [category, count] of sortedNewCategories) {
    console.log(`   • ${category}: ${count} articles`)
  }
  
  return migrationPlan
}

/**
 * Applique la migration (met à jour articles.json)
 */
function applyMigration() {
  console.log('\n🚀 Application de la migration...')
  
  const updatedArticles = articlesData.map(article => ({
    ...article,
    category: getNewCategory(article)
  }))
  
  // Sauvegarder le nouveau fichier articles.json
  const articlesJsonPath = path.join(__dirname, '../docs/.vitepress/theme/data/articles.json')
  fs.writeFileSync(articlesJsonPath, JSON.stringify(updatedArticles, null, 2))
  
  console.log('✅ Migration appliquée avec succès!')
  console.log(`   Fichier mis à jour: ${articlesJsonPath}`)
  
  return updatedArticles
}

/**
 * Fonction principale
 */
function main() {
  const isDryRun = process.argv.includes('--dry-run')
  
  console.log('🏗️  Migration des catégories vers le nouveau système professionnel\n')
  
  // Analyser et afficher le plan
  const migrationPlan = analyzeMigration()
  
  if (isDryRun) {
    console.log('\n🔍 Mode dry-run: aucune modification appliquée')
    console.log('   Pour appliquer la migration: node scripts/migrate-categories.js')
  } else {
    console.log('\n❓ Voulez-vous appliquer cette migration ?')
    console.log('   Appuyez sur Ctrl+C pour annuler ou sur Entrée pour continuer...')
    
    // En mode non-interactif, appliquer directement
    applyMigration()
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { analyzeMigration, applyMigration, getNewCategory }