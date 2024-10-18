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
docker compose up -d 
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

Voici la mise à jour du dictionnaire de données selon le nouveau schéma :

### Schéma `mooki_articles`

---

### **Table : `language`**
Contient les langues disponibles pour les articles.

| **Champs** | **Type de Données**        | **Description**                                                         |
|------------|----------------------------|-------------------------------------------------------------------------|
| id         | SERIAL PRIMARY KEY         | Identifiant unique de la langue.                                        |
| name       | VARCHAR(255) NOT NULL      | Nom de la langue.                                                       |
| code       | VARCHAR(2) NOT NULL UNIQUE | Code de la langue (par exemple, 'en' pour anglais, 'fr' pour français). |

---

### **Table : `category`**
Contient les catégories d'articles.

| **Champs** | **Type de Données** | **Description**                        |
|------------|---------------------|----------------------------------------|
| id         | SERIAL PRIMARY KEY  | Identifiant unique de la catégorie.    |

---

### **Table : `category_translation`**
Contient les traductions des catégories.

| **Champs**  | **Type de Données**                           | **Description**                                                         |
|-------------|-----------------------------------------------|-------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                            | Identifiant unique de la traduction de catégorie.                       |
| category_id | INT REFERENCES category(id) ON DELETE CASCADE | Référence à la catégorie (clé étrangère vers `category`).               |
| language_id | INT REFERENCES language(id)                   | Référence à la langue de la traduction (clé étrangère vers `language`). |
| name        | VARCHAR(255) NOT NULL                         | Nom de la catégorie traduit.                                            |
| slug        | VARCHAR(255) UNIQUE NOT NULL                  | Identifiant unique sous forme de chaîne pour la catégorie traduite.     |
| description | TEXT                                          | Description de la catégorie traduite (facultatif).                      |

---

### **Table : `author`**
Contient les informations des auteurs d'articles.

| **Champs**      | **Type de Données**   | **Description**                       |
|-----------------|-----------------------|---------------------------------------|
| id              | SERIAL PRIMARY KEY    | Identifiant unique de l'auteur.       |
| name            | VARCHAR(255) NOT NULL | Nom de l'auteur.                      |
| profile_picture | VARCHAR(255)          | URL de l'image de profil de l'auteur. |

---

### **Table : `author_translation`**
Contient les traductions des biographies des auteurs.

| **Champs**  | **Type de Données**                             | **Description**                                                                  |
|-------------|-------------------------------------------------|----------------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                              | Identifiant unique de la traduction de biographie.                               |
| author_id   | INT REFERENCES author_bio(id) ON DELETE CASCADE | Référence à la biographie de l'auteur (clé étrangère vers `author_bio`).         |
| language_id | INT REFERENCES language(id)                     | Référence à la langue de la biographie traduite (clé étrangère vers `language`). |
| bio         | TEXT                                            | Texte de la biographie traduite.                                                 |

---

### **Table : `author_social`**
Contient les liens vers les réseaux sociaux des auteurs.

| **Champs**     | **Type de Données**                                                                                         | **Description**                                     |
|----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| id             | SERIAL PRIMARY KEY                                                                                          | Identifiant unique du réseau social.                |
| author_id      | INT REFERENCES author(id) ON DELETE CASCADE                                                                 | Référence à l'auteur (clé étrangère vers `author`). |
| social_network | VARCHAR(50) CHECK (social_network IN ('Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'GitHub')) | Nom du réseau social.                               |
| url            | VARCHAR(255) NOT NULL                                                                                       | URL du profil sur le réseau social.                 |

---

### **Table : `article`**
Contient les articles publiés.

| **Champs**  | **Type de Données**                                              | **Description**                                                        |
|-------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                                               | Identifiant unique de l'article.                                       |
| created_at  | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                              | Date de création de l'article.                                         |
| updated_at  | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                              | Date de mise à jour de l'article.                                      |
| status      | VARCHAR(10) CHECK (status IN ('draft', 'published', 'archived')) | État de l'article.                                                     |
| author_id   | INT REFERENCES author(id)                                        | Référence à l'auteur de l'article (clé étrangère vers `author`).       |
| category_id | INT REFERENCES category(id)                                      | Référence à la catégorie de l'article (clé étrangère vers `category`). |

---
### **Table : `category_article`**
Contient les relations entre les articles et les catégories.

| **Champs**  | **Type de Données**                           | **Description**                                           |
|-------------|-----------------------------------------------|-----------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                            | Identifiant unique de la relation.                        |
| article_id  | INT REFERENCES article(id) ON DELETE CASCADE  | Référence à l'article (clé étrangère vers `article`).     |
| category_id | INT REFERENCES category(id) ON DELETE CASCADE | Référence à la catégorie (clé étrangère vers `category`). |

### **Table : `article_translation`**
Contient les traductions des articles.

| **Champs**  | **Type de Données**                          | **Description**                                                             |
|-------------|----------------------------------------------|-----------------------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                           | Identifiant unique de la traduction d'article.                              |
| article_id  | INT REFERENCES article(id) ON DELETE CASCADE | Référence à l'article (clé étrangère vers `article`).                       |
| language_id | INT REFERENCES language(id)                  | Référence à la langue de l'article traduit (clé étrangère vers `language`). |
| title       | VARCHAR(255) NOT NULL                        | Titre de l'article traduit.                                                 |
| slug        | VARCHAR(255) UNIQUE NOT NULL                 | Identifiant unique sous forme de chaîne pour l'article traduit.             |
| content     | TEXT                                         | Contenu de l'article traduit.                                               |

---

### **Table : `content_block`**
Contient les blocs de contenu associés aux traductions d'articles.

| **Champs**             | **Type de Données**                                          | **Description**                          |
|------------------------|--------------------------------------------------------------|------------------------------------------|
| id                     | SERIAL PRIMARY KEY                                           | Identifiant unique du bloc de contenu.   |
| article_translation_id | INT REFERENCES article_translation(id) ON DELETE CASCADE     | Référence à la traduction d'article.     |
| type                   | VARCHAR(50) CHECK (type IN ('text', 'image', 'code', 'url')) | Type de bloc de contenu.                 |
| position               | INT NOT NULL CHECK (position >= 1)                           | Position du bloc dans l'article traduit. |

---

### **Table : `content_block_translation`**
Contient les traductions des blocs de contenu.

| **Champs**       | **Type de Données**                                | **Description**                                                        |
|------------------|----------------------------------------------------|------------------------------------------------------------------------|
| id               | SERIAL PRIMARY KEY                                 | Identifiant unique de la traduction du bloc de contenu.                |
| content_block_id | INT REFERENCES content_block(id) ON DELETE CASCADE | Référence au bloc de contenu (clé étrangère vers `content_block`).     |
| language_id      | INT REFERENCES language(id)                        | Référence à la langue du bloc traduit (clé étrangère vers `language`). |
| value            | TEXT                                               | Contenu traduit du bloc (texte, URL, code, etc.).                      |

---

### **Table : `comment`**
Contient les commentaires sur les articles.

| **Champs**  | **Type de Données**                          | **Description**                                                |
|-------------|----------------------------------------------|----------------------------------------------------------------|
| id          | SERIAL PRIMARY KEY                           | Identifiant unique du commentaire.                             |
| article_id  | INT REFERENCES article(id) ON DELETE CASCADE | Référence à l'article commenté (clé étrangère vers `article`). |
| content     | TEXT NOT NULL                                | Contenu du commentaire.                                        |
| author_name | VARCHAR(255) NOT NULL                        | Nom de l'auteur du commentaire.                                |
| timestamp   | TIMESTAMP DEFAULT CURRENT_TIMESTAMP          | Date et heure de création du commentaire.                      |
