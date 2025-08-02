# mooki - Base de connaissances technique

Base de connaissances utilisant VitePress pour organiser guides, configurations, outils, méthodes et réflexions techniques.

## Démarrage rapide

```bash
# Installation des dépendances
npm install

# Serveur de développement
npm run docs:dev

# Build de production
npm run docs:build

# Aperçu de production
npm run docs:preview
```

## Gestion du contenu

### Créer un nouvel article

```bash
npm run new:article
```

Ce script interactif vous guidera pour créer un nouvel article avec la structure appropriée.

### Structure des dossiers

```
docs/
├── articles/
│   ├── guides/           # Tutorials détaillés (Spring, Docker, Kubernetes...)
│   ├── configurations/   # Setups et configs (Hyprland, Neovim, Arch...)
│   ├── outils/          # Sélection d'outils (Claude Code, MCP, TUI...)
│   ├── methodes/        # Pratiques et processus (Agile, Scrum...)
│   ├── reflexions/      # Opinions et analyses (Clean Code, SOLID...)
│   └── projets/         # Templates et starters
├── tags/
└── .vitepress/
    ├── config.mts
    └── theme/
        ├── components/
        └── utils/
```

## Composants disponibles

### ArticleList
Liste paginée des articles avec filtres par catégorie et tri.

```vue
<ArticleList 
  :articles="articles" 
  :items-per-page="10"
  @tag-click="handleTagClick"
  @category-change="handleCategoryChange"
/>
```

### ArticleCard
Carte d'aperçu d'un article avec image, métadonnées et tags.

```vue
<ArticleCard :article="article" @tag-click="handleTagClick" />
```

### TagCloud
Nuage de tags avec tailles variables selon la fréquence.

```vue
<TagCloud :tags="tagCounts" :max-tags="20" @tag-click="handleTagClick" />
```

### RecentPosts
Liste des articles récents pour la sidebar ou la page d'accueil.

```vue
<RecentPosts :posts="recentPosts" :limit="5" />
```

### RelatedPosts
Articles similaires basés sur les tags et catégories.

```vue
<RelatedPosts :current-post="currentPost" :all-posts="allPosts" />
```

## Scripts utilitaires

### Génération RSS
```bash
npm run build:rss
```
Génère les flux RSS, Atom et JSON Feed dans `/dist/`.

### Génération Sitemap
```bash
npm run build:sitemap
```
Génère le sitemap XML avec tous les articles et pages.

## Template d'article

Les articles utilisent ce format de frontmatter :

```yaml
---
title: "Titre de l'article"
date: 2025-01-22
tags: [tag1, tag2, tag3]
author: mooki
excerpt: "Description courte de l'article"
cover: /images/article-cover.jpg
category: nom-de-la-categorie
---
```

## Fonctionnalités

- **Navigation intelligente** : Sidebar générée automatiquement
- **Recherche locale** : Recherche dans tout le contenu
- **Pagination** : Gestion efficace de nombreux articles
- **Tags et catégories** : Organisation flexible du contenu
- **Articles similaires** : Algorithme de recommandation
- **Temps de lecture** : Calcul automatique
- **RSS/Atom** : Flux de syndication
- **Sitemap** : SEO optimisé
- **Responsive** : Design adaptatif
- **Mode sombre** : Support natif VitePress

## Configuration

### Site web

Modifiez `docs/.vitepress/config.mts` pour :
- URL du site
- Métadonnées SEO
- Navigation
- Réseaux sociaux

### Theme

Personnalisez `docs/.vitepress/theme/style.css` pour :
- Couleurs
- Typographie
- Espacement

## Performance

Le blog est optimisé pour :
- **Build rapide** : Génération statique efficace
- **Chargement rapide** : Lazy loading et optimisations
- **SEO** : Structure sémantique et métadonnées
- **Accessibilité** : Standards WCAG

## Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## Licence

MIT License - voir [LICENSE](LICENSE) pour les détails.

