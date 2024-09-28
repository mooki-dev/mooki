-- Récupérer tous les articles avec leurs auteurs et catégories
SELECT a.id AS article_id, a.title, a.slug, a.status, au.name AS author_name, c.name AS category_name
FROM mooki_articles.article a
         JOIN mooki_articles.author au ON a.author_id = au.id
         JOIN mooki_articles.category c ON a.category_id = c.id;

-- Récupérer tous les articles avec leurs statistiques
SELECT a.id AS article_id, a.title, s.views_count, s.comments_count, s.recommendations_positive, s.recommendations_negative, s.shares_count
FROM mooki_articles.article a
         JOIN mooki_articles.article_stats s ON a.id = s.article_id;

-- Récupérer tous les articles avec leurs blocs de contenu
SELECT a.id AS article_id, a.title, cb.type, cb.value, cb.position
FROM mooki_articles.article a
         JOIN mooki_articles.content_block cb ON a.id = cb.article_id;

-- Récupérer tous les articles avec leurs commentaires
SELECT a.id AS article_id, a.title, c.content AS comment_content, c.author_name AS comment_author, c.timestamp AS comment_timestamp
FROM mooki_articles.article a
         JOIN mooki_articles.comment c ON a.id = c.article_id;

-- Récupérer tous les articles avec leurs promotions
SELECT a.id AS article_id, a.title, p.start_date, p.end_date
FROM mooki_articles.article a
         JOIN mooki_articles.promotion p ON a.id = p.article_id;

-- Récupérer tous les auteurs avec leurs bios et réseaux sociaux
SELECT au.id AS author_id, au.name AS author_name, ab.bio, asoc.social_network, asoc.url
FROM mooki_articles.author au
         JOIN mooki_articles.author_bio ab ON au.id = ab.author_id
         JOIN mooki_articles.author_social asoc ON au.id = asoc.author_id;

-- Récupérer tous les articles avec leur langue
SELECT a.id AS article_id, a.title, l.name AS language_name, l.code AS language_code
FROM mooki_articles.article a
         JOIN mooki_articles.language l ON a.language_id = l.id;

-- Récupérer toutes les catégories avec leur langue
SELECT c.id AS category_id, c.name AS category_name, l.name AS language_name, l.code AS language_code
FROM mooki_articles.category c
         JOIN mooki_articles.language l ON c.language_id = l.id;