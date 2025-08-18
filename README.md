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

### Génération automatique des articles

Les articles sont automatiquement détectés et chargés depuis les fichiers Markdown. Plus besoin de maintenir une liste manuelle !

```bash
# Génère automatiquement la liste des articles depuis les fichiers .md
npm run build:articles
```

**Workflow simplifié :**
1. Créez un fichier `.md` dans le bon dossier de catégorie
2. Ajoutez le frontmatter YAML
3. L'article apparaît automatiquement sur le site

Les métadonnées (temps de lecture, URL, catégorie) sont calculées automatiquement depuis le contenu et la structure de fichiers.

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

### Génération automatique des articles
```bash
npm run build:articles
```
Scan automatiquement tous les fichiers `.md` dans `/docs/articles/` et génère les métadonnées. Exécuté automatiquement avant chaque build.

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

### Commandes combinées
```bash
# Build complet (articles + site + RSS + sitemap)
npm run docs:build

# Build local (sans optimisations de production)
npm run docs:build:local
```

## Template d'article

Les articles utilisent ce format de frontmatter :

```yaml
---
title: "Titre de l'article"
date: 2025-01-22
tags: [tag1, tag2, tag3, ...]
author: Andrea Larboullet Marin
excerpt: "Description courte de l'article"
cover: /images/article-cover.jpg
category: nom-de-la-categorie
readingTime: 15  # Optionnel - calculé automatiquement si absent
---
```

**Champs automatiques :**
- `readingTime` : Calculé automatiquement si non spécifié
- `url` : Généré depuis le chemin du fichier
- `category` : Extrait du dossier parent si non spécifié

**Placement du fichier :**
- `docs/articles/guides/mon-article.md` → `/articles/guides/mon-article`
- `docs/articles/outils/super-tool.md` → `/articles/outils/super-tool`

## Fonctionnalités

- **Génération automatique** : Articles détectés automatiquement depuis les fichiers .md
- **Navigation intelligente** : Sidebar générée automatiquement
- **Recherche locale** : Recherche dans tout le contenu
- **Pagination complète** : Pages d'articles, catégories et tags avec navigation
- **Tags et catégories** : Organisation flexible du contenu
- **Articles similaires** : Algorithme de recommandation basé sur les tags
- **Temps de lecture** : Calcul automatique (200 mots/min en français)
- **RSS/Atom** : Flux de syndication multi-format
- **Sitemap** : SEO optimisé avec priorités
- **Responsive** : Design adaptatif mobile-first
- **Mode sombre** : Support natif VitePress
- **Performance** : Build statique optimisé avec lazy loading
- **Logos personnalisés** : Favicon SVG/ICO et hero image
- **CI/CD** : Déploiement automatique sur GitHub Pages

## Configuration

### Site web

Modifiez `docs/.vitepress/config.mts` pour :
- URL du site et base path
- Métadonnées SEO
- Navigation et liens sociaux
- Configuration des favicons

### Theme et composants

Personnalisez `docs/.vitepress/theme/` pour :
- `style.css` : Couleurs, typographie, espacement
- `components/` : Composants Vue personnalisés
- `data/` : Sources de données (généré automatiquement)
- `utils/` : Fonctions utilitaires

### Logos et assets

- `docs/public/logo.svg` : Logo de la navbar
- `docs/public/hero-image.png` : Image de la page d'accueil
- `docs/public/favicon.svg` : Favicon moderne (navigateurs récents)
- `docs/public/favicon.ico` : Favicon de compatibilité

## Déploiement

### GitHub Pages (automatique)

Le site se déploie automatiquement sur GitHub Pages à chaque push sur `main` :

1. **Génération articles** → Scan des fichiers .md
2. **Build VitePress** → Site statique optimisé
3. **Génération RSS/Sitemap** → Flux et référencement
4. **Déploiement** → GitHub Pages

URL de production : `https://mooki-dev.github.io/mooki`

### Local

```bash
# Développement avec hot reload
npm run docs:dev

# Build et aperçu local
npm run docs:build:local
npm run docs:preview
```

## Performance

Le site est optimisé pour :
- **Build rapide** : Génération statique avec cache intelligent
- **Chargement rapide** : Lazy loading et code splitting
- **SEO** : Structure sémantique et métadonnées complètes
- **Accessibilité** : Standards WCAG avec navigation clavier
- **Mobile** : Design responsive avec touch-friendly UI
- **Maintenance** : Génération automatique sans intervention manuelle


## Licence

MIT License - voir [LICENSE](LICENSE) pour les détails.
