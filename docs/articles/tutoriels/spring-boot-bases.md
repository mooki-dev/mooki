---
title: "Les bases de Spring Boot"
date: 2025-01-20
tags: [spring, java, tutorial]
author: mooki
excerpt: "Guide complet pour débuter avec Spring Boot : configuration, annotations et premiers pas"
category: tutoriels
readingTime: 15
---

# Les bases de Spring Boot

Spring Boot simplifie drastiquement le développement d'applications Java en fournissant une configuration automatique et des conventions intelligentes.

## Introduction

Spring Boot est un framework Java qui permet de créer rapidement des applications production-ready avec un minimum de configuration.

## Installation et configuration

### Prérequis

- Java 17 ou supérieur
- Maven ou Gradle

### Création d'un projet

```bash
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,h2 \
  -d name=demo \
  -o demo.zip
```

## Premier contrôleur

```java
@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello Spring Boot!";
    }
}
```

## Configuration

Spring Boot utilise des fichiers de configuration flexibles :

```yaml
# application.yml
server:
  port: 8080
  
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
```

## Conclusion

Spring Boot accélère le développement en réduisant la complexité de configuration tout en gardant la flexibilité.