---
title: Construire une image Docker Java minimale avec les builds multi-stages
date: '2025-06-30T15:32:00.000Z'
tags:
  - docker
  - java
  - spring-boot
  - optimization
  - maven
  - gradle
author: mooki
excerpt: >-
  Optimisez vos images Docker Java avec les builds multi-stages : réduisez la
  taille, améliorez la sécurité et accélérez vos déploiements
category: tutoriels
---

# Construire une image Docker Java minimale avec les builds multi-stages

Les applications Java peuvent rapidement générer des images Docker de plusieurs centaines de mégaoctets, voire gigaoctets. Les builds multi-stages permettent de créer des images de production légères en séparant l'environnement de build de l'environnement d'exécution.

## Problème des builds monolithiques

### Approche traditionnelle

```dockerfile
# ❌ Image monolithique lourde
FROM openjdk:21-jdk

WORKDIR /app

# Copie tout le projet
COPY . .

# Build dans l'image finale
RUN ./mvnw clean package -DskipTests

# L'image finale contient Maven, le JDK complet, les sources, etc.
CMD ["java", "-jar", "target/app.jar"]
```

**Problèmes :**
- Image finale de 500MB-1GB+
- Contient les outils de build (Maven/Gradle)
- Inclut le JDK complet au lieu du JRE
- Sources et dépendances de développement présentes
- Surface d'attaque importante

## Builds multi-stages : la solution

### Principe

Les builds multi-stages permettent d'utiliser plusieurs images `FROM` dans un même Dockerfile :

1. **Stage de build** : Image avec tous les outils (JDK, Maven/Gradle)
2. **Stage de production** : Image minimale avec seulement le runtime (JRE)

### Exemple complet avec Maven

```dockerfile
# =================
# Stage 1: Builder
# =================
FROM maven:3.9-openjdk-21 AS builder

WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .
COPY .mvn/ .mvn/

# Télécharger les dépendances (cache Docker)
RUN mvn dependency:go-offline -B

# Copier le code source
COPY src/ src/

# Construire l'application
RUN mvn clean package -DskipTests -B

# =================
# Stage 2: Runtime
# =================
FROM openjdk:21-jre-slim AS runtime

# Métadonnées
LABEL maintainer="dev@example.com"
LABEL description="Application Spring Boot optimisée"

# Créer un utilisateur non-root
RUN useradd -r -s /bin/false appuser

# Répertoire de travail
WORKDIR /app

# Copier seulement le JAR depuis le stage builder
COPY --from=builder /app/target/*.jar app.jar

# Changer le propriétaire
RUN chown appuser:appuser app.jar

# Utiliser l'utilisateur non-root
USER appuser

# Variables d'environnement pour l'optimisation
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Port d'exposition
EXPOSE 8080

# Point d'entrée optimisé
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Optimisations avancées

### 1. Optimisation des layers avec Gradle

```dockerfile
# Stage 1: Extraction des dépendances
FROM gradle:8-jdk21 AS deps

WORKDIR /app
COPY build.gradle settings.gradle gradle.properties ./
COPY gradle/ gradle/

# Télécharger les dépendances
RUN gradle dependencies --no-daemon

# Stage 2: Build
FROM gradle:8-jdk21 AS builder

WORKDIR /app
COPY --from=deps /home/gradle/.gradle /home/gradle/.gradle
COPY . .

# Build de l'application
RUN gradle bootJar --no-daemon

# Stage 3: Extraction des layers Spring Boot
FROM openjdk:21-jre-slim AS layers

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

# Extraire les layers Spring Boot
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 4: Runtime final
FROM openjdk:21-jre-slim

RUN useradd -r -s /bin/false appuser

WORKDIR /app

# Copier les layers dans l'ordre optimal pour le cache Docker
COPY --from=layers app/dependencies/ ./
COPY --from=layers app/spring-boot-loader/ ./
COPY --from=layers app/snapshot-dependencies/ ./
COPY --from=layers app/application/ ./

RUN chown -R appuser:appuser /app
USER appuser

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.JarLauncher"]
```

### 2. Image encore plus légère avec JRE customisé

```dockerfile
# Stage 1: Builder avec JDK complet
FROM openjdk:21-jdk-slim AS builder

WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Création d'un JRE customisé
FROM openjdk:21-jdk-slim AS jre-builder

# Créer un JRE minimal avec jlink
RUN jlink \
    --module-path /opt/java/openjdk/jmods \
    --add-modules java.base,java.logging,java.net.http,java.security.jgss,java.instrument,java.desktop \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /opt/jre-minimal

# Stage 3: Runtime final avec JRE custom
FROM debian:bullseye-slim

# Installer seulement les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copier le JRE customisé
COPY --from=jre-builder /opt/jre-minimal /opt/jre-minimal

# Configuration utilisateur
RUN useradd -r -s /bin/false appuser

WORKDIR /app

# Copier l'application
COPY --from=builder /app/target/*.jar app.jar
RUN chown appuser:appuser app.jar

USER appuser

ENV JAVA_HOME=/opt/jre-minimal
ENV PATH="$JAVA_HOME/bin:$PATH"
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "$JAVA_HOME/bin/java $JAVA_OPTS -jar app.jar"]
```

## Optimisations Spring Boot spécifiques

### Configuration des layers Spring Boot

**application.properties**
```properties
# Activer les layers pour Spring Boot 2.3+
spring.boot.build.image.builder=paketobuildpacks/builder:tiny
spring.boot.build.layers.enabled=true
```

**build.gradle**
```groovy
bootJar {
    layered {
        enabled = true
        includeLayerTools = true
    }
}
```

### Dockerfile optimisé pour les layers

```dockerfile
FROM openjdk:21-jre-slim AS layers
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM openjdk:21-jre-slim
RUN useradd -r -s /bin/false appuser

WORKDIR /app

# L'ordre est important pour le cache Docker
COPY --from=layers app/dependencies/ ./
COPY --from=layers app/spring-boot-loader/ ./
COPY --from=layers app/snapshot-dependencies/ ./
COPY --from=layers app/application/ ./

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

## Comparaison des résultats

### Tailles d'images

| Approche         | Taille | Réduction |
| ---------------- | ------ | --------- |
| Monolithique JDK | 650 MB | -         |
| Multi-stage JRE  | 180 MB | -72%      |
| JRE customisé    | 120 MB | -82%      |
| Distroless       | 110 MB | -83%      |

### Utilisation de Distroless

```dockerfile
FROM maven:3.9-openjdk-21 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Image distroless (sans shell, très sécurisée)
FROM gcr.io/distroless/java21-debian12

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Bonnes pratiques

### 1. Optimisation des dépendances

```dockerfile
# Copier d'abord les fichiers de dépendances
COPY pom.xml .
RUN mvn dependency:go-offline

# Puis copier le code (cache Docker plus efficace)
COPY src/ src/
RUN mvn package -DskipTests
```

### 2. Variables d'environnement JVM

```dockerfile
ENV JAVA_OPTS="\
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseCGroupMemoryLimitForHeap \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication"
```

### 3. Health checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

### 4. Build script automatisé

**build.sh**
```bash
#!/bin/bash

# Build avec cache et optimisations
docker build \
  --target runtime \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from mon-app:cache \
  -t mon-app:latest \
  -t mon-app:cache \
  .

# Analyser la taille
docker images mon-app:latest

# Scanner les vulnérabilités
docker scan mon-app:latest || true

echo "Image construite : $(docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' mon-app:latest)"
```

## Docker Compose pour le développement

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: runtime
      args:
        - BUILDKIT_INLINE_CACHE=1
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - JAVA_OPTS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0
    depends_on:
      - postgres
    volumes:
      - app-logs:/app/logs

  postgres:
    image: postgres:16-alpine-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
  app-logs:
```

## CI/CD avec GitHub Actions

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          target: runtime
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILDKIT_INLINE_CACHE=1
```

## Monitoring et profiling

### Ajout de métriques JVM

```dockerfile
# Dans l'image finale
COPY --from=builder /app/target/lib/ lib/

ENV JAVA_OPTS="\
    -javaagent:lib/jmx_prometheus_javaagent.jar=8081:config/jmx-config.yml \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0"
```

### Configuration Prometheus

**jmx-config.yml**
```yaml
rules:
  - pattern: ".*"
```

## Sécurité avancée

### Image rootless complète

```dockerfile
FROM maven:3.9-openjdk-21 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app
COPY --from=builder --chown=nonroot:nonroot /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Scan de sécurité

```bash
# Avec Trivy
trivy image mon-app:latest

# Avec Docker Scout
docker scout cves mon-app:latest

# Avec Snyk
snyk container test mon-app:latest
```

## Ressources et références

### Documentation officielle
- [Docker Multi-stage builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [OpenJDK Docker Images](https://hub.docker.com/_/openjdk)

### Outils utiles
- [Distroless Images](https://github.com/GoogleContainerTools/distroless)
- [Docker Slim](https://dockersl.im/) - Optimisation automatique
- [Dive](https://github.com/wagoodman/dive) - Analyse des layers

### Vidéos recommandées
- [Spring Boot Docker Best Practices](https://www.youtube.com/watch?v=xd_twW0dOcA) par Josh Long
- [Multi-stage Docker Builds](https://www.youtube.com!/watch?v=zpkqNPwEzac)

## Conclusion

Les builds multi-stages transforment la façon de construire des images Java :

**Bénéfices obtenus :**
- **Réduction de 70-80%** de la taille des images
- **Sécurité renforcée** avec moins de surface d'attaque
- **Déploiements plus rapides** grâce aux images légères
- **Séparation claire** entre environnements de build et production

**Points clés à retenir :**
- Séparez toujours build et runtime
- Utilisez des images de base légères (Alpine, Distroless)
- Optimisez l'ordre des layers pour le cache Docker
- Implémentez les layers Spring Boot pour de meilleures performances
- Automatisez avec CI/CD et monitoring

Ces techniques sont essentielles pour des applications Java modernes, performantes et sécurisées en production.
