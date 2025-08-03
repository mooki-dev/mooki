#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { globby } from 'globby'

/**
 * Script pour redistribuer les dates des articles de manière plus réaliste
 * Les articles récents auront des dates récentes, les autres seront espacés
 */

const ARTICLES_DIR = 'docs/articles'

/**
 * Génère une date aléatoire avec heure dans une plage donnée
 */
function generateRandomDate(startDate, endDate) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const randomTime = start + Math.random() * (end - start)
  
  // Générer une heure réaliste (entre 8h et 22h pour simuler des heures de publication)
  const date = new Date(randomTime)
  const hour = 8 + Math.floor(Math.random() * 14) // 8h à 21h
  const minute = Math.floor(Math.random() * 60)
  
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/**
 * Redistribue les dates des articles
 */
async function fixArticleDates() {
  console.log('🔍 Scan des articles dans', ARTICLES_DIR)

  try {
    // Trouve tous les fichiers .md 
    const articleFiles = await globby(['**/*.md'], {
      cwd: ARTICLES_DIR,
      ignore: ['**/index.md', '**/README.md']
    })

    console.log(`📝 ${articleFiles.length} fichiers d'articles trouvés`)

    // Définir les plages de dates
    const today = new Date()
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)

    // Mélanger les fichiers pour une distribution aléatoire
    const shuffledFiles = [...articleFiles].sort(() => Math.random() - 0.5)

    // Répartir les articles par plages temporelles
    const recentCount = Math.ceil(shuffledFiles.length * 0.15) // 15% très récents
    const monthCount = Math.ceil(shuffledFiles.length * 0.25)  // 25% du mois dernier
    const quarterCount = Math.ceil(shuffledFiles.length * 0.35) // 35% du trimestre
    // Le reste sur 6 mois

    for (let i = 0; i < shuffledFiles.length; i++) {
      const file = shuffledFiles[i]
      const fullPath = path.join(process.cwd(), ARTICLES_DIR, file)
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        const { data: frontmatter, content: markdownContent } = matter(content)

        // Générer une nouvelle date selon la position dans la liste
        let newDate
        if (i < recentCount) {
          // Articles très récents (dernière semaine)
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          newDate = generateRandomDate(weekAgo, today)
        } else if (i < recentCount + monthCount) {
          // Articles du mois dernier
          newDate = generateRandomDate(oneMonthAgo, today)
        } else if (i < recentCount + monthCount + quarterCount) {
          // Articles du trimestre
          newDate = generateRandomDate(threeMonthsAgo, oneMonthAgo)
        } else {
          // Articles plus anciens
          newDate = generateRandomDate(sixMonthsAgo, threeMonthsAgo)
        }

        // Mettre à jour le frontmatter
        frontmatter.date = newDate

        // Reconstruire le fichier
        const newContent = matter.stringify(markdownContent, frontmatter)
        await fs.writeFile(fullPath, newContent, 'utf-8')

        console.log(`✅ ${frontmatter.title} → ${newDate}`)

      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${file}:`, error.message)
      }
    }

    console.log(`\n🎉 ${shuffledFiles.length} articles mis à jour avec de nouvelles dates`)
    console.log('📊 Répartition des dates :')
    console.log(`   • ${recentCount} articles très récents (dernière semaine)`)
    console.log(`   • ${monthCount} articles du mois dernier`)
    console.log(`   • ${quarterCount} articles du trimestre`)
    console.log(`   • ${shuffledFiles.length - recentCount - monthCount - quarterCount} articles plus anciens`)

  } catch (error) {
    console.error('❌ Erreur lors de la correction des dates:', error)
    process.exit(1)
  }
}

// Exécute le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  fixArticleDates()
}

export { fixArticleDates }