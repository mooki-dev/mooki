---
title: "Les bases de Docker"
date: 2025-08-02
tags: [docker, containers, devops, infrastructure]
author: mooki
excerpt: "Guide complet pour comprendre et maîtriser les concepts fondamentaux de Docker : conteneurs, images, volumes et réseaux"
category: guides
---

# Les bases de Docker

Docker a révolutionné le développement et le déploiement d'applications en permettant de packager une application et ses dépendances dans un conteneur portable et léger.

## Qu'est-ce que Docker ?

Docker est une plateforme de conteneurisation qui permet d'empaqueter une application avec toutes ses dépendances dans un conteneur portable. Contrairement aux machines virtuelles, les conteneurs partagent le noyau du système hôte, ce qui les rend beaucoup plus légers et rapides.

### Concepts clés

**Conteneur** : Instance d'exécution d'une image Docker. Un processus isolé qui fonctionne sur l'hôte.

**Image** : Template en lecture seule utilisé pour créer des conteneurs. Contient le système de fichiers et les paramètres d'exécution.

**Dockerfile** : Fichier texte qui contient les instructions pour construire une image Docker.

**Registry** : Service qui stocke et distribue les images Docker (Docker Hub, registries privés).

## Installation et premiers pas

### Installation Docker

::: code-group

```bash [Ubuntu/Debian]
# Mise à jour des paquets
sudo apt update

# Installation des dépendances
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Ajout de la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajout du repository Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installation Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```

```bash [CentOS/RHEL]
# Installation des dépendances
sudo yum install -y yum-utils

# Ajout du repository Docker
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Installation Docker
sudo yum install docker-ce docker-ce-cli containerd.io

# Démarrage du service
sudo systemctl start docker
sudo systemctl enable docker
```

```bash [macOS]
# Avec Homebrew
brew install --cask docker

# Ou télécharger Docker Desktop depuis
# https://www.docker.com/products/docker-desktop
```

:::

### Ajouter votre utilisateur au groupe docker

```bash
# Ajouter l'utilisateur au groupe docker (évite sudo)
sudo usermod -aG docker $USER

# Redémarrer la session ou exécuter
newgrp docker
```

### Vérification de l'installation

```bash
# Vérifier la version
docker --version

# Tester avec l'image hello-world
docker run hello-world
```

## Commandes Docker essentielles

### Gestion des images

```bash
# Lister les images locales
docker images

# Télécharger une image
docker pull nginx:1.25-alpine

# Construire une image depuis un Dockerfile
docker build -t mon-app:v1.0 .

# Supprimer une image
docker rmi nginx:1.25-alpine

# Nettoyer les images non utilisées
docker image prune
```

### Gestion des conteneurs

```bash
# Lancer un conteneur
docker run -d --name mon-nginx -p 8080:80 nginx

# Lister les conteneurs en cours
docker ps

# Lister tous les conteneurs (même arrêtés)
docker ps -a

# Arrêter un conteneur
docker stop mon-nginx

# Démarrer un conteneur arrêté
docker start mon-nginx

# Redémarrer un conteneur
docker restart mon-nginx

# Supprimer un conteneur
docker rm mon-nginx

# Entrer dans un conteneur en cours d'exécution
docker exec -it mon-nginx bash
```

### Options utiles du docker run

```bash
# Exécution en mode détaché (arrière-plan)
docker run -d nginx

# Mapper des ports hôte:conteneur
docker run -p 8080:80 nginx

# Monter un volume
docker run -v /host/path:/container/path nginx

# Définir des variables d'environnement
docker run -e ENV_VAR=value nginx

# Donner un nom au conteneur
docker run --name mon-conteneur nginx

# Supprimer automatiquement après arrêt
docker run --rm nginx

# Limiter les ressources
docker run --memory=1g --cpus=0.5 nginx
```

## Dockerfile : Créer ses propres images

### Structure basique d'un Dockerfile

```dockerfile
# Image de base
FROM openjdk:21-jre-slim

# Métadonnées
LABEL maintainer="votre-email@example.com"
LABEL description="Application Java Spring Boot"

# Répertoire de travail
WORKDIR /app

# Copier les fichiers
COPY target/app.jar app.jar

# Exposer un port
EXPOSE 8080

# Variables d'environnement
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Commande par défaut
CMD ["java", "-jar", "app.jar"]
```

### Instructions Dockerfile principales

**FROM** : Définit l'image de base
```dockerfile
FROM ubuntu:24.04
FROM openjdk:21-jre-slim
FROM node:20-alpine
```

**COPY vs ADD** : Copier des fichiers
```dockerfile
# COPY (recommandé) - copie simple
COPY src/ /app/src/

# ADD - copie avec extraction automatique des archives
ADD archive.tar.gz /app/
```

**RUN** : Exécuter des commandes lors du build
```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*
```

**ENV** : Définir des variables d'environnement
```dockerfile
ENV NODE_ENV=production
ENV PATH=$PATH:/app/bin
```

**EXPOSE** : Documenter les ports utilisés
```dockerfile
EXPOSE 8080
EXPOSE 443
```

**VOLUME** : Définir des points de montage
```dockerfile
VOLUME ["/data", "/logs"]
```

**USER** : Définir l'utilisateur d'exécution
```dockerfile
RUN useradd -m appuser
USER appuser
```

### Exemple concret : Application Node.js

```dockerfile
# Image de base légère
FROM node:20-alpine

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY --chown=nextjs:nodejs . .

# Changer d'utilisateur
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "start"]
```

## Volumes et persistance des données

### Types de volumes

**Bind mounts** : Montage direct d'un dossier hôte
```bash
docker run -v /host/data:/container/data nginx
docker run --mount type=bind,source=/host/data,target=/container/data nginx
```

**Volumes Docker** : Gérés par Docker
```bash
# Créer un volume
docker volume create mon-volume

# Utiliser le volume
docker run -v mon-volume:/data nginx

# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect mon-volume

# Supprimer un volume
docker volume rm mon-volume
```

**tmpfs mounts** : Montage en mémoire (données temporaires)
```bash
docker run --tmpfs /tmp nginx
```

### Exemple avec PostgreSQL

```bash
# Créer un volume pour la base de données
docker volume create postgres-data

# Lancer PostgreSQL avec le volume
docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# Les données survivront aux redémarrages du conteneur
```

## Réseaux Docker

### Types de réseaux

```bash
# Lister les réseaux
docker network ls

# Créer un réseau personnalisé
docker network create mon-reseau

# Inspecter un réseau
docker network inspect mon-reseau

# Connecter un conteneur à un réseau
docker network connect mon-reseau mon-conteneur
```

### Communication entre conteneurs

```bash
# Créer un réseau pour l'application
docker network create app-network

# Lancer la base de données
docker run -d \
  --name postgres \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:16-alpine

# Lancer l'application (peut se connecter à postgres:5432)
docker run -d \
  --name app \
  --network app-network \
  -p 8080:8080 \
  mon-app:latest
```

## Bonnes pratiques

### Optimisation des images

**Utiliser des images de base légères**
```dockerfile
# ❌ Éviter
FROM ubuntu:24.04

# ✅ Préférer
FROM alpine:3.19
FROM node:20-alpine
FROM openjdk:21-jre-slim
```

**Minimiser les layers**
```dockerfile
# ❌ Éviter - crée plusieurs layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim

# ✅ Préférer - un seul layer
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*
```

**Utiliser .dockerignore**
```dockerignore
# Fichier .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode
```

### Sécurité

**Ne pas utiliser root**
```dockerfile
# Créer un utilisateur non-root
RUN useradd -m -s /bin/bash appuser
USER appuser
```

**Scanner les vulnérabilités**
```bash
# Avec docker scan (nécessite Docker Desktop)
docker scan mon-image:latest

# Avec trivy
trivy image mon-image:latest
```

**Garder les images à jour**
```bash
# Reconstruire régulièrement avec les dernières versions
docker build --no-cache -t mon-app:latest .
```

### Multi-stage builds (aperçu)

```dockerfile
# Stage de build
FROM maven:3.8-openjdk-11 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ src/
RUN mvn package -DskipTests

# Stage de production
FROM openjdk:21-jre-slim
COPY --from=builder /app/target/app.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

## Commandes de nettoyage

```bash
# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer toutes les images non utilisées
docker image prune

# Supprimer tous les volumes non utilisés
docker volume prune

# Supprimer tous les réseaux non utilisés
docker network prune

# Nettoyage complet (attention !)
docker system prune -a --volumes
```

## Debugging et logs

```bash
# Voir les logs d'un conteneur
docker logs mon-conteneur

# Suivre les logs en temps réel
docker logs -f mon-conteneur

# Voir les processus dans un conteneur
docker top mon-conteneur

# Statistiques d'utilisation
docker stats

# Inspecter un conteneur
docker inspect mon-conteneur

# Voir les changements dans le système de fichiers
docker diff mon-conteneur
```

## Prochaines étapes

Maintenant que vous maîtrisez les bases de Docker, vous pouvez approfondir avec :

- **Docker Compose** : Orchestration multi-conteneurs
- **Builds multi-stages** : Optimisation avancée des images
- **Kubernetes** : Orchestration en production
- **Monitoring** : Prometheus et Grafana avec Docker
- **CI/CD** : Intégration dans vos pipelines

Docker est un outil puissant qui simplifie considérablement le déploiement et la gestion d'applications. Ces bases vous permettront de containeriser efficacement vos projets et de profiter de la portabilité et de la reproductibilité des conteneurs.