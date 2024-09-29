-- Récupérer les catégories et leurs traductions dans différentes langues ----------------------------------------------
SELECT 
    c.id AS category_id, 
    ct.name AS category_name, 
    l.name AS language_name, 
    ct.slug, 
    ct.description
FROM mooki_articles.category c
JOIN mooki_articles.category_translation ct ON c.id = ct.category_id
JOIN mooki_articles.language l ON ct.language_id = l.id;
------------------------------------------------------------------------------------------------------------------------

-- Récupérer les articles, leurs traductions, et les auteurs associés --------------------------------------------------
SELECT 
    a.id AS article_id, 
    at.title, 
    at.slug, 
    l.name AS language_name, 
    au.name AS author_name, 
    at.content
FROM mooki_articles.article a
JOIN mooki_articles.article_translation at ON a.id = at.article_id
JOIN mooki_articles.language l ON at.language_id = l.id
JOIN mooki_articles.author au ON a.author_id = au.id;
------------------------------------------------------------------------------------------------------------------------

-- Récupérer les articles et leurs catégories avec des statistiques ----------------------------------------------------
SELECT 
    a.id AS article_id, 
    at.title, 
    c.id AS category_id, 
    ct.name AS category_name, 
    s.views_count, 
    s.comments_count, 
    s.recommendations_positive, 
    s.recommendations_negative, 
    s.shares_count
FROM mooki_articles.article a
JOIN mooki_articles.article_translation at ON a.id = at.article_id
JOIN mooki_articles.category c ON a.category_id = c.id
JOIN mooki_articles.category_translation ct ON c.id = ct.category_id
JOIN mooki_articles.article_stats s ON a.id = s.article_id;
------------------------------------------------------------------------------------------------------------------------

-- Récupérer les auteurs et leurs réseaux sociaux ----------------------------------------------------------------------
SELECT 
    au.id AS author_id, 
    au.name AS author_name, 
    asoc.social_network, 
    asoc.url
FROM mooki_articles.author au
JOIN mooki_articles.author_social asoc ON au.id = asoc.author_id;
------------------------------------------------------------------------------------------------------------------------

-- Récupérer les commentaires sur les articles, avec leurs auteurs -----------------------------------------------------
SELECT 
    a.id AS article_id, 
    at.title, 
    c.content AS comment_content, 
    c.author_name AS comment_author, 
    c.timestamp
FROM mooki_articles.article a
JOIN mooki_articles.article_translation at ON a.id = at.article_id
JOIN mooki_articles.comment c ON a.id = c.article_id;
------------------------------------------------------------------------------------------------------------------------

-- Récupérer les blocs de contenu d'un article, avec leurs traductions et la langue ------------------------------------
SELECT 
    a.id AS article_id, 
    at.title, 
    cb.type AS content_block_type, 
    cb.position, 
    cbt.value AS translated_value, 
    l.name AS language_name
FROM mooki_articles.article a
JOIN mooki_articles.article_translation at ON a.id = at.article_id
JOIN mooki_articles.content_block cb ON at.id = cb.article_translation_id
JOIN mooki_articles.content_block_translation cbt ON cb.id = cbt.content_block_id
JOIN mooki_articles.language l ON cbt.language_id = l.id;
------------------------------------------------------------------------------------------------------------------------

-- Récupérer les promotions liées aux articles -------------------------------------------------------------------------
SELECT 
    a.id AS article_id, 
    at.title, 
    p.start_date, 
    p.end_date
FROM mooki_articles.article a
JOIN mooki_articles.article_translation at ON a.id = at.article_id
JOIN mooki_articles.promotion p ON a.id = p.article_id;
------------------------------------------------------------------------------------------------------------------------