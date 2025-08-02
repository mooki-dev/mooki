---
title: "Créer son propre starter Spring Boot minimal"
date: 2025-01-12
tags: [spring, java, starter, template]
author: mooki
excerpt: "Guide pour créer un starter Spring Boot personnalisé avec les dépendances et configurations essentielles"
category: projets
readingTime: 22
---

# Créer son propre starter Spring Boot minimal

Un starter Spring Boot personnalisé standardise la configuration et accélère le démarrage des nouveaux projets.

## Objectifs du starter

### Fonctionnalités incluses

- Configuration Spring Boot optimisée
- Logging structuré avec Logback
- Monitoring avec Actuator
- Tests préconfigurés
- Dockerfile optimisé
- CI/CD pipeline basique

### Structure cible

```
my-app-starter/
├── src/main/java/
│   └── com/company/starter/
├── src/main/resources/
│   ├── application.yml
│   └── logback-spring.xml
├── src/test/
├── Dockerfile
└── .github/workflows/
```

## Configuration Maven

### pom.xml principal

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>
    
    <groupId>com.company</groupId>
    <artifactId>my-app-starter</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
    
    <dependencies>
        <!-- Core Spring Boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Tests -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## Configuration application

### application.yml

```yaml
server:
  port: 8080
  shutdown: graceful
  tomcat:
    threads:
      max: 200
      min-spare: 10

spring:
  application:
    name: ${APP_NAME:my-app}
  
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
  
  lifecycle:
    timeout-per-shutdown-phase: 30s

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  health:
    livenessstate:
      enabled: true
    readinessstate:
      enabled: true

logging:
  level:
    com.company: ${LOG_LEVEL:INFO}
    org.springframework.web: WARN
    org.hibernate: WARN
```

### Profils d'environnement

```yaml
# application-local.yml
logging:
  level:
    com.company: DEBUG
    org.springframework.web: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: "*"

---
# application-prod.yml
logging:
  level:
    com.company: INFO
    root: WARN

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

## Classes de configuration

### Application principale

```java
package com.company.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StarterApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(StarterApplication.class, args);
    }
}
```

### Configuration globale

```java
@Configuration
@EnableConfigurationProperties
public class ApplicationConfig {
    
    @Bean
    @ConditionalOnMissingBean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### Contrôleur de santé

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "UP",
            "timestamp", Instant.now().toString()
        );
    }
}
```

## Tests

### Test d'intégration

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StarterApplicationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void contextLoads() {
        // Test que l'application démarre
    }
    
    @Test
    void healthEndpointWorks() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/health", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

## Containerisation

### Dockerfile multi-stage

```dockerfile
# Build stage
FROM openjdk:17-jdk-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jre-slim
WORKDIR /app

# Créer utilisateur non-root
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copier l'application
COPY --from=build /app/target/*.jar app.jar

# Changer ownership
RUN chown appuser:appuser app.jar

USER appuser

# Configuration JVM
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Pipeline CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        
    - name: Run tests
      run: mvn clean verify
      
    - name: Build Docker image
      run: docker build -t my-app:${{ github.sha }} .
```

## Script d'initialisation

### Créateur de projet

```bash
#!/bin/bash
# create-project.sh

PROJECT_NAME=${1:-my-new-app}
PACKAGE_NAME=${2:-com.company.mynewapp}

echo "Creating project: $PROJECT_NAME"

# Cloner le starter
git clone https://github.com/company/my-app-starter.git $PROJECT_NAME
cd $PROJECT_NAME

# Nettoyer l'historique git
rm -rf .git
git init

# Remplacer les noms dans les fichiers
find . -type f -name "*.java" -o -name "*.xml" -o -name "*.yml" | \
    xargs sed -i "s/com.company.starter/$PACKAGE_NAME/g"

# Renommer les dossiers
mkdir -p src/main/java/$(echo $PACKAGE_NAME | tr '.' '/')
mv src/main/java/com/company/starter/* \
   src/main/java/$(echo $PACKAGE_NAME | tr '.' '/')/

# Premier commit
git add .
git commit -m "Initial commit from starter"

echo "Project $PROJECT_NAME created successfully!"
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. mvn spring-boot:run"
echo "3. Open http://localhost:8080/actuator/health"
```

## Utilisation

### Création d'un nouveau projet

```bash
# Cloner et personnaliser
./create-project.sh user-service com.company.userservice

# Démarrer le développement
cd user-service
mvn spring-boot:run
```

### Customisation

Le starter fournit une base solide que vous pouvez étendre :

- Ajouter des dépendances spécifiques
- Configurer des datasources
- Intégrer des services externes
- Personnaliser la sécurité

Ce starter accélère le démarrage des projets tout en maintenant les bonnes pratiques et la cohérence entre les applications.