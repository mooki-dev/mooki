# PostgreSQL avec Docker

## Prérequis
- Docker
- Docker Compose

## Installation
Avant d'installer le conteneur PostgreSQL, il est nécessaire de créer un fichier `.env` contenant les variables d'environnement suivantes :
```
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
POSTGRES_PORT=<port>
POSTGRES_DB=<database>
```
```bash
docker-compose up -d 
```
Vérifier que le conteneur est bien démarré :
```bash
docker ps
```

## Utilisation

### Connexion à la base de données
Pour se connecter à la base de données avec l'interface psql :
```bash
docker exec -it <container_name> psql -U <user> -d <database>
```
Pour afficher le fichier de configuration :
```bash
docker exec -it <container_name> cat /etc/postgresql/postgresql.conf
```
Pour afficher les logs :
```bash
docker logs postgres
```

### Commandes utiles
Quelques commandes utiles pour PostgreSQL :
- `\l` : Liste les bases de données
- `\du` : Liste les utilisateurs
- `\c <database>` : Se connecter à une base de données
- `\c <database> <user>` : Se connecter à une base de données avec un utilisateur
- `\dn+` : Liste les schémas
- `\dt <schema>.*` : Liste les tables d'un schéma
- `\d <table>` : Afficher les colonnes d'une table
- `\q` : Quitter l'interface psql

### Création d'une base de données
```sql
CREATE DATABASE db1;
```

### Création d'un schéma
```sql
CREATE SCHEMA schema1;
```
### Création d'une table
```sql
CREATE TABLE schema1.table1 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
INSERT INTO schema1.table1 (name) VALUES ('Toto');
```

### Création d'utilisateurs
#### Avec tous les privilèges
```sql
CREATE USER user1 WITH ENCRYPTED PASSWORD 'password1';
GRANT ALL PRIVILEGES ON DATABASE db1 TO user1;
GRANT ALL PRIVILEGES ON SCHEMA schema1 TO user1;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA schema1 TO user1;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA schema1 TO user1;
```

#### Avec des privilèges limités (lecture seule)
```sql
CREATE USER user2 WITH ENCRYPTED PASSWORD 'password2';
GRANT USAGE ON SCHEMA schema1 TO user2;
GRANT SELECT ON ALL TABLES IN SCHEMA schema1 TO user2;
```

# Dictionnaire de données

### Schéma `mooki_articles`

---

### **Table : `language`**
Contient les langues disponibles pour les articles.

| **Champs** | **Type de Données**        | **Description**                                                         |
|------------|----------------------------|-------------------------------------------------------------------------|
| id         | SERIAL PRIMARY KEY         | Identifiant unique de la langue.                                        |
| name       | VARCHAR(255) NOT NULL      | Nom de la langue.                                                       |
| code       | VARCHAR(2) NOT NULL UNIQUE | Code de la langue (par exemple, 'en' pour anglais, 'fr' pour français). |

### **Table : `category`**
Contient les catégories d'articles.

| **Champs**  | **Type de Données**          | **Description**                                                        |
|-------------|------------------------------|------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY           | Identifiant unique de la catégorie.                                    |
| name        | VARCHAR(255) NOT NULL        | Nom de la catégorie.                                                   |
| slug        | VARCHAR(255) UNIQUE NOT NULL | Identifiant unique de la catégorie sous forme de chaîne.               |
| description | TEXT                         | Description de la catégorie (optionnel).                               |
| language_id | INT REFERENCES language(id)  | Référence à la langue de la catégorie (clé étrangère vers `language`). |

### **Table : `author`**
Contient les informations des auteurs d'articles.

| **Champs**      | **Type de Données**   | **Description**                       |
|-----------------|-----------------------|---------------------------------------|
| id              | SERIAL PRIMARY KEY    | Identifiant unique de l'auteur.       |
| name            | VARCHAR(255) NOT NULL | Nom de l'auteur.                      |
| profile_picture | VARCHAR(255)          | URL de l'image de profil de l'auteur. |

### **Table : `author_bio`**
Contient les biographies des auteurs.

| **Champs**  | **Type de Données**         | **Description**                                                         |
|-------------|:----------------------------|-------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY          | Identifiant unique de la biographie.                                    |
| author_id   | INT REFERENCES author(id)   | Référence à l'auteur (clé étrangère vers `author`).                     |
| language_id | INT REFERENCES language(id) | Référence à la langue de la biographie (clé étrangère vers `language`). |
| bio         | TEXT                        | Biographie de l'auteur.                                                 |

### **Table : `author_social`**
Contient les liens sociaux des auteurs.

| **Champs**     | **Type de Données**       | **Description**                                     |
|----------------|---------------------------|-----------------------------------------------------|
| id             | SERIAL PRIMARY KEY        | Identifiant unique du lien social.                  |
| author_id      | INT REFERENCES author(id) | Référence à l'auteur (clé étrangère vers `author`). |
| social_network | VARCHAR(255) NOT NULL     | Nom du réseau social.                               |
| url            | VARCHAR(255) NOT NULL     | URL du profil sur le réseau social.                 |

### **Table : `article`**
Contient les articles publiés.

| **Champs**  | **Type de Données**                                              | **Description**                                                        |
|-------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                                               | Identifiant unique de l'article.                                       |
| title       | VARCHAR(255) NOT NULL                                            | Titre de l'article.                                                    |
| slug        | VARCHAR(255) UNIQUE NOT NULL                                     | Identifiant unique de l'article sous forme de chaîne.                  |
| created_at  | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                              | Date de création de l'article.                                         |
| updated_at  | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                              | Date de mise à jour de l'article.                                      |
| status      | VARCHAR(10) CHECK (status IN ('draft', 'published', 'archived')) | État de l'article.                                                     |
| author_id   | INT REFERENCES author(id)                                        | Référence à l'auteur de l'article (clé étrangère vers `author`).       |
| category_id | INT REFERENCES category(id)                                      | Référence à la catégorie de l'article (clé étrangère vers `category`). | 
| language_id | INT REFERENCES language(id)                                      | Référence à la langue de l'article (clé étrangère vers `language`).    |

### **Table : `content_block`**
Contient les blocs de contenu d'un article (texte, image, etc.).

| **Champs** | **Type de Données**                                          | **Description**                                                |
|------------|--------------------------------------------------------------|----------------------------------------------------------------|
| id         | SERIAL PRIMARY KEY                                           | Identifiant unique du bloc de contenu.                         |
| article_id | INT REFERENCES article(id)                                   | Référence à l'article (clé étrangère vers `article`).          |
| type       | VARCHAR(50) CHECK (type IN ('text', 'image', 'code', 'url')) | Type de bloc de contenu.                                       |
| value      | TEXT                                                         | Valeur du bloc de contenu.                                     |
| position   | INT NOT NULL CHECK (position >= 1)                           | Position du bloc dans l'article (doit être un entier positif). |

### **Table : `article_stats`**
Statistiques sur les articles.

| **Champs**               | **Type de Données**        | **Description**                                       |
|--------------------------|----------------------------|-------------------------------------------------------|
| id                       | SERIAL PRIMARY KEY         | Identifiant unique des statistiques.                  |
| article_id               | INT REFERENCES article(id) | Référence à l'article (clé étrangère vers `article`). |
| views_count              | INT DEFAULT 0              | Nombre de vues de l'article.                          |
| comments_count           | INT DEFAULT 0              | Nombre de commentaires sur l'article.                 |
| recommendations_positive | INT DEFAULT 0              | Nombre de recommandations positives.                  |
| recommendations_negative | INT DEFAULT 0              | Nombre de recommandations négatives.                  |
| shares_count             | INT DEFAULT 0              | Nombre de partages de l'article.                      |
| average_reading_time     | FLOAT DEFAULT 0            | Temps de lecture moyen.                               |
| bounce_rate              | FLOAT DEFAULT 0            | Taux de rebond.                                       |
| time_spent               | INT DEFAULT 0              | Temps passé sur l'article.                            |

### **Table : `comment`**
Contient les commentaires des utilisateurs sur les articles.

| **Champs**               | **Type de Données**                 | **Description**                                                                                     |
|--------------------------|-------------------------------------|-----------------------------------------------------------------------------------------------------|
| id                       | SERIAL PRIMARY KEY                  | Identifiant unique du commentaire.                                                                  |
| article_id               | INT REFERENCES article(id)          | Référence à l'article commenté (clé étrangère vers `article`).                                      |
| content                  | TEXT NOT NULL                       | Contenu du commentaire.                                                                             |
| author_name              | VARCHAR(255) NOT NULL               | Nom de l'auteur du commentaire.                                                                     |
| timestamp                | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Date et heure de création du commentaire.                                                           |

### **Table : `promotion`**
Contient les informations sur les promotions des articles.

| **Champs** | **Type de Données**        | **Description**                                       |
|------------|----------------------------|-------------------------------------------------------|
| id         | SERIAL PRIMARY KEY         | Identifiant unique de la promotion.                   |
| article_id | INT REFERENCES article(id) | Référence à l'article (clé étrangère vers `article`). |
| start_date | TIMESTAMP NOT NULL         | Date de début de la promotion.                        |
| end_date   | TIMESTAMP NOT NULL         | Date de fin de la promotion.                          |