#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

const categories = [
  'guides',
  'configurations',
  'outils',
  'methodes',
  'reflexions',
  'projets'
]

async function createNewArticle() {
  console.log('🚀 Création d\'un nouvel article\n')

  // Collecte des informations
  const title = await question('Titre de l\'article: ')
  if (!title.trim()) {
    console.log('❌ Le titre est obligatoire')
    rl.close()
    return
  }

  const author = await question('Auteur (mooki): ') || 'mooki'
  const excerpt = await question('Résumé/excerpt: ')
  const tags = await question('Tags (séparés par des virgules): ')
  
  // Sélection de la catégorie
  console.log('\nCatégories disponibles:')
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat}`)
  })
  
  const categoryIndex = await question('\nNuméro de catégorie (1-' + categories.length + '): ')
  const categoryNum = parseInt(categoryIndex) - 1
  
  if (categoryNum < 0 || categoryNum >= categories.length) {
    console.log('❌ Numéro de catégorie invalide')
    rl.close()
    return
  }
  
  const category = categories[categoryNum]
  
  // Génération du slug et du chemin
  const slug = slugify(title)
  const articlePath = path.join('docs', 'articles', category, `${slug}.md`)
  
  // Template de l'article
  const frontmatter = `---
title: "${title}"
date: ${formatDate(new Date())}
tags: [${tags.split(',').map(tag => `"${tag.trim()}"`).join(', ')}]
author: ${author}
excerpt: "${excerpt}"
cover: /images/${slug}.jpg
category: ${category}
---

# ${title}

${excerpt}

## Introduction

<!-- Votre contenu ici -->

## Conclusion

<!-- Votre conclusion ici -->

## Ressources

- [Lien 1](https://example.com)
- [Lien 2](https://example.com)
`

  try {
    // Créer le dossier de la catégorie s'il n'existe pas
    const categoryDir = path.dirname(articlePath)
    await fs.mkdir(categoryDir, { recursive: true })
    
    // Vérifier si le fichier existe déjà
    try {
      await fs.access(articlePath)
      console.log(`❌ Un article avec ce nom existe déjà: ${articlePath}`)
      rl.close()
      return
    } catch {
      // Le fichier n'existe pas, on peut continuer
    }
    
    // Créer le fichier
    await fs.writeFile(articlePath, frontmatter)
    
    console.log(`\n✅ Article créé avec succès!`)
    console.log(`📝 Chemin: ${articlePath}`)
    console.log(`🏷️  Catégorie: ${category}`)
    console.log(`🏃 Pour commencer à écrire: code ${articlePath}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article:', error.message)
  }
  
  rl.close()
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  createNewArticle().catch(console.error)
}