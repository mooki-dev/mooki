---
title: "Liquibase : Maîtriser les migrations de base de données en Java"
date: 2025-08-18
author: Andrea Larboullet Marin
category: backend
tags: ["liquibase", "database", "migration", "java", "spring-boot", "flyway", "versioning", "devops"]
description: "Guide de référence pour Liquibase, couvrant les migrations de base de données, le versioning et la comparaison avec Flyway pour les projets Java"
---

# Liquibase : Maîtriser les migrations de base de données en Java

Combien de fois avez-vous vécu le cauchemar d'une mise en production où la base de données n'était pas dans l'état attendu ? Un développeur a oublié d'appliquer une migration, un autre a modifié un script déjà exécuté, et voilà votre application qui plante mystérieusement. En 2025, ces problèmes appartiennent au passé grâce aux outils de migration modernes.

Liquibase s'impose comme la solution de référence pour gérer l'évolution des schémas de base de données dans l'écosystème Java. Contrairement aux migrations manuelles ou aux scripts SQL artisanaux, Liquibase offre un système de versioning robuste qui garantit la cohérence entre tous vos environnements.

Cet outil transforme la gestion de base de données d'un art obscur en processus industrialisé, traçable et reproductible. Mais face à Flyway, son concurrent direct, quel choix faire ? Nous explorerons cette question cruciale après avoir maîtrisé les fondamentaux.

## Qu'est-ce que Liquibase ?

### Le problème des migrations de base de données

Imaginez cette situation familière : votre équipe développe une application e-commerce. Le schéma initial contient une table `users` avec les colonnes `id`, `email` et `password`. Au fil des sprints :

- Sprint 2 : Ajout de `first_name` et `last_name`
- Sprint 4 : Modification de `password` en `password_hash` 256 caractères
- Sprint 7 : Nouvelle table `user_preferences` avec clé étrangère
- Sprint 10 : Index sur `email` pour améliorer les performances

Sans outil de migration, chaque environnement (développement, test, production) risque d'avoir un schéma différent. Les développeurs appliquent leurs modifications localement, mais oublient de documenter ou de partager les changements. L'administrateur de base de données applique manuellement les scripts en production, avec le risque d'erreurs.

### La solution Liquibase

Liquibase résout ces problèmes en apportant :

**Versioning déclaratif** : Chaque modification est décrite dans un fichier de changelog versionné avec votre code source.

**Traçabilité complète** : Liquibase maintient un historique de tous les changements appliqués dans une table `DATABASECHANGELOG`.

**Idempotence** : Les migrations ne s'exécutent qu'une seule fois, même si vous relancez le processus.

**Support multi-environnements** : Le même changelog fonctionne sur PostgreSQL, MySQL, Oracle, SQL Server, etc.

### Les concepts fondamentaux

Avant de plonger dans les exemples, maîtrisons le vocabulaire essentiel :

**Changelog** : Fichier principal qui liste toutes les modifications de schéma. Pensez-y comme à l'historique Git de votre base de données.

**ChangeSet** : Une modification atomique (créer une table, ajouter une colonne, insérer des données). Chaque ChangeSet possède un identifiant unique.

**Liquibase Context** : Permet d'exécuter certains changements uniquement dans des environnements spécifiques (dev, prod, test).

**Rollback** : Capacité d'annuler un changement. Liquibase peut générer automatiquement les rollbacks pour les opérations simples.

```xml
<!-- Exemple de changelog simple -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.27.xsd">

    <changeSet id="1" author="marie.dev">
        <createTable tableName="users">
            <column name="id" type="bigint" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="email" type="varchar(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="password_hash" type="varchar(256)">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>

</databaseChangeLog>
```

Cet exemple crée une table `users` avec les contraintes appropriées. L'identifiant `id="1"` et l'auteur `author="marie.dev"` forment une clé unique que Liquibase utilise pour tracker l'application de ce changement.

### Pourquoi pas des scripts SQL simples ?

Les scripts SQL traditionnels posent plusieurs problèmes que Liquibase résout élégamment :

**Problème de reproductibilité** : Un script `CREATE TABLE IF NOT EXISTS` peut masquer des différences de schéma entre environnements.

**Gestion des erreurs** : Si un script échoue à mi-parcours, comment reprendre proprement ?

**Ordre d'exécution** : Dans une équipe, comment garantir que les scripts s'exécutent dans le bon ordre ?

**Rollback** : Comment annuler proprement une migration complexe ?

Liquibase transforme ces défis en avantages :

```java
// Spring Boot détecte automatiquement Liquibase
@SpringBootApplication
public class EcommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
        // Les migrations s'exécutent automatiquement au démarrage
    }
}
```

## Installation et configuration Java

### Prérequis et versions

Liquibase 4.27+ (version recommandée 2025) nécessite :
- **Java 8+** (Java 17+ recommandé pour les nouvelles applications)
- **Spring Boot 3.x** (pour les projets Spring)
- **Base de données supportée** : PostgreSQL, MySQL, Oracle, SQL Server, H2, etc.

### Installation Maven

Ajoutez Liquibase à votre `pom.xml` :

```xml
<dependencies>
    <!-- Spring Boot Starter (inclut Liquibase) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Liquibase Core -->
    <dependency>
        <groupId>org.liquibase</groupId>
        <artifactId>liquibase-core</artifactId>
        <version>4.27.0</version>
    </dependency>

    <!-- Driver de base de données (exemple PostgreSQL) -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <!-- Plugin Maven Liquibase pour commandes CLI -->
        <plugin>
            <groupId>org.liquibase</groupId>
            <artifactId>liquibase-maven-plugin</artifactId>
            <version>4.27.0</version>
            <configuration>
                <propertyFile>src/main/resources/liquibase.properties</propertyFile>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### Installation Gradle

Pour les projets Gradle :

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.liquibase:liquibase-core:4.27.0'
    runtimeOnly 'org.postgresql:postgresql'
}

plugins {
    id 'org.liquibase.gradle' version '2.2.0'
}

liquibase {
    activities {
        main {
            changelogFile 'src/main/resources/db/changelog/db.changelog-master.xml'
            url 'jdbc:postgresql://localhost:5432/ecommerce'
            username 'dev_user'
            password 'dev_password'
        }
    }
}
```

### Configuration Spring Boot

Configurez Liquibase dans votre `application.yml` :

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce
    username: ${DB_USERNAME:dev_user}
    password: ${DB_PASSWORD:dev_password}
    driver-class-name: org.postgresql.Driver

  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.xml
    contexts: ${LIQUIBASE_CONTEXTS:dev,prod}
    labels: ${LIQUIBASE_LABELS:}
    drop-first: false  # ATTENTION: Ne jamais activer en production
    enabled: true

  jpa:
    hibernate:
      ddl-auto: validate  # Laisse Liquibase gérer le schéma
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
```

### Structure des fichiers

Organisez vos changelogs selon cette structure recommandée :

```
src/main/resources/
└── db/
    └── changelog/
        ├── db.changelog-master.xml          # Fichier principal
        ├── changes/
        │   ├── v1.0/
        │   │   ├── 001-create-users-table.xml
        │   │   ├── 002-create-products-table.xml
        │   │   └── 003-add-user-indexes.xml
        │   ├── v1.1/
        │   │   ├── 004-add-user-preferences.xml
        │   │   └── 005-modify-product-price.xml
        │   └── v2.0/
        │       └── 006-major-schema-refactor.xml
        └── data/
            ├── dev/
            │   └── sample-data.xml
            └── prod/
                └── reference-data.xml
```

### Master changelog

Le fichier `db.changelog-master.xml` orchestre tous les autres :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.27.xsd">

    <!-- Version 1.0 - Schema initial -->
    <include file="db/changelog/changes/v1.0/001-create-users-table.xml"/>
    <include file="db/changelog/changes/v1.0/002-create-products-table.xml"/>
    <include file="db/changelog/changes/v1.0/003-add-user-indexes.xml"/>

    <!-- Version 1.1 - Nouvelles fonctionnalités -->
    <include file="db/changelog/changes/v1.1/004-add-user-preferences.xml"/>
    <include file="db/changelog/changes/v1.1/005-modify-product-price.xml"/>

    <!-- Données de référence (contexte spécifique) -->
    <include file="db/changelog/data/dev/sample-data.xml" context="dev"/>
    <include file="db/changelog/data/prod/reference-data.xml" context="prod"/>

</databaseChangeLog>
```

### Configuration pour différents environnements

Utilisez les profils Spring pour gérer les environnements :

```yaml
# application-dev.yml
spring:
  liquibase:
    contexts: dev
    labels: sample-data
  datasource:
    url: jdbc:h2:mem:testdb

---
# application-prod.yml
spring:
  liquibase:
    contexts: prod
    labels: essential-only
  datasource:
    url: jdbc:postgresql://prod-db:5432/ecommerce
```

### Vérification de l'installation

Testez votre configuration avec cette classe de test :

```java
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
class LiquibaseIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @Order(1)
    void shouldApplyMigrations() {
        // Vérifier que les tables de tracking Liquibase existent
        assertDoesNotThrow(() -> {
            jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM DATABASECHANGELOG",
                Integer.class
            );
        });
    }

    @Test
    @Order(2)
    void shouldCreateUserTable() {
        // Vérifier que notre table users a été créée
        assertDoesNotThrow(() -> {
            jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users",
                Integer.class
            );
        });
    }

    @Test
    @Order(3)
    void shouldHaveCorrectSchema() {
        // Vérifier la structure de la table
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(
            "SELECT column_name, data_type FROM information_schema.columns " +
            "WHERE table_name = 'users' ORDER BY ordinal_position"
        );

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).get("column_name")).isEqualTo("id");
        assertThat(columns.get(1).get("column_name")).isEqualTo("email");
        assertThat(columns.get(2).get("column_name")).isEqualTo("password_hash");
    }
}
```

## Migrations avec exemples pratiques

### Votre première migration

Commençons par créer une table utilisateur complète avec toutes les bonnes pratiques :

```xml
<!-- 001-create-users-table.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.27.xsd">

    <changeSet id="create-users-table" author="dev-team">
        <comment>Création de la table users pour l'authentification</comment>

        <createTable tableName="users">
            <column name="id" type="bigserial">
                <constraints primaryKey="true" nullable="false"/>
            </column>

            <column name="email" type="varchar(255)">
                <constraints nullable="false" unique="true"/>
            </column>

            <column name="password_hash" type="varchar(256)">
                <constraints nullable="false"/>
            </column>

            <column name="first_name" type="varchar(100)">
                <constraints nullable="false"/>
            </column>

            <column name="last_name" type="varchar(100)">
                <constraints nullable="false"/>
            </column>

            <column name="is_active" type="boolean" defaultValueBoolean="true">
                <constraints nullable="false"/>
            </column>

            <column name="created_at" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>

            <column name="updated_at" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>

        <!-- Index pour améliorer les performances de recherche -->
        <createIndex tableName="users" indexName="idx_users_email">
            <column name="email"/>
        </createIndex>

        <createIndex tableName="users" indexName="idx_users_active">
            <column name="is_active"/>
        </createIndex>

        <!-- Rollback explicite si nécessaire -->
        <rollback>
            <dropTable tableName="users"/>
        </rollback>
    </changeSet>

</databaseChangeLog>
```

### Migration avec données initiales

Ajoutons des données de référence avec des préconditions :

```xml
<!-- 002-insert-admin-user.xml -->
<changeSet id="insert-admin-user" author="dev-team" context="dev,test">
    <comment>Insertion de l'utilisateur administrateur par défaut</comment>

    <!-- Précondition : vérifier que la table existe et est vide -->
    <preConditions onFail="MARK_RAN">
        <tableExists tableName="users"/>
        <sqlCheck expectedResult="0">
            SELECT COUNT(*) FROM users WHERE email = 'admin@example.com'
        </sqlCheck>
    </preConditions>

    <insert tableName="users">
        <column name="email" value="admin@example.com"/>
        <column name="password_hash" value="$2a$12$encrypted.hash.here"/>
        <column name="first_name" value="System"/>
        <column name="last_name" value="Administrator"/>
        <column name="is_active" valueBoolean="true"/>
    </insert>

    <rollback>
        <delete tableName="users">
            <where>email = 'admin@example.com'</where>
        </delete>
    </rollback>
</changeSet>
```

### Modification de schéma complexe

Voyons comment gérer une migration plus complexe qui modifie une colonne existante :

```xml
<!-- 003-extend-user-names.xml -->
<changeSet id="extend-user-names" author="marie.dev">
    <comment>Extension de la taille des noms utilisateur pour supporter les noms internationaux</comment>

    <!-- Précondition : vérifier la structure actuelle -->
    <preConditions onFail="HALT">
        <columnExists tableName="users" columnName="first_name"/>
        <columnExists tableName="users" columnName="last_name"/>
    </preConditions>

    <!-- Modification de la taille des colonnes -->
    <modifyDataType tableName="users" columnName="first_name" newDataType="varchar(200)"/>
    <modifyDataType tableName="users" columnName="last_name" newDataType="varchar(200)"/>

    <!-- Ajout d'une colonne pour les noms complets pré-calculés -->
    <addColumn tableName="users">
        <column name="full_name" type="varchar(400)">
            <constraints nullable="true"/>
        </column>
    </addColumn>

    <!-- Mise à jour des données existantes -->
    <sql>
        UPDATE users
        SET full_name = CONCAT(first_name, ' ', last_name)
        WHERE full_name IS NULL;
    </sql>

    <!-- Rendre la colonne obligatoire après la mise à jour -->
    <addNotNullConstraint tableName="users" columnName="full_name"/>

    <rollback>
        <dropColumn tableName="users" columnName="full_name"/>
        <modifyDataType tableName="users" columnName="first_name" newDataType="varchar(100)"/>
        <modifyDataType tableName="users" columnName="last_name" newDataType="varchar(100)"/>
    </rollback>
</changeSet>
```

### Migration avec SQL personnalisé

Parfois, les opérations Liquibase standard ne suffisent pas. Utilisez du SQL brut :

```xml
<!-- 004-create-user-audit-trigger.xml -->
<changeSet id="create-audit-trigger" author="dba-team">
    <comment>Création d'un trigger d'audit pour tracer les modifications utilisateur</comment>

    <!-- Création de la table d'audit -->
    <createTable tableName="users_audit">
        <column name="audit_id" type="bigserial">
            <constraints primaryKey="true"/>
        </column>
        <column name="user_id" type="bigint">
            <constraints nullable="false"/>
        </column>
        <column name="operation" type="varchar(10)">
            <constraints nullable="false"/>
        </column>
        <column name="old_values" type="jsonb"/>
        <column name="new_values" type="jsonb"/>
        <column name="changed_by" type="varchar(255)"/>
        <column name="changed_at" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP"/>
    </createTable>

    <!-- Trigger PostgreSQL avec fonction PL/pgSQL -->
    <sql dbms="postgresql">
        CREATE OR REPLACE FUNCTION users_audit_trigger()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'DELETE' THEN
                INSERT INTO users_audit(user_id, operation, old_values, changed_by)
                VALUES (OLD.id, 'DELETE', row_to_json(OLD), current_user);
                RETURN OLD;
            ELSIF TG_OP = 'UPDATE' THEN
                INSERT INTO users_audit(user_id, operation, old_values, new_values, changed_by)
                VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
                RETURN NEW;
            ELSIF TG_OP = 'INSERT' THEN
                INSERT INTO users_audit(user_id, operation, new_values, changed_by)
                VALUES (NEW.id, 'INSERT', row_to_json(NEW), current_user);
                RETURN NEW;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER users_audit_trigger
        AFTER INSERT OR UPDATE OR DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION users_audit_trigger();
    </sql>

    <!-- Version MySQL alternative -->
    <sql dbms="mysql">
        DELIMITER //
        CREATE TRIGGER users_audit_insert
        AFTER INSERT ON users FOR EACH ROW
        BEGIN
            INSERT INTO users_audit(user_id, operation, new_values, changed_by)
            VALUES (NEW.id, 'INSERT', JSON_OBJECT(
                'email', NEW.email,
                'first_name', NEW.first_name,
                'last_name', NEW.last_name
            ), USER());
        END//
        DELIMITER ;
    </sql>

    <rollback>
        <sql dbms="postgresql">
            DROP TRIGGER IF EXISTS users_audit_trigger ON users;
            DROP FUNCTION IF EXISTS users_audit_trigger();
        </sql>
        <sql dbms="mysql">
            DROP TRIGGER IF EXISTS users_audit_insert;
        </sql>
        <dropTable tableName="users_audit"/>
    </rollback>
</changeSet>
```

### Gestion des environnements avec contextes

Utilisons les contextes pour des migrations spécifiques aux environnements :

```xml
<!-- 005-environment-specific-data.xml -->
<changeSet id="dev-sample-data" author="dev-team" context="dev">
    <comment>Données d'exemple pour l'environnement de développement</comment>

    <loadData file="db/data/dev-users.csv" tableName="users">
        <column name="email" type="STRING"/>
        <column name="password_hash" type="STRING"/>
        <column name="first_name" type="STRING"/>
        <column name="last_name" type="STRING"/>
        <column name="is_active" type="BOOLEAN"/>
    </loadData>
</changeSet>

<changeSet id="prod-reference-data" author="ops-team" context="prod">
    <comment>Données de référence pour la production</comment>

    <insert tableName="users">
        <column name="email" value="support@company.com"/>
        <column name="password_hash" value="$2a$12$production.hash"/>
        <column name="first_name" value="Customer"/>
        <column name="last_name" value="Support"/>
        <column name="is_active" valueBoolean="true"/>
    </insert>
</changeSet>

<changeSet id="performance-indexes" author="dba-team" context="prod">
    <comment>Index supplémentaires pour la production</comment>

    <createIndex tableName="users" indexName="idx_users_created_at">
        <column name="created_at"/>
    </createIndex>

    <createIndex tableName="users_audit" indexName="idx_audit_user_date">
        <column name="user_id"/>
        <column name="changed_at"/>
    </createIndex>
</changeSet>
```

### Migration avec validation

Validons nos données avec des préconditions avancées :

```xml
<!-- 006-data-validation.xml -->
<changeSet id="validate-user-data" author="qa-team">
    <comment>Validation de l'intégrité des données utilisateur</comment>

    <preConditions onFail="HALT">
        <and>
            <!-- Vérifier qu'il n'y a pas d'emails en doublon -->
            <sqlCheck expectedResult="0">
                SELECT COUNT(*) FROM (
                    SELECT email, COUNT(*) as cnt
                    FROM users
                    GROUP BY email
                    HAVING COUNT(*) > 1
                ) duplicates
            </sqlCheck>

            <!-- Vérifier qu'il n'y a pas de mots de passe vides -->
            <sqlCheck expectedResult="0">
                SELECT COUNT(*) FROM users
                WHERE password_hash IS NULL OR LENGTH(password_hash) < 10
            </sqlCheck>

            <!-- Vérifier qu'au moins un admin existe -->
            <sqlCheck expectedResult="1">
                SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
                FROM users
                WHERE email LIKE '%admin%' OR email LIKE '%support%'
            </sqlCheck>
        </and>
    </preConditions>

    <!-- Si toutes les validations passent, marquer comme exécuté -->
    <tagDatabase tag="data-validated-v1.0"/>
</changeSet>
```

### Commandes utiles

Pendant le développement, ces commandes Maven/Gradle vous seront utiles :

```bash
# Voir le statut des migrations
mvn liquibase:status

# Voir les changements en attente
mvn liquibase:updateSQL

# Appliquer les migrations
mvn liquibase:update

# Rollback du dernier changement
mvn liquibase:rollback -Dliquibase.rollbackCount=1

# Rollback jusqu'à un tag spécifique
mvn liquibase:rollback -Dliquibase.rollbackTag=data-validated-v1.0

# Générer la documentation
mvn liquibase:dbDoc

# Comparer deux bases de données
mvn liquibase:diff
```

## Liquibase vs Flyway : le match du siècle

### Philosophies opposées

La différence fondamentale entre Liquibase et Flyway réside dans leur approche philosophique :

**Flyway : "SQL First"**
Flyway privilégie la simplicité et le pragmatisme. Son créateur, Axel Fontaine, a conçu l'outil avec cette devise : "Database migrations made easy". Flyway mise sur des scripts SQL purs, nommés selon une convention stricte :

```sql
-- V001__Create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Liquibase : "Database Refactoring"**
Liquibase, créé par Nathan Voxland, adopte une approche plus abstraite. Il considère l'évolution de base de données comme un processus de refactoring nécessitant des outils sophistiqués :

```xml
<changeSet id="create-users-table" author="dev">
    <createTable tableName="users">
        <column name="id" type="bigserial">
            <constraints primaryKey="true"/>
        </column>
        <column name="email" type="varchar(255)">
            <constraints nullable="false" unique="true"/>
        </column>
        <!-- ... -->
    </createTable>
</changeSet>
```

### Comparaison détaillée

#### 1. Facilité d'adoption

**Flyway gagne haut la main**

```java
// Configuration Flyway - minimal
@Configuration
public class FlywayConfig {
    @Bean
    public Flyway flyway(DataSource dataSource) {
        return Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .load();
    }
}
```

Tout développeur Java peut écrire des migrations Flyway immédiatement. Pas de syntaxe XML à apprendre, pas de concepts abstraits. Vous écrivez du SQL, point.

**Liquibase demande un investissement initial**

```xml
<!-- Il faut comprendre la structure XML, les types abstraits, etc. -->
<changeSet id="1" author="dev">
    <addColumn tableName="users">
        <column name="phone" type="varchar(20)">
            <constraints nullable="true"/>
        </column>
    </addColumn>
</changeSet>
```

La courbe d'apprentissage est plus raide, mais l'investissement peut être rentable à long terme.

#### 2. Expressivité et lisibilité

**Avantage SQL (Flyway)**

```sql
-- V002__Add_user_preferences.sql
-- Clair, direct, familier
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN newsletter_opt_in BOOLEAN DEFAULT false;

CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(5) DEFAULT 'fr'
);
```

**Avantage abstraction (Liquibase)**

```xml
<changeSet id="add-user-preferences" author="dev">
    <addColumn tableName="users">
        <column name="phone" type="varchar(20)"/>
        <column name="newsletter_opt_in" type="boolean" defaultValueBoolean="false"/>
    </addColumn>

    <createTable tableName="user_preferences">
        <column name="id" type="bigserial">
            <constraints primaryKey="true"/>
        </column>
        <column name="user_id" type="bigint">
            <constraints foreignKeyName="fk_preferences_user" references="users(id)"/>
        </column>
        <column name="theme" type="varchar(20)" defaultValue="light"/>
        <column name="language" type="varchar(5)" defaultValue="fr"/>
    </createTable>
</changeSet>
```

Liquibase est plus verbeux mais explicite sur les contraintes et types.

#### 3. Support multi-bases

**Liquibase : champion toutes catégories**

Un changelog Liquibase fonctionne sur PostgreSQL, MySQL, Oracle, SQL Server, H2, etc. :

```xml
<changeSet id="cross-db-example" author="dev">
    <createTable tableName="audit_log">
        <column name="id" type="bigint" autoIncrement="true">
            <constraints primaryKey="true"/>
        </column>
        <column name="timestamp" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP"/>
        <column name="data" type="clob"/>  <!-- Abstrait : TEXT/LONGTEXT/etc selon DB -->
    </createTable>
</changeSet>
```

**Flyway : SQL spécifique par base**

```sql
-- V003__Create_audit_log.sql (PostgreSQL)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data TEXT
);
```

```sql
-- V003__Create_audit_log.sql (MySQL)
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data LONGTEXT
);
```

Flyway nécessite des scripts différents par base de données, mais offre un contrôle total.

#### 4. Rollback et récupération

**Liquibase : rollback automatique**

```xml
<changeSet id="risky-change" author="dev">
    <addColumn tableName="users">
        <column name="temporary_field" type="varchar(100)"/>
    </addColumn>
    <!-- Rollback généré automatiquement -->
</changeSet>
```

```bash
# Annuler facilement
mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

**Flyway : rollback manuel (édition payante pour l'automatique)**

```sql
-- U002__Undo_add_user_preferences.sql
-- Rollback manuel, mais total contrôle
DROP TABLE user_preferences;
ALTER TABLE users DROP COLUMN newsletter_opt_in;
ALTER TABLE users DROP COLUMN phone;
```

#### 5. Gestion des conflits en équipe

**Problème commun : collision de versions**

Équipe de 5 développeurs, chacun crée une migration :
- Alice : V005__Add_payment_methods.sql
- Bob : V005__Add_user_roles.sql
- Charlie : V005__Update_product_schema.sql

**Solution Flyway** : Renommage manuel et coordination d'équipe
```bash
# Alice renomme en V007, Bob en V008, etc.
mv V005__Add_payment_methods.sql V007__Add_payment_methods.sql
```

**Solution Liquibase** : Master changelog ordonne les changements
```xml
<databaseChangeLog>
    <!-- Ordre défini explicitement, pas de collision -->
    <include file="alice/payment-methods.xml"/>
    <include file="bob/user-roles.xml"/>
    <include file="charlie/product-schema.xml"/>
</databaseChangeLog>
```

### Scénarios d'usage recommandés

#### Choisir Flyway quand :

**1. Équipe SQL-first**
```java
@Configuration
@Profile("!test")
public class ProductionConfig {
    // Flyway convient parfaitement aux équipes avec DBA dédiés
    // qui préfèrent écrire et maintenir du SQL pur
}
```

**2. Base de données unique**
```sql
-- Optimisations PostgreSQL spécifiques
CREATE INDEX CONCURRENTLY idx_users_email_gin
ON users USING gin(email gin_trgm_ops);

CREATE MATERIALIZED VIEW user_stats AS
SELECT DATE_TRUNC('month', created_at) as month,
       COUNT(*) as user_count
FROM users GROUP BY 1;
```

**3. Migrations simples**
```sql
-- Straightforward, pas de logique complexe
ALTER TABLE products ADD COLUMN price_cents INTEGER;
UPDATE products SET price_cents = ROUND(price * 100);
ALTER TABLE products DROP COLUMN price;
```

#### Choisir Liquibase quand :

**1. Multi-bases de données**
```xml
<!-- Un seul changelog pour PostgreSQL, MySQL, Oracle -->
<changeSet id="universal-schema" author="dev">
    <createTable tableName="orders">
        <column name="id" type="bigint" autoIncrement="true">
            <constraints primaryKey="true"/>
        </column>
        <column name="amount" type="decimal(10,2)"/>
        <column name="created_at" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP"/>
    </createTable>
</changeSet>
```

**2. Écosystème Java enterprise**
```java
@SpringBootApplication
public class EnterpriseApp {
    // Liquibase s'intègre naturellement dans l'écosystème Spring
    // Contexts, profiles, conditional migrations
}
```

**3. Gouvernance stricte**
```xml
<changeSet id="audited-change" author="john.doe" runOnChange="false">
    <preConditions onFail="HALT">
        <sqlCheck expectedResult="0">
            SELECT COUNT(*) FROM sensitive_data WHERE status = 'invalid'
        </sqlCheck>
    </preConditions>
    <!-- Migration sécurisée avec préconditions -->
</changeSet>
```

### Benchmark pratique

Créons le même schéma avec les deux outils pour comparer :

**Mission** : Créer un système de commandes e-commerce

#### Version Flyway

```sql
-- V001__Create_base_schema.sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_cents INTEGER NOT NULL,
    stock_quantity INTEGER DEFAULT 0
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    total_cents INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    product_id BIGINT REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_cents INTEGER NOT NULL
);

-- Index pour les performances
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

**Temps de développement** : ~15 minutes
**Lignes de code** : 35 lignes SQL
**Lisibilité** : ⭐⭐⭐⭐⭐ (SQL familier)

#### Version Liquibase

```xml
<!-- db.changelog-master.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.27.xsd">

    <changeSet id="create-customers-table" author="dev">
        <createTable tableName="customers">
            <column name="id" type="bigserial">
                <constraints primaryKey="true"/>
            </column>
            <column name="email" type="varchar(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="first_name" type="varchar(100)">
                <constraints nullable="false"/>
            </column>
            <column name="last_name" type="varchar(100)">
                <constraints nullable="false"/>
            </column>
            <column name="created_at" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>

    <changeSet id="create-products-table" author="dev">
        <createTable tableName="products">
            <column name="id" type="bigserial">
                <constraints primaryKey="true"/>
            </column>
            <column name="name" type="varchar(255)">
                <constraints nullable="false"/>
            </column>
            <column name="price_cents" type="integer">
                <constraints nullable="false"/>
            </column>
            <column name="stock_quantity" type="integer" defaultValueNumeric="0"/>
        </createTable>
    </changeSet>

    <changeSet id="create-orders-table" author="dev">
        <createTable tableName="orders">
            <column name="id" type="bigserial">
                <constraints primaryKey="true"/>
            </column>
            <column name="customer_id" type="bigint">
                <constraints foreignKeyName="fk_orders_customer" references="customers(id)"/>
            </column>
            <column name="total_cents" type="integer">
                <constraints nullable="false"/>
            </column>
            <column name="status" type="varchar(20)" defaultValue="pending"/>
            <column name="created_at" type="timestamp" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>

    <changeSet id="create-order-items-table" author="dev">
        <createTable tableName="order_items">
            <column name="id" type="bigserial">
                <constraints primaryKey="true"/>
            </column>
            <column name="order_id" type="bigint">
                <constraints foreignKeyName="fk_order_items_order" references="orders(id)"/>
            </column>
            <column name="product_id" type="bigint">
                <constraints foreignKeyName="fk_order_items_product" references="products(id)"/>
            </column>
            <column name="quantity" type="integer">
                <constraints nullable="false"/>
            </column>
            <column name="price_cents" type="integer">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>

    <changeSet id="create-performance-indexes" author="dev">
        <createIndex tableName="orders" indexName="idx_orders_customer">
            <column name="customer_id"/>
        </createIndex>
        <createIndex tableName="order_items" indexName="idx_order_items_order">
            <column name="order_id"/>
        </createIndex>
    </changeSet>

</databaseChangeLog>
```

**Temps de développement** : ~45 minutes
**Lignes de code** : 75 lignes XML
**Lisibilité** : ⭐⭐⭐ (verbeux mais explicite)

### Verdict nuancé

**Flyway l'emporte si :**
- ✅ Équipe confortable avec SQL
- ✅ Base de données unique ou homogène
- ✅ Migrations simples à modérément complexes
- ✅ Préférence pour la simplicité
- ✅ Budget limité (version gratuite très capable)

**Liquibase l'emporte si :**
- ✅ Support multi-bases de données requis
- ✅ Environnements complexes (dev/test/staging/prod)
- ✅ Équipe Java enterprise
- ✅ Besoins de rollback sophistiqués
- ✅ Intégration CI/CD avancée
- ✅ Gouvernance et audit stricts

**Le choix hybride** : Certaines équipes utilisent Flyway pour les migrations simples et Liquibase pour les refactorings complexes. Mais cette approche peut créer de la confusion.

### Recommandation 2025

Pour un nouveau projet Java/Spring Boot en 2025 :

1. **Prototype avec Flyway** : Démarrez rapidement avec des migrations SQL simples
2. **Évaluez la complexité** : Si vous anticipez des besoins multi-bases ou de rollback complexes, migrez vers Liquibase tôt
3. **Considérez l'équipe** : Liquibase nécessite un investissement en formation, mais offre plus de puissance à long terme

Dans la plupart des cas, **Flyway suffit** pour 80% des projets Java modernes. Liquibase devient indispensable pour les 20% restants qui ont des besoins spécifiques.

## Patterns avancés et bonnes pratiques

### Organisation des changelogs à grande échelle

Dans une application enterprise, l'organisation des migrations devient critique. Voici une architecture éprouvée :

```
resources/db/changelog/
├── db.changelog-master.xml                 # Point d'entrée principal
├── releases/
│   ├── v1.0/
│   │   ├── db.changelog-v1.0.xml          # Master de la release
│   │   ├── 001-schema/
│   │   │   ├── 001-create-users.xml
│   │   │   ├── 002-create-products.xml
│   │   │   └── 003-create-orders.xml
│   │   ├── 002-data/
│   │   │   ├── 001-reference-data.xml
│   │   │   └── 002-initial-admin.xml
│   │   └── 003-indexes/
│   │       └── 001-performance-indexes.xml
│   ├── v1.1/
│   └── v2.0/
├── hotfixes/
│   ├── hotfix-2024-001-security-patch.xml
│   └── hotfix-2024-002-data-corruption.xml
└── utilities/
    ├── common-functions.xml
    └── test-data-cleanup.xml
```

#### Master changelog structuré

```xml
<!-- db.changelog-master.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.27.xsd">

    <!-- Fonctions utilitaires communes -->
    <include file="db/changelog/utilities/common-functions.xml"/>

    <!-- Releases en ordre chronologique -->
    <include file="db/changelog/releases/v1.0/db.changelog-v1.0.xml"/>
    <include file="db/changelog/releases/v1.1/db.changelog-v1.1.xml"/>
    <include file="db/changelog/releases/v1.2/db.changelog-v1.2.xml"/>

    <!-- Hotfixes critiques -->
    <include file="db/changelog/hotfixes/hotfix-2024-001-security-patch.xml"/>
    <include file="db/changelog/hotfixes/hotfix-2024-002-data-corruption.xml"/>

    <!-- Version en cours de développement -->
    <include file="db/changelog/releases/v2.0/db.changelog-v2.0.xml"/>

</databaseChangeLog>
```

### Gestion des secrets et données sensibles

Ne jamais stocker de données sensibles dans les changelogs versionnés :

```xml
<!-- MAUVAISE PRATIQUE -->
<changeSet id="bad-practice" author="dev">
    <insert tableName="api_keys">
        <column name="service" value="payment"/>
        <column name="key" value="sk_live_abc123secretkey456"/>
    </insert>
</changeSet>
```

#### Solution 1 : Variables d'environnement

```xml
<!-- Bon : utiliser des variables -->
<changeSet id="secure-api-keys" author="dev">
    <insert tableName="api_keys">
        <column name="service" value="payment"/>
        <column name="key" value="${payment.api.key}"/>
    </insert>
</changeSet>
```

```yaml
# application-prod.yml
spring:
  liquibase:
    parameters:
      payment.api.key: ${PAYMENT_API_KEY}
```

#### Solution 2 : Préconditions pour les données existantes

```xml
<changeSet id="conditional-secrets" author="ops">
    <preConditions onFail="MARK_RAN">
        <sqlCheck expectedResult="0">
            SELECT COUNT(*) FROM api_keys WHERE service = 'payment'
        </sqlCheck>
    </preConditions>

    <comment>Insertion des clés API si elles n'existent pas</comment>
    <sql>
        INSERT INTO api_keys (service, key)
        VALUES ('payment', '${payment.api.key}')
        WHERE NOT EXISTS (
            SELECT 1 FROM api_keys WHERE service = 'payment'
        );
    </sql>
</changeSet>
```

### Stratégies de migration zero-downtime

Pour les applications critiques, les migrations doivent s'exécuter sans interruption de service :

#### Pattern 1 : Expand-Contract

```xml
<!-- Étape 1 : Expand - Ajouter la nouvelle colonne -->
<changeSet id="expand-user-email" author="dev">
    <addColumn tableName="users">
        <column name="email_new" type="varchar(255)">
            <constraints nullable="true"/>
        </column>
    </addColumn>
</changeSet>

<!-- Étape 2 : Migration des données (peut être longue) -->
<changeSet id="migrate-email-data" author="dev">
    <sql splitStatements="false">
        DO $$
        DECLARE
            batch_size INTEGER := 1000;
            offset_val INTEGER := 0;
            rows_updated INTEGER;
        BEGIN
            LOOP
                UPDATE users
                SET email_new = LOWER(TRIM(email))
                WHERE id IN (
                    SELECT id FROM users
                    WHERE email_new IS NULL
                    LIMIT batch_size
                );

                GET DIAGNOSTICS rows_updated = ROW_COUNT;
                EXIT WHEN rows_updated = 0;

                -- Pause pour éviter de bloquer la base
                PERFORM pg_sleep(0.1);
            END LOOP;
        END $$;
    </sql>
</changeSet>

<!-- Étape 3 : Validation des données -->
<changeSet id="validate-email-migration" author="dev">
    <preConditions onFail="HALT">
        <sqlCheck expectedResult="0">
            SELECT COUNT(*) FROM users WHERE email_new IS NULL AND email IS NOT NULL
        </sqlCheck>
    </preConditions>

    <addNotNullConstraint tableName="users" columnName="email_new"/>
    <addUniqueConstraint tableName="users" columnNames="email_new" constraintName="uk_users_email_new"/>
</changeSet>

<!-- Étape 4 : Contract - Supprimer l'ancienne colonne (après déploiement app) -->
<changeSet id="contract-user-email" author="dev" context="cleanup">
    <dropColumn tableName="users" columnName="email"/>
    <renameColumn tableName="users" oldColumnName="email_new" newColumnName="email"/>
</changeSet>
```

## Conclusion

Liquibase en 2025 s'affirme comme bien plus qu'un simple outil de migration : c'est une plateforme complète de gestion du cycle de vie des bases de données. Sa capacité à abstraire les spécificités des différents SGBD tout en offrant un contrôle fin sur les opérations complexes en fait un choix privilégié pour les architectures enterprise.

L'évolution vers des pratiques DevOps matures rend la maîtrise de Liquibase indispensable. Les équipes qui investissent dans cet outil découvrent rapidement que la gestion de base de données devient prévisible, traçable et automatisable. Les migrations ne sont plus une source d'angoisse lors des déploiements, mais un processus industrialisé et fiable.

Face à Flyway, le choix se résume souvent à une question de philosophie : privilégier la simplicité SQL (Flyway) ou investir dans une solution plus complète mais complexe (Liquibase). Pour les projets Java modernes avec des besoins multi-environnements ou multi-bases, Liquibase offre une valeur ajoutée indéniable. Pour des applications plus simples, Flyway reste parfaitement adapté.

L'avenir de Liquibase s'oriente vers une intégration encore plus poussée avec l'écosystème cloud-native. Les fonctionnalités de rollback automatique, les préconditions avancées, et l'intégration CI/CD positionnent l'outil comme un élément central des chaînes de déploiement modernes.

La maîtrise de ces patterns avancés - migrations zero-downtime, testing automatisé, monitoring intelligent - transforme la gestion de base de données d'un art traditionnel en discipline d'ingénierie moderne. C'est cette transformation qui fait de Liquibase un investissement stratégique pour toute équipe sérieuse sur la qualité et la maintenabilité de ses applications.

## Ressources

### Documentation officielle
- [Liquibase Documentation](https://docs.liquibase.com/)
- [Liquibase Best Practices](https://docs.liquibase.com/concepts/bestpractices.html)
- [Spring Boot Integration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.liquibase)
- [Liquibase Maven Plugin](https://docs.liquibase.com/tools-integrations/maven/home.html)

### Outils et extensions
- [Liquibase Hub](https://hub.liquibase.com/) - Plateforme de collaboration
- [Liquibase Pro](https://www.liquibase.com/products/pro) - Fonctionnalités avancées
- [Testcontainers](https://www.testcontainers.org/) - Tests d'intégration
- [Liquibase Gradle Plugin](https://github.com/liquibase/liquibase-gradle-plugin)

### Comparaisons et alternatives
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Database Migration Tools Comparison](https://github.com/topics/database-migration)
- [Schema Evolution Patterns](https://martinfowler.com/articles/evodb.html)

### Ressources d'apprentissage
- [Liquibase University](https://learn.liquibase.com/) - Formation officielle
- [Refactoring Databases (Ambler & Sadalage)](https://databaserefactoring.com/)
- [Database Versioning Best Practices](https://www.liquibase.com/blog/database-versioning-best-practices)
- [Zero-Downtime Deployments](https://www.liquibase.com/blog/zero-downtime-deployments)
