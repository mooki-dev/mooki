#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'

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
  'ai',
  'backend',
  'devops',
  'frontend',
  'linux',
  'security',
  'software-design-architecture',
  'ux-design'
]

// Fonction pour mode interactif
async function createNewArticleInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  function question(query) {
    return new Promise(resolve => rl.question(query, resolve))
  }

  console.log('🚀 Création d\'un nouvel article\n')

  // Collecte des informations
  const title = await question('Titre de l\'article: ')
  if (!title.trim()) {
    console.log('❌ Le titre est obligatoire')
    rl.close()
    return
  }

  const author = await question('Auteur (mooki): ') || 'mooki'
  const category = await question('Catégorie: ')
  const tags = await question('Tags (séparés par des virgules): ')
  const description = await question('Description: ')
  
  rl.close()
  
  return await createArticleFile({
    title,
    author,
    category,
    tags: tags.split(',').map(t => t.trim()).filter(t => t),
    description
  })
}

// Fonction pour mode arguments en ligne de commande
async function createNewArticleFromArgs() {
  const args = process.argv.slice(2)
  
  if (args.length < 5) {
    console.log('Usage: node scripts/new-article.js "Titre" "Auteur" "Catégorie" "tag1,tag2,tag3" "Description"')
    console.log('\nCatégories disponibles:')
    categories.forEach(cat => console.log(`  - ${cat}`))
    return
  }

  const [title, author, category, tags, description] = args
  
  if (!categories.includes(category)) {
    console.log(`❌ Catégorie invalide: ${category}`)
    console.log('\nCatégories disponibles:')
    categories.forEach(cat => console.log(`  - ${cat}`))
    return
  }
  
  return await createArticleFile({
    title,
    author,
    category,
    tags: tags.split(',').map(t => t.trim()).filter(t => t),
    description
  })
}

async function createArticleFile({ title, author, category, tags, description }) {
  
  // Génération du slug et du chemin
  const slug = slugify(title)
  const articlePath = path.join('docs', 'articles', category, `${slug}.md`)
  
  // Template de l'article
  const frontmatter = `---
title: "${title}"
date: ${formatDate(new Date())}
author: ${author}
category: ${category}
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
description: "${description}"
---

# ${title}

${description}

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
      return false
    } catch {
      // Le fichier n'existe pas, on peut continuer
    }
    
    // Créer le fichier
    await fs.writeFile(articlePath, frontmatter)
    
    console.log(`\n✅ Article créé avec succès!`)
    console.log(`📝 Chemin: ${articlePath}`)
    console.log(`🏷️  Catégorie: ${category}`)
    console.log(`🏃 Pour commencer à écrire: code ${articlePath}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article:', error.message)
    return false
  }
}

// Fonction principale qui décide du mode d'exécution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // Mode interactif
    await createNewArticleInteractive()
  } else {
    // Mode arguments
    await createNewArticleFromArgs()
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}