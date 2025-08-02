---
title: "Guide complet Docker Compose moderne"
date: 2025-08-02
tags: [docker, compose, orchestration, containers, devops, v2]
author: mooki
excerpt: "Maîtrisez Docker Compose V2 pour orchestrer vos applications multi-conteneurs : de compose.yaml aux dernières fonctionnalités 2025"
category: tutoriels
---

# Guide complet Docker Compose moderne

Docker Compose V2 révolutionne la gestion d'applications multi-conteneurs avec une nouvelle architecture, des commandes simplifiées et le fichier `compose.yaml` moderne. Ce guide couvre toutes les fonctionnalités 2025, du développement local au déploiement en production.

## Introduction à Docker Compose

### Qu'est-ce que Docker Compose ?

Docker Compose est un outil permettant de définir et exécuter des applications Docker multi-conteneurs. Avec un fichier YAML, vous configurez tous les services de votre application, puis créez et démarrez tous les services d'une seule commande.

### Cas d'usage typiques

- **Stack LAMP/LEMP** : Apache/Nginx + PHP + MySQL
- **Applications web** : Frontend + Backend + Base de données + Cache
- **Microservices** : Multiple APIs + Message queue + Monitoring
- **Environnements de développement** : Reproductibilité entre équipes

## Installation

### Docker Compose V2 (recommandé)

```bash
# Installation avec Docker Desktop (macOS/Windows)
# Compose V2 est inclus automatiquement

# Linux - Installation Docker Desktop ou plugin
curl -fsSL https://get.docker.com | sh
sudo apt install docker-compose-plugin

# Ou avec Docker Desktop
wget https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb
sudo apt install ./docker-desktop-amd64.deb

# Vérification V2
docker compose version
```

### Installation moderne recommandée

```bash
# macOS avec Docker Desktop (recommandé)
brew install --cask docker

# Ou télécharger Docker Desktop
# https://www.docker.com/products/docker-desktop

# Vérification
docker compose version
```

### Différences V1 vs V2

```bash
# ❌ Ancien Docker Compose V1 (déprécié)
docker-compose up
docker-compose --version

# ✅ Nouveau Docker Compose V2 (recommandé)
docker compose up
docker compose version

# Migration des scripts
alias docker-compose='docker compose'  # Compatibilité temporaire
```

## Structure moderne compose.yaml

### Compose Specification (nouvelle norme)

```yaml
# ✅ compose.yaml (nom moderne recommandé)
# Plus de version requise avec Compose Specification

name: myapp  # Nom du projet (optionnel mais recommandé)

services:    # Définition des conteneurs
  web:
    # Configuration du service web
  
  database:
    # Configuration de la base de données

volumes:     # Volumes persistants (optionnel)
  data:

networks:    # Réseaux personnalisés (optionnel)
  app-network:

configs:     # Configurations externes (nouveau)
  app-config:

secrets:     # Secrets sécurisés (nouveau)
  db-password:
```

### Exemple moderne : Application web + Base de données

```yaml
# compose.yaml
name: webapp

services:
  # Application web
  web:
    build: .                    # Construire depuis le Dockerfile local
    ports:
      - "8080:80"              # Port mapping hôte:conteneur
    depends_on:
      - database               # Démarrer après la DB
    environment:
      - DATABASE_URL=postgresql://user:password@database:5432/myapp
    volumes:
      - ./app:/var/www/html    # Mount bind pour le développement
    networks:
      - app-network

  # Base de données PostgreSQL
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:               # Volume persistant pour les données

networks:
  app-network:                 # Réseau isolé pour l'application
    driver: bridge
```

## Services et configuration avancée

### Configuration des images

```yaml
services:
  # Depuis une image Docker Hub
  redis:
    image: redis:7-alpine    # Version plus récente
    
  # Build avec nouvelles options
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production   # Nouvelle syntaxe map
        VERSION: 1.0.0
      target: production
      platforms:             # Support multi-architectures
        - linux/amd64
        - linux/arm64
    
  # Image avec digest pour sécurité
  nginx:
    image: nginx:1.25-alpine@sha256:4c0fdaa8b6341bfdeca5f18f7837462c80cff90527ee35ef185571e1c327beac
```

### Variables d'environnement

```yaml
services:
  app:
    environment:
      # Méthode 1: Clé-valeur directe
      - NODE_ENV=production
      - DEBUG=false
      
      # Méthode 2: Depuis l'hôte
      - USER=${USER}
      
      # Méthode 3: Fichier .env
    env_file:
      - .env
      - .env.local
```

**Fichier .env**
```bash
# Base de données
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=user
DB_PASSWORD=securepassword

# Application
APP_SECRET=your-secret-key
JWT_EXPIRY=3600

# Redis
REDIS_URL=redis://redis:6379
```

### Ports et exposition

```yaml
services:
  web:
    ports:
      # Format court: host:container
      - "8080:80"
      - "8443:443"
      
      # Format long avec protocole
      - target: 80
        published: 8080
        protocol: tcp
        mode: host
        
    # Exposition interne seulement (pas d'accès externe)
    expose:
      - "3000"
      - "9000"
```

### Volumes et persistance

```yaml
name: myapp

services:
  app:
    volumes:
      # Bind mount avec nouvelles options
      - type: bind
        source: ./src
        target: /app/src
        bind:
          create_host_path: true  # Créer le chemin automatiquement
      
      # Named volume avec labels
      - app_data:/app/data
      
      # tmpfs optimisé
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100M
          mode: 0755

volumes:
  app_data:
    driver: local
    labels:
      app.name: myapp          # Labels pour organisation
      backup.enabled: "true"
    driver_opts:
      type: none
      o: bind
      device: /opt/app-data
```

## Exemples d'applications complètes

### Stack MEAN (MongoDB + Express + Angular + Node.js)

```yaml
# compose.yaml
name: mean-stack

services:
  # Frontend Angular
  frontend:
    build:
      context: ./frontend
      target: production
    ports:
      - "4200:80"
    depends_on:
      - backend
    networks:
      - app-network

  # Backend Node.js/Express
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/myapp
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - app-network

  # Base de données MongoDB
  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: myapp
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - app-network

  # Cache Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - app-network

  # Reverse proxy Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Application Spring Boot + PostgreSQL + Redis

```yaml
# compose.yaml
name: spring-app

services:
  # Application Spring Boot
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/myapp
      - SPRING_DATASOURCE_USERNAME=myapp
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - SPRING_REDIS_HOST=redis
      - SPRING_REDIS_PORT=6379
      - SPRING_REDIS_PASSWORD=${REDIS_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - app_logs:/app/logs
    networks:
      - backend-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Base de données PostgreSQL
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: myapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache Redis
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend-network

  # Adminer pour l'administration DB
  adminer:
    image: adminer:latest
    ports:
      - "8081:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      - postgres
    networks:
      - backend-network

volumes:
  postgres_data:
  redis_data:
  app_logs:

networks:
  backend-network:
    driver: bridge
```

## Réseaux et communication

### Types de réseaux

```yaml
name: multi-tier-app

services:
  frontend:
    image: nginx:alpine
    networks:
      - public
      - internal

  backend:
    image: node:20-alpine    # Version LTS récente
    networks:
      - internal

networks:
  # Réseau public avec configuration IPv6
  public:
    driver: bridge
    enable_ipv6: true        # Support IPv6
    labels:
      tier: frontend
    
  # Réseau interne sécurisé
  internal:
    driver: bridge
    internal: true
    labels:
      tier: backend
      security: high
```

### Configuration réseau avancée

```yaml
networks:
  app-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
    driver_opts:
      com.docker.network.bridge.name: "docker-app"
      com.docker.network.bridge.enable_ip_masquerade: "true"

services:
  web:
    networks:
      app-network:
        ipv4_address: 172.20.0.10  # IP fixe
        aliases:
          - webserver
          - api
```

## Profiles et environnements

### Profiles pour différents environnements

```yaml
name: multi-env-app

services:
  # Service commun (utilise include pour la réutilisabilité)
  app:
    build: .
    environment:
      NODE_ENV: ${NODE_ENV:-development}
    
  # Service de développement avec watch
  app-dev:
    extends: app
    profiles: ["dev"]
    develop:
      watch:                   # Nouvelle fonctionnalité watch
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json
    ports:
      - "3000:3000"
    
  # Service de production optimisé
  app-prod:
    extends: app
    profiles: ["prod"]
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"
    
  # PostgreSQL avec version moderne
  postgres:
    image: postgres:16-alpine  # Version plus récente
    profiles: ["dev", "prod"]
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  postgres_data:
    labels:
      backup.enabled: "true"
```

**Utilisation moderne des profiles :**
```bash
# Développement avec watch
docker compose --profile dev up --watch

# Production
docker compose --profile prod up -d

# Tous les profiles
docker compose --profile dev --profile prod up

# Variables d'environnement par profil
COMPOSE_PROFILES=dev,test docker compose up
```

### Include et Override modernes

**compose.yaml** (base)
```yaml
name: myapp

include:                     # Nouvelle fonctionnalité include
  - path: ./compose.common.yaml
  - path: ./compose.${ENVIRONMENT:-dev}.yaml
    env_file: .env.${ENVIRONMENT:-dev}

services:
  app:
    image: myapp:latest
    environment:
      NODE_ENV: production
```

**compose.override.yaml** (développement automatique)
```yaml
services:
  app:
    build:
      context: .
      target: development
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
    environment:
      NODE_ENV: development
      DEBUG: "true"
    ports:
      - "3000:3000"
```

**compose.prod.yaml** (production)
```yaml
services:
  app:
    restart: unless-stopped
    environment:
      NODE_ENV: production
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        restart_policy:
          condition: on-failure
          max_attempts: 3
```

## Commandes Docker Compose V2

### Commandes modernes de base

```bash
# ✅ Commandes V2 recommandées

# Démarrer tous les services
docker compose up

# Démarrer avec watch (développement)
docker compose up --watch

# Démarrer en arrière-plan
docker compose up -d

# Démarrer des services spécifiques
docker compose up web database

# Construire et démarrer
docker compose up --build

# Forcer la reconstruction complète
docker compose up --build --force-recreate

# Arrêter tous les services
docker compose down

# Arrêter et supprimer volumes/réseaux
docker compose down --volumes --remove-orphans

# Arrêter et supprimer tout
docker compose down --rmi all --volumes
```

### Commandes avancées V2

```bash
# Statut détaillé des services
docker compose ps --format table
docker compose ps --all

# Logs avec timestamps et couleurs
docker compose logs --timestamps --follow
docker compose logs web --tail 100

# Exécution de commandes
docker compose exec web bash
docker compose exec --user root database psql -U postgres

# Build avec cache et progression
docker compose build --progress plain
docker compose build --no-cache --parallel

# Gestion des services
docker compose restart --timeout 30 web
docker compose pause web
docker compose unpause web

# Scale moderne
docker compose up --scale web=3 --scale worker=2

# Validation et debug
docker compose config --resolve-image-digests
docker compose config --profiles dev
docker compose top  # Processus dans les conteneurs
```

### Scripts modernes d'automatisation

**start.sh**
```bash
#!/bin/bash
set -euo pipefail  # Gestion stricte des erreurs

echo "🚀 Démarrage de l'application..."

# Vérifier Docker et Compose V2
if ! docker compose version &>/dev/null; then
    echo "❌ Erreur: Docker Compose V2 requis"
    exit 1
fi

# Validation de la configuration
echo "📋 Validation de la configuration..."
docker compose config --quiet

# Construire et démarrer avec sanity checks
echo "🔨 Construction et démarrage..."
docker compose up -d --build --wait

# Vérification de la santé des services
echo "🔍 Vérification de la santé..."
docker compose ps --format table

echo "✅ Application démarrée avec succès !"
echo "🌐 Web: http://localhost:8080"
echo "🗄️  Adminer: http://localhost:8081"
```

**deploy.sh**
```bash
#!/bin/bash
set -euo pipefail

ENV=${1:-production}
COMPOSE_FILES="compose.yaml:compose.${ENV}.yaml"

echo "🚀 Déploiement en environnement: $ENV"

# Validation pre-deploy
echo "📋 Validation de la configuration..."
COMPOSE_FILE=$COMPOSE_FILES docker compose config --quiet

# Rolling update
echo "📦 Mise à jour des images..."
COMPOSE_FILE=$COMPOSE_FILES docker compose pull --quiet

echo "🔄 Déploiement rolling..."
COMPOSE_FILE=$COMPOSE_FILES docker compose up -d --remove-orphans --wait

# Nettoyage post-deploy
echo "🧹 Nettoyage..."
docker image prune -f
docker volume prune -f

echo "✅ Déploiement terminé !"
```

## Monitoring et logging

### Configuration des logs

```yaml
name: monitored-app

services:
  app:
    image: myapp:latest
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: "3"
        compress: "true"       # Compression des logs
        labels: "service=app,env=prod"
        
  nginx:
    image: nginx:alpine
    logging:
      driver: fluentd        # Driver moderne recommandé
      options:
        fluentd-address: localhost:24224
        tag: "nginx.{{.Name}}"
        fluentd-async: "true"
        
  database:
    image: postgres:16-alpine
    logging:
      driver: json-file
      options:
        max-size: 50m
        max-file: "5"
        labels: "service=database,type=postgres"
```

### Health checks modernes

```yaml
services:
  web:
    image: nginx:alpine
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
      start_interval: 5s     # Nouveau: intervalle pendant start_period
      
  database:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
      start_interval: 2s
    
  app:
    build: .
    depends_on:
      database:
        condition: service_healthy  # Attendre que la DB soit healthy
        restart: true              # Redémarrer si la DB redémarre
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Ressources et limites

```yaml
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

## Bonnes pratiques

### Structure moderne de projet

```
project/
├── compose.yaml                 # Configuration principale moderne
├── compose.override.yaml        # Override automatique pour dev
├── compose.prod.yaml           # Configuration production
├── compose.common.yaml         # Configuration partagée (include)
├── .env                        # Variables par défaut
├── .env.example               # Template des variables
├── .env.prod                  # Variables production
├── .env.dev                   # Variables développement
├── Dockerfile                 # Image multi-stage
├── Dockerfile.dev             # Image développement
├── .dockerignore              # Exclusions build
├── configs/
│   ├── nginx.conf             # Configuration nginx
│   ├── postgres.conf          # Configuration PostgreSQL
│   └── app.yaml              # Configuration application
├── secrets/
│   ├── db-password.txt        # Secrets (git-ignored)
│   └── api-key.txt
├── scripts/
│   ├── start.sh               # Scripts V2
│   ├── deploy.sh
│   ├── backup.sh
│   └── healthcheck.sh
├── init/
│   ├── 01-database.sql        # Scripts d'initialisation
│   └── 02-user.sql
└── docs/
    ├── deployment.md
    └── development.md
```

### Sécurité

```yaml
services:
  app:
    # Sécurité utilisateur
    user: "1000:1000"
    
    # Capacités minimales
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - SETGID
      - SETUID
      
    # Système de fichiers sécurisé
    read_only: true
    tmpfs:
      - /tmp:size=100M,mode=1777
      - /var/cache:size=50M,mode=0755
      
    # Sécurité système
    privileged: false
    security_opt:
      - no-new-privileges:true
      - apparmor:unconfined       # Ou votre profil AppArmor
    
    # Secrets modernes
    secrets:
      - source: db_password
        target: /run/secrets/db_password
        mode: 0400               # Lecture seule propriétaire
      - source: api_key
        target: /run/secrets/api_key
        mode: 0400
    
    # Variables depuis secrets
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      API_KEY_FILE: /run/secrets/api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
    labels:
      sensitive: "true"
  api_key:
    external: true
    name: myapp_api_key_v1
```

### Variables d'environnement

```yaml
# Dans docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - API_KEY=${API_KEY}
      - DEBUG=${DEBUG:-false}
    env_file:
      - .env
      - .env.local
```

**.env**
```bash
# Base de données
DATABASE_URL=postgresql://user:password@postgres:5432/myapp

# API Keys (utiliser des secrets en production)
API_KEY=your-api-key

# Configuration
DEBUG=true
LOG_LEVEL=info
```

## Dépannage

### Problèmes courants

**Services qui ne communiquent pas**
```bash
# Diagnostic moderne V2
docker compose ps --format table
docker network ls
docker network inspect $(docker compose config --format json | jq -r '.name')_default

# Tests de connectivité avancés
docker compose exec web ping database
docker compose exec web nslookup database
docker compose exec web telnet database 5432

# Debug DNS et réseaux
docker compose exec web cat /etc/resolv.conf
docker compose exec web nslookup tasks.database  # Pour services avec replicas
```

**Problèmes de volumes**
```bash
# Vérifier les volumes
docker volume ls
docker volume inspect projectname_postgres_data

# Nettoyer les volumes orphelins
docker volume prune
```

**Problèmes de ports**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep LISTEN
docker-compose ps

# Libérer un port
sudo lsof -ti:8080 | xargs kill -9
```

### Debug moderne et inspection

```bash
# Debug V2 avancé
docker compose up --verbose --progress plain
docker compose logs --follow --timestamps --tail 50

# Événements filtrés
docker events --filter type=container --filter event=start
docker events --filter label=com.docker.compose.project=myapp

# Inspection détaillée
docker compose exec web env | sort
docker compose exec web ps auxf
docker compose exec web ss -tlnp  # Ports d'écoute

# Configuration et validation
docker compose config --resolve-image-digests
docker compose config --format json | jq .
docker compose config --profiles dev,prod

# Performance et ressources
docker compose top
docker stats $(docker compose ps -q)
```

## Déploiement en production

### Préparation production

```yaml
# compose.prod.yaml
name: myapp-production

services:
  app:
    restart: unless-stopped
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"
        reservations:
          memory: 512M
          cpus: "0.25"
      restart_policy:
        condition: on-failure
        max_attempts: 3
        window: 120s
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: "5"
        compress: "true"
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:size=100M
        
  nginx:
    restart: unless-stopped
    ports:
      - target: 80
        published: 80
        mode: host
      - target: 443
        published: 443
        mode: host
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/log/nginx:/var/log/nginx
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.25"
```

### CI/CD avec GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/myapp
            git pull origin main
            
            # Validation pré-déploiement
            COMPOSE_FILE=compose.yaml:compose.prod.yaml docker compose config --quiet
            
            # Déploiement avec Compose V2
            COMPOSE_FILE=compose.yaml:compose.prod.yaml docker compose up -d --build --wait
            
            # Vérification post-déploiement
            docker compose ps --format table
            
            # Nettoyage
            docker image prune -f
            docker volume prune -f
```

## Ressources et documentation

### Documentation officielle moderne
- [Docker Compose V2 Documentation](https://docs.docker.com/compose/) - Guide officiel 2025
- [Compose Specification](https://docs.docker.com/compose/compose-file/) - Nouvelle spécification unifiée
- [Compose CLI Reference](https://docs.docker.com/compose/reference/) - Commandes V2
- [Compose Watch](https://docs.docker.com/compose/file-watch/) - Développement avec synchronisation
- [Compose Profiles](https://docs.docker.com/compose/profiles/) - Gestion multi-environnements

### Outils et extensions modernes
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) - Interface graphique officielle
- [Docker VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) - Support IDE
- [Traefik v3](https://traefik.io/) - Reverse proxy cloud-native
- [Portainer](https://www.portainer.io/) - Interface web moderne
- [Dive](https://github.com/wagoodman/dive) - Analyse des layers d'images

### Migration V1 → V2
- [Migration Guide](https://docs.docker.com/compose/migrate/) - Guide officiel de migration
- [Compose V2 Features](https://docs.docker.com/compose/releases/release-notes/) - Nouvelles fonctionnalités

### Vidéos et formations 2025
- [Docker Compose V2 Deep Dive](https://www.youtube.com/watch?v=DM65_JlnJ3M)
- [Modern Docker Development](https://www.youtube.com/watch?v=3c-iBn73dDE)
- [Production Docker Best Practices](https://www.youtube.com/watch?v=8fi7uSYlOdc)

## Conclusion

Docker Compose V2 modernise l'orchestration de conteneurs avec `compose.yaml`, les commandes `docker compose`, le support multi-architectures, et des fonctionnalités comme Watch pour le développement. Cette évolution rend l'outil plus robuste, sécurisé et adapté aux workflows modernes 2025.