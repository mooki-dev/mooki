# PROMPT : Création d'articles techniques de référence

Sujet :
"""
Kubernetes - Orchestration et gestion de conteneurs en production
Guide complet pour les développeurs et architectes. Guide de référence pour Kubernetes, avec une approche équilibrée entre théorie et pratique. L'article doit être structuré pour être à la fois une ressource de référence et un guide pratique, avec des exemples de code récents et des analyses approfondies. se baser sur les dernières versions de Kubernetes (2025) et inclure des exemples concrets d'implémentation. mais aussi des analyses des implications architecturales et des meilleures pratiques. je veux vraiment comprendre les concepts clés, les cas d'usage, et comment les appliquer dans des scénarios réels. L'article doit être écrit dans un style professionnel mais accessible, avec une attention particulière à la clarté et à la structure. donc pas non plus trop de code. il faut que ce soit bien equilibré entre théorie et pratique, avec des exemples concrets et des analyses approfondies. L'article doit être structuré pour être à la fois une ressource de référence et un guide pratique, avec des exemples de code récents et des analyses approfondies. L'article doit être écrit dans un style professionnel mais accessible, avec une attention particulière à la clarté et à la structure.
"""

## 1. MISSION ET OBJECTIFS

### Mission principale
Créer des articles techniques de référence pour un blog professionnel VitePress, destinés aux développeurs et professionnels IT.

### Critères de succès mesurables
- **Longueur cible** : 3000-6000 mots pour les articles de référence
- **Équilibre** : 60% d'explications conceptuelles, 40% d'exemples pratiques
- **Profondeur** : Chaque concept doit couvrir le "pourquoi", "quand", "comment" et "implications"
- **Actualité** : 100% des exemples de code et références datent de 2023-2025
- **Applicabilité** : Au moins 3 exemples concrets par concept principal

### Typologie d'articles ciblés
- **Articles de référence** : Guides complets sur des sujets techniques
- **Analyses conceptuelles** : Exploration approfondie de paradigmes
- **Guides pratiques** : Solutions à des problèmes concrets avec contexte théorique

## 2. CONTEXTE ET PUBLIC

### Plateforme technique
- **Framework** : VitePress avec Markdown étendu
- **Audience** : Développeurs intermédiaires à experts, architectes, tech leads
- **Objectif** : Devenir une ressource de référence dans l'écosystème technique français

### Positionnement éditorial
- **Ton** : Expert mais accessible, sans condescendance
- **Approche** : Pragmatique avec fondements théoriques solides
- **Différenciation** : Analyses profondes + applications pratiques (pas seulement des tutoriels)

## 3. CRITÈRES DE QUALITÉ ET MÉTRIQUES

### Excellence technique
- **Exactitude** : Tous les exemples de code testés et fonctionnels
- **Actualité** : Technologies et APIs dans leurs dernières versions stables
- **Complétude** : Couverture exhaustive du sujet sans être encyclopédique
- **Nuance** : Mention des trade-offs, limites et contextes d'usage

### Excellence éditoriale
- **Clarté** : Progression logique et transitions fluides
- **Engagement** : Maintien de l'intérêt sur toute la longueur
- **Utilité** : Informations directement applicables
- **Originalité** : Angle ou insight qui apporte une valeur unique

### Métriques de validation
- **Densité conceptuelle** : 1 concept majeur tous les 400-600 mots
- **Ratio code/texte** : Maximum 30% de l'article en blocs de code
- **Références** : Minimum 8-12 sources qualifiées récentes
- **Structure** : 4-8 sections principales, 2-4 sous-sections par section

## 4. STYLE ET TON OPTIMISÉS

### Voix éditoriale
- **Personnalité** : Expert humble qui partage ses insights
- **Registre** : Professionnel mais conversationnel
- **Perspective** : Praticien expérimenté qui comprend les enjeux réels

### Techniques d'écriture
- **Éviter absolument** :
  - "Dans cet article, nous allons..."
  - "En conclusion..."
  - Généralités non étayées
  - Listes à puces systématiques
- **Privilégier** :
  - Analogies et métaphores éclairantes
  - Questions rhétoriques qui guident la réflexion
  - Exemples concrets tirés de l'expérience
  - Transitions naturelles entre concepts

### Variété structurelle
- **Articles techniques** : Démarrer par un problème concret mais impersonnel
- **Guides pratiques** : Ouvrir avec une question ou un défi courant
- **Analyses théoriques** : Commencer par une citation ou un fait marquant
- **Études de cas** : Introduire avec un scénario d'usage réel
- **Tutoriels** : Lancer avec un objectif clair et mesurable
- **Articles conceptuels** : Ouvrir avec une métaphore ou analogie
- **Guides de bonnes pratiques** : Commencer par un anti-pattern courant
- **Analyses architecturales** : Partir d'un cas d'usage réel

## 5. ÉQUILIBRE CONTENU-CODE (CRITIQUE)

### Principe directeur
Chaque article doit être **simultanément** une référence conceptuelle ET un guide pratique.

### Distribution optimale
- **40% Explications contextuelles** : Historique, motivations, philosophie
- **30% Applications pratiques** : Exemples de code commentés et analysés
- **20% Implications** : Trade-offs, performances, cas d'usage
- **10% Ressources** : Sources, outils, extensions

### Traitement des exemples de code
- **Chaque exemple** doit être précédé d'une explication de son contexte
- **Chaque exemple** doit être suivi d'une analyse de ses implications
- **Variation des langages** : Python, JavaScript, Java selon la pertinence
- **Progression** : Du simple au complexe avec étapes intermédiaires

### Éviter les extrêmes
- ❌ **Collections de snippets** sans analyse suffisante
- ❌ **Théorie pure** sans applications concrètes
- ❌ **Tutoriels step-by-step** sans contexte conceptuel

## 6. SPÉCIFICATIONS TECHNIQUES VITEPRESS

### Markdown étendu
- **Headers** : Hiérarchie claire H1→H2→H3 (max 3 niveaux)
- **Code blocks** : Toujours avec langage spécifié
- **Code groups** : Pour comparer langages ou versions
```markdown
::: code-group
```python [Python]
# Code Python ici
```
```javascript [JavaScript]
// Code JavaScript ici
```
:::
```

### Composants VitePress (usage modéré)
- **:::tip** : Insights particulièrement utiles
- **:::warning** : Points d'attention importants
- **:::danger** : Erreurs courantes à éviter
- **:::details** : Informations complémentaires optionnelles

### Diagrammes et visuels
- **Mermaid** : Uniquement si apport conceptuel significatif
- **Placeholders images** : `[IMAGE: Description précise]`
- **Éviter** : Décorations superflues, emojis, GIFs non essentiels

## 7. RECHERCHE ET SOURCES (OPTIMISÉ CLAUDE)

### Stratégie de recherche
1. **Recherche préliminaire** : Vue d'ensemble avec WebSearch
2. **Sources officielles** : Documentation, specs, RFC avec WebFetch
3. **Validation croisée** : Vérifier cohérence entre sources multiples
4. **Veille récente** : Articles 2024-2025, dernières versions

### Utilisation des outils Claude
- **WebSearch** : Panorama général, tendances, comparaisons
- **WebFetch** : Documentation officielle, articles de référence
- **Limite** : Maximum 8-10 recherches par article (efficacité)

### Hiérarchie des sources
1. **Documentation officielle** (GitHub, sites officiels)
2. **Articles de référence** (Martin Fowler, blogs reconnus)
3. **Papiers académiques** récents (IEEE, ACM)
4. **Implémentations** open source populaires
5. **Discussions** Stack Overflow, Reddit (avec prudence)

## 8. WORKFLOW DÉTAILLÉ AVEC VALIDATION

### Phase 1 : Recherche et planification
- **Recherche initiale** : Comprendre l'état de l'art actuel
- **Identification des angles** : Trouver la perspective unique
- **Plan détaillé** : Structure avec points clés par section
- **Validation** : Plan cohérent et complet ?

### Phase 2 : Création de structure
- **Script new-article.js** : Génération du fichier avec métadonnées
- **Headers principaux** : Structure claire et logique
- **Placeholders** : Emplacements code, images, références
- **Validation** : Navigation fluide entre sections ?

### Phase 3 : Rédaction intensive
- **Introduction engageante** : Accroche + contexte
- **Développement par section** : Concept → Exemple → Analyse
- **Transitions naturelles** : Liens logiques entre idées
- **Validation continue** : Chaque section apporte-t-elle de la valeur ?

### Phase 4 : Enrichissement technique
- **Exemples de code** : Testés, commentés, analysés
- **Code groups** : Comparaisons langages si pertinent
- **Diagrammes** : Si réelle valeur ajoutée
- **Validation** : Code fonctionnel et pédagogique ?

### Phase 5 : Finalisation et relecture
- **Section ressources** : Sources qualifiées et récentes
- **Relecture critique** : Flow, clarté, complétude
- **Métriques finales** : Longueur, équilibre, densité
- **Validation** : Article de qualité référence ?

## 9. AUTO-ÉVALUATION

### Checklist finale obligatoire
Avant de considérer l'article terminé, vérifier :

#### Qualité du contenu
- [ ] Chaque concept principal est expliqué ET illustré
- [ ] Les exemples de code sont récents et fonctionnels
- [ ] Les trade-offs et limitations sont mentionnés
- [ ] L'article apporte une perspective unique ou utile

#### Structure et lisibilité
- [ ] Introduction engageante sans clichés
- [ ] Progression logique des concepts simples aux complexes
- [ ] Transitions fluides entre sections
- [ ] Conclusion actionnable sans platitudes

#### Métriques techniques
- [ ] 3000-6000 mots pour un article de référence
- [ ] 60/40 ratio explications/code respecté
- [ ] Minimum 8 sources qualifiées citées
- [ ] Maximum 3 niveaux de headers utilisés

### Questions d'auto-validation
1. **Utilité** : "Un développeur expert apprendrait-il quelque chose ?"
2. **Applicabilité** : "Quelqu'un pourrait-il appliquer cela lundi matin ?"
3. **Durabilité** : "Cet article sera-t-il encore pertinent dans 2 ans ?"
4. **Différenciation** : "Qu'apporte cet article que d'autres n'ont pas ?"

## 10. TEMPLATE D'EXÉCUTION

### Format de réponse structuré
```
**SUJET TRAITÉ** : [Nom du sujet]
**MÉTRIQUES CIBLES** : ~[X] mots, [Y] concepts, [Z] exemples

### STRUCTURE PLANIFIÉE
1. [Titre section] - [Angle spécifique]
2. [Titre section] - [Angle spécifique]
[...]

### RECHERCHES EFFECTUÉES
- [Source 1] : [Insight principal]
- [Source 2] : [Insight principal]
[...]

### ARTICLE COMPLET
[Contenu de l'article suivant toutes les directives]

### AUTO-ÉVALUATION
[Critères respectés]
[Points d'attention éventuels]
```

---

## INSTRUCTIONS D'EXÉCUTION FINALE

**Pour chaque nouvel article :**

1. **Analyser le sujet** fourni et identifier l'angle unique
2. **Effectuer les recherches** nécessaires avec les outils disponibles
3. **Créer la structure** avec le script new-article.js
4. **Rédiger l'article complet** en suivant toutes les directives ci-dessus
5. **Auto-évaluer** avec la checklist finale
6. **Présenter le résultat** selon le template structuré

**L'objectif** : Créer systématiquement des articles de référence qui deviennent des ressources incontournables dans l'écosystème technique français.
