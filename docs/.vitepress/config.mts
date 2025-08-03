import { defineConfig } from 'vitepress'
import { generateSidebar } from './theme/utils/sidebar'
import { mermaidPlugin } from './theme/plugins/mermaid-plugin'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    build: {
      chunkSizeWarningLimit: 2000, // Ajusté pour Mermaid (~1.1MB) et gros articles
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Mermaid - chunk séparé car gros et utilisé uniquement sur certaines pages
            if (id.includes('mermaid')) {
              return 'mermaid'
            }
            
            // Vue core et VitePress - toujours nécessaire
            if (id.includes('vue') || id.includes('@vueuse/core') || id.includes('vitepress')) {
              return 'vue-vendor'
            }
            
            // Utilitaires markdown et métadonnées
            if (id.includes('gray-matter') || id.includes('reading-time') || id.includes('fast-glob')) {
              return 'utils'
            }
            
            // Plugins spécifiques VitePress 
            if (id.includes('.vitepress/theme')) {
              return 'theme'
            }
            
            // Node modules restants
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      },
      // Optimisations supplémentaires avec esbuild (plus rapide)
      minify: 'esbuild',
      target: 'es2020'
    },
    optimizeDeps: {
      include: ['mermaid', 'mark.js']
    },
    resolve: {
      alias: {
        // Fix pour mark.js ESM issue
        'mark.js/src/lib/mark': 'mark.js/src/lib/mark.js'
      }
    },
    ssr: {
      noExternal: ['mark.js']
    }
  },
  title: "mooki",
  description: "Base de connaissances technique - Développement, outils, méthodes et réflexions",
  lang: 'fr-FR',
  base: '/mooki/',

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'author', content: 'mooki' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/mooki/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/mooki/favicon.png' }],
    ['link', { rel: 'alternate icon', href: '/mooki/favicon.ico' }],
  ],

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: 'Conseil',
      warningLabel: 'Attention',
      dangerLabel: 'Danger',
      infoLabel: 'Info',
      detailsLabel: 'Détails'
    },
    config: (md) => {
      // Configuration du plugin Mermaid
      md.use(mermaidPlugin)
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: 'Accueil', link: '/' },
      { text: 'Articles', link: '/articles/' },
      {
        text: 'Catégories',
        items: [
          { text: 'Configurations', link: '/articles/configurations/' },
          { text: 'Guides', link: '/articles/guides/' },
          { text: 'Infrastructure', link: '/articles/infrastructure/' },
          { text: 'Méthodes', link: '/articles/methodes/' },
          { text: 'Outils', link: '/articles/outils/' },
          { text: 'Productivité', link: '/articles/productivite/' },
          { text: 'Projets', link: '/articles/projets/' },
          { text: 'Réflexions', link: '/articles/reflexions/' },
          { text: 'Sécurité', link: '/articles/securite/' },
          { text: 'Tutoriels', link: '/articles/tutoriels/' }




        ]
      },
      { text: 'Tags', link: '/tags/' },
      { text: 'À propos', link: '/about' }
    ],

    sidebar: generateSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mooki-dev/mooki' }
    ],

    footer: {
      message: 'Publié sous licence MIT',
      copyright: `Copyright © ${new Date().getFullYear()} mooki`
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: 'Sur cette page',
      level: [2, 3]
    },

    docFooter: {
      prev: 'Article précédent',
      next: 'Article suivant'
    },

    lastUpdatedText: 'Dernière mise à jour',

    returnToTopLabel: 'Retour en haut',

    langMenuLabel: 'Changer de langue',

    sidebarMenuLabel: 'Menu',

    darkModeSwitchLabel: 'Apparence',

    lightModeSwitchTitle: 'Passer en mode clair',

    darkModeSwitchTitle: 'Passer en mode sombre'
  },

  sitemap: {
    hostname: 'https://mooki-dev.github.io/mooki',
    transformItems: (items) => {
      return items.map(item => ({
        ...item,
        changefreq: 'weekly',
        priority: item.url.includes('/articles/') ? 0.8 : 0.6
      }))
    }
  }
})
