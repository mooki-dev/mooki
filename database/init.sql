------------------------------------------------------------------------------------------------------------------------
CREATE SCHEMA mooki_articles;
------------------------------------------------------------------------------------------------------------------------

-- Language ------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.language (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(2) NOT NULL UNIQUE
);

INSERT INTO mooki_articles.language (name, code) VALUES ('English', 'en');
INSERT INTO mooki_articles.language (name, code) VALUES ('Français', 'fr');
------------------------------------------------------------------------------------------------------------------------

-- Category ------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.category (
    id SERIAL PRIMARY KEY
);

INSERT INTO mooki_articles.category DEFAULT VALUES;
INSERT INTO mooki_articles.category DEFAULT VALUES;
------------------------------------------------------------------------------------------------------------------------

-- Category Translation -------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.category_translation (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES mooki_articles.category(id) ON DELETE CASCADE,
    language_id INT REFERENCES mooki_articles.language(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO mooki_articles.category_translation (category_id, language_id, name, slug, description) VALUES (1, 1, 'Web Development', 'web-development', 'Articles about web development.');
INSERT INTO mooki_articles.category_translation (category_id, language_id, name, slug, description) VALUES (1, 2, 'Développement Web', 'developpement-web', 'Articles sur le développement web.');
INSERT INTO mooki_articles.category_translation (category_id, language_id, name, slug, description) VALUES (2, 1, 'Mobile Development', 'mobile-development', 'Articles about mobile development.');
INSERT INTO mooki_articles.category_translation (category_id, language_id, name, slug, description) VALUES (2, 2, 'Développement Mobile', 'developpement-mobile', 'Articles sur le développement mobile.');
------------------------------------------------------------------------------------------------------------------------

-- Author --------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.author (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255)
);

INSERT INTO mooki_articles.author (name, profile_picture) VALUES ('John Doe', 'https://example.com/john-doe.jpg');
INSERT INTO mooki_articles.author (name, profile_picture) VALUES ('Jane Doe', 'https://example.com/jane-doe.jpg');
------------------------------------------------------------------------------------------------------------------------

-- Author Bio ----------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.author_bio (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES mooki_articles.author(id) ON DELETE CASCADE
);

INSERT INTO mooki_articles.author_bio (author_id) VALUES (1);
INSERT INTO mooki_articles.author_bio (author_id) VALUES (2);
------------------------------------------------------------------------------------------------------------------------

-- Author Bio Translation ----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.author_bio_translation (
    id SERIAL PRIMARY KEY,
    author_bio_id INT REFERENCES mooki_articles.author_bio(id) ON DELETE CASCADE,
    language_id INT REFERENCES mooki_articles.language(id),
    bio TEXT
);
INSERT INTO mooki_articles.author_bio_translation (author_bio_id, language_id, bio) VALUES (1, 1, 'John Doe is a web developer.');
INSERT INTO mooki_articles.author_bio_translation (author_bio_id, language_id, bio) VALUES (1, 2, 'John Doe est un développeur web.');
INSERT INTO mooki_articles.author_bio_translation (author_bio_id, language_id, bio) VALUES (2, 1, 'Jane Doe is a web developer.');
INSERT INTO mooki_articles.author_bio_translation (author_bio_id, language_id, bio) VALUES (2, 2, 'Jane Doe est une développeuse web.');
------------------------------------------------------------------------------------------------------------------------

-- Author Social -------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.author_social (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES mooki_articles.author(id) ON DELETE CASCADE,
    social_network VARCHAR(50) CHECK (social_network IN ('Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'GitHub')),
    url VARCHAR(255) NOT NULL
);

INSERT INTO mooki_articles.author_social (author_id, social_network, url) VALUES (1, 'Twitter', 'https://twitter.com/johndoe');
INSERT INTO mooki_articles.author_social (author_id, social_network, url) VALUES (1, 'LinkedIn', 'https://linkedin.com/in/johndoe');
INSERT INTO mooki_articles.author_social (author_id, social_network, url) VALUES (2, 'Twitter', 'https://twitter.com/janedoe');
INSERT INTO mooki_articles.author_social (author_id, social_network, url) VALUES (2, 'LinkedIn', 'https://linkedin.com/in/janedoe');
------------------------------------------------------------------------------------------------------------------------

-- Article -------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.article (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) CHECK (status IN ('draft', 'published', 'archived')),
    author_id INT REFERENCES mooki_articles.author(id),
    category_id INT REFERENCES mooki_articles.category(id)
);

INSERT INTO mooki_articles.article (status, author_id, category_id) VALUES ('published', 1, 1);
------------------------------------------------------------------------------------------------------------------------

-- Article Translation -------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.article_translation (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    language_id INT REFERENCES mooki_articles.language(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT
);

INSERT INTO mooki_articles.article_translation (article_id, language_id, title, slug, content) VALUES (1, 1, 'How to create a website', 'how-to-create-a-website', 'This is a tutorial on how to create a website.');
INSERT INTO mooki_articles.article_translation (article_id, language_id, title, slug, content) VALUES (1, 2, 'Comment créer un site web', 'comment-creer-un-site-web', 'Ceci est un tutoriel sur comment créer un site web.');
------------------------------------------------------------------------------------------------------------------------

-- Content Block -------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.content_block (
    id SERIAL PRIMARY KEY,
    article_translation_id INT REFERENCES mooki_articles.article_translation(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('text', 'image', 'code', 'url')),
    position INT NOT NULL CHECK (position >= 1)
);

INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (1, 'text', 1);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (1, 'image', 2);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (1, 'code', 3);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (1, 'url', 4);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (2, 'text', 1);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (2, 'image', 2);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (2, 'code', 3);
INSERT INTO mooki_articles.content_block (article_translation_id, type, position) VALUES (2, 'url', 4);
------------------------------------------------------------------------------------------------------------------------

-- Content Block Translation -------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.content_block_translation (
    id SERIAL PRIMARY KEY,
    content_block_id INT REFERENCES mooki_articles.content_block(id) ON DELETE CASCADE,
    language_id INT REFERENCES mooki_articles.language(id),
    value TEXT
);

INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (1, 1, 'This is a text block.');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (2, 1, 'https://example.com/image.jpg');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (3, 1, 'console.log("Hello, world!");');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (4, 1, 'https://example.com');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (5, 2, 'Ceci est un bloc de texte.');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (6, 2, 'https://example.com/image.jpg');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (7, 2, 'console.log("Bonjour, le monde!");');
INSERT INTO mooki_articles.content_block_translation (content_block_id, language_id, value) VALUES (8, 2, 'https://example.com');
------------------------------------------------------------------------------------------------------------------------

-- Article Stats -------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.article_stats (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    views_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    recommendations_positive INT DEFAULT 0,
    recommendations_negative INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    average_reading_time FLOAT DEFAULT 0,
    bounce_rate FLOAT DEFAULT 0,
    time_spent INT DEFAULT 0
);

INSERT INTO mooki_articles.article_stats (article_id) VALUES (1);
------------------------------------------------------------------------------------------------------------------------

-- Comment -------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.comment (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mooki_articles.comment (article_id, content, author_name) VALUES (1, 'This is a comment.', 'John Doe');
INSERT INTO mooki_articles.comment (article_id, content, author_name) VALUES (1, 'Ceci est un commentaire.', 'Jane Doe');
------------------------------------------------------------------------------------------------------------------------

-- Promotion -----------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.promotion (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    CHECK ( start_date < end_date )
);

INSERT INTO mooki_articles.promotion (article_id, start_date, end_date) VALUES (1, '2021-01-01', '2021-01-31');
------------------------------------------------------------------------------------------------------------------------