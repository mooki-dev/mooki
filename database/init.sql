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
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    language_id INT REFERENCES mooki_articles.language(id)
);

INSERT INTO mooki_articles.category (name, slug,description, language_id) VALUES ('Web development', 'web-development', 'Everything about web development', 1);
INSERT INTO mooki_articles.category (name, slug,description, language_id) VALUES ('Développement web', 'developpement-web', 'Tout sur le développement web', 2);
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
    author_id INT REFERENCES mooki_articles.author(id) ON DELETE CASCADE,
    language_id INT REFERENCES mooki_articles.language(id),
    bio TEXT
);

INSERT INTO mooki_articles.author_bio (author_id, language_id, bio) VALUES (1, 1, 'John Doe is a web developer.');
INSERT INTO mooki_articles.author_bio (author_id, language_id, bio) VALUES (1, 2, 'John Doe est un développeur web.');
INSERT INTO mooki_articles.author_bio (author_id, language_id, bio) VALUES (2, 1, 'Jane Doe is a web developer.');
INSERT INTO mooki_articles.author_bio (author_id, language_id, bio) VALUES (2, 2, 'Jane Doe est un développeur web.');
------------------------------------------------------------------------------------------------------------------------

-- Author Social -------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.author_social (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES mooki_articles.author(id) ON DELETE CASCADE,
    social_network VARCHAR(255) NOT NULL,
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
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) CHECK (status IN ('draft', 'published', 'archived')),
    author_id INT REFERENCES mooki_articles.author(id),
    category_id INT REFERENCES mooki_articles.category(id),
    language_id INT REFERENCES mooki_articles.language(id)
);

INSERT INTO mooki_articles.article (title, slug, status, author_id, category_id, language_id) VALUES ('How to create a website', 'how-to-create-a-website', 'published', 1, 1, 1);
INSERT INTO mooki_articles.article (title, slug, status, author_id, category_id, language_id) VALUES ('Comment créer un site web', 'comment-creer-un-site-web', 'published', 1, 2, 2);
------------------------------------------------------------------------------------------------------------------------

-- Content Block -------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.content_block (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('text', 'image', 'code', 'url')),
    value TEXT,
    position INT NOT NULL CHECK (position >= 1)
);

INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (1, 'text', 'This is a text block.', 1);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (1, 'image', 'https://example.com/image.jpg', 2);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (1, 'code', 'console.log("Hello, world!");', 3);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (1, 'url', 'https://example.com', 4);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (2, 'text', 'Ceci est un bloc de texte.', 1);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (2, 'image', 'https://example.com/image.jpg', 2);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (2, 'code', 'console.log("Bonjour, le monde!");', 3);
INSERT INTO mooki_articles.content_block (article_id, type, value, position) VALUES (2, 'url', 'https://example.com', 4);
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
INSERT INTO mooki_articles.article_stats (article_id) VALUES (2);
------------------------------------------------------------------------------------------------------------------------

-- Comment -------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.comment (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mooki_articles.comment (article_id, content, author_name) VALUES (1, 'Great article!', 'John Doe');
INSERT INTO mooki_articles.comment (article_id, content, author_name) VALUES (1, 'I love it!', 'Jane Doe');
INSERT INTO mooki_articles.comment (article_id, content, author_name) VALUES (2, 'Super article!', 'Jean Dupont');
INSERT INTO mooki_articles.comment (article_id, content, author_name) VALUES (2, 'Je l''adore!', 'Jeanne Dupont');
------------------------------------------------------------------------------------------------------------------------

-- Promotion -----------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mooki_articles.promotion (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES mooki_articles.article(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL
);

INSERT INTO mooki_articles.promotion (article_id, start_date, end_date) VALUES (1, '2021-01-01', '2021-01-31');
INSERT INTO mooki_articles.promotion (article_id, start_date, end_date) VALUES (2, '2021-01-01', '2021-01-31');
------------------------------------------------------------------------------------------------------------------------