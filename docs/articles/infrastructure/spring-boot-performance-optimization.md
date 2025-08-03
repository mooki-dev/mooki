---
title: Optimisation des performances Spring Boot
date: '2025-07-30T10:17:00.000Z'
tags:
  - spring-boot
  - performance
  - optimization
  - java
  - microservices
  - monitoring
author: mooki
excerpt: >-
  Guide complet pour optimiser les performances de vos applications Spring Boot
  : profiling, tuning JVM, cache, base de données et monitoring
category: infrastructure
---

# Optimisation des performances Spring Boot

L'optimisation des performances dans Spring Boot nécessite une approche méthodique combinant profiling, configuration JVM, optimisations applicatives et monitoring. Ce guide couvre les techniques modernes 2025 pour maximiser les performances de vos applications.

## Méthodologie d'optimisation

### Principe de base

::: tip
"Mesurer d'abord, optimiser ensuite" - Ne jamais optimiser sans avoir identifié les vrais goulots d'étranglement par le profiling.
:::

### Cycle d'optimisation

```
1. Baseline          2. Mesure           3. Analyse
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Mesures     │     │ Profiling   │     │ Bottlenecks │
│ initiales   │ ──► │ Load testing│ ──► │ Hot spots   │
│ Performance │     │ Monitoring  │     │ Root causes │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                        │
       │            5. Validation               ▼
       │           ┌─────────────┐     ┌─────────────┐
       └─────────  │ Re-test     │ ◄── │ Optimization│
                   │ Compare     │     │ Changes     │
                   └─────────────┘     └─────────────┘
                           4. Implementation
```

## Configuration JVM et Spring Boot

### Optimisation JVM pour Spring Boot

::: info
Spring Boot 3.x nécessite Java 17+ et bénéficie grandement des améliorations des JVM modernes (G1GC, ZGC, optimisations Hotspot).
:::

**Configuration optimale application.yml :**
```yaml
# application.yml
spring:
  application:
    name: optimized-app
  
  # JPA/Hibernate optimizations
  jpa:
    hibernate:
      ddl-auto: none
      use-new-id-generator-mappings: true
    show-sql: false
    properties:
      hibernate:
        # Batch processing
        jdbc.batch_size: 50
        jdbc.batch_versioned_data: true
        order_inserts: true
        order_updates: true
        
        # Connection pool
        hikari:
          maximum-pool-size: 20
          minimum-idle: 5
          idle-timeout: 300000
          max-lifetime: 600000
          leak-detection-threshold: 60000
        
        # Query optimization
        generate_statistics: false
        format_sql: false
        use_sql_comments: false
        
        # Cache configuration
        cache:
          use_second_level_cache: true
          use_query_cache: true
          region.factory_class: org.hibernate.cache.jcache.JCacheRegionFactory
  
  # Jackson optimizations
  jackson:
    default-property-inclusion: non_null
    serialization:
      write-dates-as-timestamps: false
      fail-on-empty-beans: false
    deserialization:
      fail-on-unknown-properties: false
  
  # Thread pool configuration
  task:
    execution:
      pool:
        core-size: 4
        max-size: 16
        queue-capacity: 100
        keep-alive: 60s
    scheduling:
      pool:
        size: 4

# Actuator for monitoring
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
    distribution:
      percentiles-histogram:
        http.server.requests: true
      percentiles:
        http.server.requests: 0.5,0.9,0.95,0.99
  
# Logging optimization
logging:
  level:
    org.hibernate.SQL: WARN
    org.hibernate.type.descriptor.sql.BasicBinder: WARN
    org.springframework.security: WARN
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

**Arguments JVM optimisés :**
```bash
# JVM Options modernes (Java 17+)
JAVA_OPTS="
# Memory Management
-Xms2g -Xmx4g
-XX:NewRatio=1
-XX:SurvivorRatio=8
-XX:MaxMetaspaceSize=512m

# G1 Garbage Collector (recommandé pour Spring Boot)
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:G1NewSizePercent=30
-XX:G1MaxNewSizePercent=40
-XX:G1MixedGCLiveThresholdPercent=90

# JIT Optimizations
-XX:+EnableJVMCI
-XX:+UseJVMCICompiler
-XX:+UnlockExperimentalVMOptions

# Performance Monitoring
-XX:+FlightRecorder
-XX:+UnlockDiagnosticVMOptions
-XX:+DebugNonSafepoints

# JFR pour production profiling
-XX:StartFlightRecording=duration=60s,filename=app-profile.jfr,settings=profile

# Security optimizations
-Djava.security.egd=file:/dev/./urandom

# Spring Boot specific
-Dspring.backgroundpreinitializer.ignore=true
-Dspring.config.location=classpath:/application.yml
"
```

### Configuration Docker optimisée

```dockerfile
# Dockerfile multi-stage optimisé
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . .

# Build with optimal settings
RUN ./gradlew clean build -x test \
    --parallel \
    --configure-on-demand \
    --daemon

# Production stage
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -u 1001 -s /bin/false -G appuser appuser

# JVM Optimization
ENV JAVA_OPTS="-Xms1g -Xmx2g \
               -XX:+UseG1GC \
               -XX:MaxGCPauseMillis=200 \
               -XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Dspring.profiles.active=production"

WORKDIR /app

# Copy optimized jar
COPY --from=builder /app/build/libs/app.jar app.jar

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

# Optimized startup
ENTRYPOINT ["java", "${JAVA_OPTS}", "-jar", "app.jar"]
```

## Optimisations applicatives Spring Boot

### 1. Optimisation des accès base de données

::: warning
Les requêtes N+1 sont le problème de performance #1 dans les applications Spring Boot. Utilisez toujours `@EntityGraph` ou les jointures fetch.
:::

**Entités optimisées avec JPA :**
```java
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_category", columnList = "category_id"),
    @Index(name = "idx_name", columnList = "name"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@NamedEntityGraph(
    name = "Product.withCategory",
    attributeNodes = {
        @NamedAttributeNode("category"),
        @NamedAttributeNode(value = "reviews", subgraph = "reviewSubgraph")
    },
    subgraphs = {
        @NamedSubgraph(
            name = "reviewSubgraph",
            attributeNodes = @NamedAttributeNode("user")
        )
    }
)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<Review> reviews = new ArrayList<>();
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors, getters, setters...
}
```

**Repository optimisé :**
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Éviter N+1 avec EntityGraph
    @EntityGraph("Product.withCategory")
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId")
    List<Product> findByCategoryIdWithDetails(@Param("categoryId") Long categoryId);
    
    // Projection pour les listes
    @Query("SELECT new com.app.dto.ProductSummaryDto(p.id, p.name, p.price) " +
           "FROM Product p WHERE p.category.id = :categoryId")
    List<ProductSummaryDto> findSummariesByCategoryId(@Param("categoryId") Long categoryId);
    
    // Pagination optimisée
    @Query(value = "SELECT p FROM Product p LEFT JOIN FETCH p.category",
           countQuery = "SELECT count(p) FROM Product p")
    Page<Product> findAllWithCategory(Pageable pageable);
    
    // Batch operations
    @Modifying
    @Query("UPDATE Product p SET p.price = p.price * :multiplier WHERE p.category.id = :categoryId")
    int updatePricesByCategory(@Param("categoryId") Long categoryId, 
                              @Param("multiplier") BigDecimal multiplier);
    
    // Native query pour performances critiques
    @Query(value = """
        SELECT p.id, p.name, p.price, c.name as category_name
        FROM products p 
        INNER JOIN categories c ON p.category_id = c.id 
        WHERE p.created_at >= :fromDate
        ORDER BY p.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findRecentProductsNative(@Param("fromDate") LocalDateTime fromDate, 
                                           @Param("limit") int limit);
}
```

**DTO et projections :**
```java
// DTO pour optimiser les transferts
public record ProductSummaryDto(
    Long id,
    String name,
    BigDecimal price
) {}

// Projection interface (plus légère)
public interface ProductProjection {
    Long getId();
    String getName();
    BigDecimal getPrice();
    String getCategoryName();
}
```

### 2. Configuration du cache Spring

::: tip
Le cache peut améliorer les performances de 10x à 100x pour les données fréquemment lues. Utilisez Redis pour un cache distribué en production.
:::

**Configuration du cache :**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
            .RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration());
        
        return builder.build();
    }
    
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(
            new RedisStandaloneConfiguration("localhost", 6379));
    }
    
    private RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
    
    // Configuration spécifique par cache
    @Bean
    public RedisCacheConfiguration userCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(2))
            .disableCachingNullValues();
    }
    
    @Bean
    public RedisCacheConfiguration productCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(15))
            .disableCachingNullValues();
    }
}
```

**Service avec cache optimisé :**
```java
@Service
@Transactional(readOnly = true)
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    // Cache simple
    @Cacheable(value = "products", key = "#id")
    public ProductDto getProduct(Long id) {
        return productRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }
    
    // Cache avec condition
    @Cacheable(value = "popularProducts", 
               key = "#categoryId", 
               condition = "#categoryId != null",
               unless = "#result.isEmpty()")
    public List<ProductDto> getPopularProducts(Long categoryId) {
        return productRepository.findPopularByCategory(categoryId)
            .stream()
            .map(this::toDto)
            .toList();
    }
    
    // Cache avec éviction
    @CacheEvict(value = {"products", "popularProducts"}, 
                key = "#product.id",
                beforeInvocation = false)
    @Transactional
    public ProductDto updateProduct(ProductUpdateDto productUpdate) {
        Product product = productRepository.findById(productUpdate.id())
            .orElseThrow(() -> new ProductNotFoundException(productUpdate.id()));
            
        // Update logic...
        product = productRepository.save(product);
        
        return toDto(product);
    }
    
    // Cache multi-niveaux avec SpEL
    @Cacheable(value = "productSearch", 
               key = "#query.concat('-').concat(#page).concat('-').concat(#size)",
               condition = "#query.length() >= 3")
    public Page<ProductDto> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByNameContaining(query, pageable)
            .map(this::toDto);
    }
    
    // Cache avec gestion d'erreur
    @Retryable(value = {Exception.class}, maxAttempts = 3)
    @Cacheable(value = "expensiveOperation", key = "#param")
    public String expensiveOperation(String param) {
        // Opération coûteuse...
        return "result";
    }
    
    @Recover
    public String recoverExpensiveOperation(Exception ex, String param) {
        log.error("Failed expensive operation for param: {}", param, ex);
        return "default-value";
    }
}
```

### 3. Optimisation des APIs REST

**Controller optimisé :**
```java
@RestController
@RequestMapping("/api/v1/products")
@Validated
public class ProductController {
    
    private final ProductService productService;
    
    // Pagination optimisée avec cache
    @GetMapping
    @Cacheable(value = "productPages", 
               key = "#page + '-' + #size + '-' + #sort + '-' + #categoryId")
    public ResponseEntity<PagedResponse<ProductSummaryDto>> getProducts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(required = false) Long categoryId) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sort));
        Page<ProductSummaryDto> products = productService.getProducts(pageRequest, categoryId);
        
        PagedResponse<ProductSummaryDto> response = PagedResponse.<ProductSummaryDto>builder()
            .content(products.getContent())
            .page(page)
            .size(size)
            .totalElements(products.getTotalElements())
            .totalPages(products.getTotalPages())
            .first(products.isFirst())
            .last(products.isLast())
            .build();
            
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
            .eTag(generateETag(response))
            .body(response);
    }
    
    // Bulk operations pour réduire les round-trips
    @PostMapping("/bulk")
    @Transactional
    public ResponseEntity<BulkOperationResult> bulkCreateProducts(
            @Valid @RequestBody List<@Valid ProductCreateDto> products) {
        
        if (products.size() > 1000) {
            throw new IllegalArgumentException("Bulk operation limited to 1000 items");
        }
        
        BulkOperationResult result = productService.bulkCreateProducts(products);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    // Compression response pour gros payload
    @GetMapping("/export")
    public ResponseEntity<Resource> exportProducts(
            @RequestParam(required = false) String format,
            HttpServletResponse response) {
        
        response.setHeader("Content-Encoding", "gzip");
        response.setHeader("Content-Disposition", "attachment; filename=products.json.gz");
        
        Resource resource = productService.exportProducts(format);
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(resource);
    }
    
    private String generateETag(Object content) {
        return "\"" + Objects.hash(content) + "\"";
    }
}
```

### 4. Configuration asynchrone

::: info
L'exécution asynchrone peut améliorer drastiquement la responsivité de votre application pour les tâches non-critiques.
:::

**Configuration des threads :**
```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("async-task-");
        executor.setKeepAliveSeconds(60);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
    
    @Bean(name = "longRunningTaskExecutor")
    public ThreadPoolTaskExecutor longRunningTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("long-task-");
        executor.setKeepAliveSeconds(300);
        executor.initialize();
        return executor;
    }
    
    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor();
    }
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("Async execution error in method: {} with params: {}", 
                     method.getName(), Arrays.toString(params), throwable);
        };
    }
}
```

**Service asynchrone :**
```java
@Service
public class NotificationService {
    
    // Méthode asynchrone simple
    @Async("taskExecutor")
    public CompletableFuture<Void> sendEmailNotification(String email, String message) {
        try {
            // Simulation envoi email
            Thread.sleep(2000);
            log.info("Email sent to: {}", email);
            return CompletableFuture.completedFuture(null);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.failedFuture(e);
        }
    }
    
    // Méthode asynchrone avec retour
    @Async("taskExecutor")
    public CompletableFuture<String> processDataAsync(String data) {
        return CompletableFuture.supplyAsync(() -> {
            // Traitement long
            try {
                Thread.sleep(5000);
                return "Processed: " + data;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(e);
            }
        });
    }
    
    // Composition d'opérations asynchrones
    @Async("longRunningTaskExecutor")
    public CompletableFuture<ReportResult> generateReport(Long userId) {
        return CompletableFuture
            .supplyAsync(() -> fetchUserData(userId))
            .thenCompose(userData -> 
                CompletableFuture.allOf(
                    generateUserReport(userData),
                    generateActivityReport(userData),
                    generateStatsReport(userData)
                ).thenApply(v -> combineReports(userData)))
            .exceptionally(throwable -> {
                log.error("Report generation failed for user: {}", userId, throwable);
                return ReportResult.failed(throwable.getMessage());
            });
    }
}
```

## Optimisation des requêtes et base de données

### Configuration HikariCP optimisée

::: tip
HikariCP est le pool de connexions le plus performant pour Spring Boot. Une configuration optimale peut diviser par 2 les temps de réponse.
:::

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:postgresql://localhost:5432/myapp
    username: ${DB_USERNAME:user}
    password: ${DB_PASSWORD:password}
    hikari:
      # Pool size optimization
      maximum-pool-size: 20
      minimum-idle: 5
      
      # Connection timeout
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1200000
      
      # Performance settings
      leak-detection-threshold: 60000
      validation-timeout: 5000
      
      # Connection properties
      connection-test-query: SELECT 1
      pool-name: HikariPool-MyApp
      
      # DataSource properties
      data-source-properties:
        cachePrepStmts: true
        prepStmtCacheSize: 250
        prepStmtCacheSqlLimit: 2048
        useServerPrepStmts: true
        useLocalSessionState: true
        rewriteBatchedStatements: true
        cacheResultSetMetadata: true
        cacheServerConfiguration: true
        elideSetAutoCommits: true
        maintainTimeStats: false
```

### Requêtes optimisées avec Spring Data JPA

```java
@Repository
public interface OptimizedProductRepository extends JpaRepository<Product, Long> {
    
    // Requête avec index hints
    @Query(value = """
        SELECT /*+ INDEX(p idx_category_created) */ 
               p.id, p.name, p.price, p.created_at
        FROM products p 
        WHERE p.category_id = :categoryId 
          AND p.created_at >= :fromDate
        ORDER BY p.created_at DESC
        """, nativeQuery = true)
    List<Object[]> findRecentByCategoryOptimized(@Param("categoryId") Long categoryId,
                                                @Param("fromDate") LocalDateTime fromDate);
    
    // Batch insert optimisé
    @Modifying
    @Query(value = """
        INSERT INTO products (name, price, category_id, created_at) 
        VALUES (:#{#products})
        ON CONFLICT (name, category_id) 
        DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()
        """, nativeQuery = true)
    void batchUpsertProducts(@Param("products") List<ProductInsertDto> products);
    
    // Requête avec window functions
    @Query(value = """
        SELECT p.*, 
               ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) as rank_in_category
        FROM products p
        WHERE p.category_id IN (:categoryIds)
        """, nativeQuery = true)
    List<Object[]> findProductsWithRanking(@Param("categoryIds") List<Long> categoryIds);
    
    // CTE pour requêtes complexes
    @Query(value = """
        WITH category_stats AS (
            SELECT category_id, 
                   COUNT(*) as product_count,
                   AVG(price) as avg_price
            FROM products 
            GROUP BY category_id
        )
        SELECT p.*, cs.product_count, cs.avg_price
        FROM products p
        JOIN category_stats cs ON p.category_id = cs.category_id
        WHERE cs.product_count > :minCount
        """, nativeQuery = true)
    List<Object[]> findProductsWithCategoryStats(@Param("minCount") int minCount);
}
```

### Service de requêtes avec optimisations

```java
@Service
@Transactional(readOnly = true)
public class OptimizedQueryService {
    
    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;
    
    // Requête bulk avec pagination curseur
    public List<ProductDto> getProductsPaginated(String cursor, int limit) {
        String sql = """
            SELECT id, name, price, created_at
            FROM products
            WHERE (:cursor IS NULL OR created_at < :cursor)
            ORDER BY created_at DESC
            LIMIT :limit
            """;
            
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("cursor", cursor != null ? LocalDateTime.parse(cursor) : null)
            .addValue("limit", limit);
            
        return namedJdbcTemplate.query(sql, params, 
            (rs, rowNum) -> ProductDto.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .price(rs.getBigDecimal("price"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .build());
    }
    
    // Batch processing avec Stream
    @Transactional
    public int processBatchUpdate(List<Long> productIds, BigDecimal priceMultiplier) {
        String sql = """
            UPDATE products 
            SET price = price * :multiplier, updated_at = NOW()
            WHERE id = ANY(:ids)
            """;
            
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("multiplier", priceMultiplier)
            .addValue("ids", productIds.toArray(Long[]::new));
            
        return namedJdbcTemplate.update(sql, params);
    }
    
    // Aggregation optimisée
    public Map<String, Object> getCategoryStatistics() {
        String sql = """
            SELECT 
                COUNT(DISTINCT c.id) as total_categories,
                COUNT(p.id) as total_products,
                AVG(p.price) as avg_price,
                MIN(p.price) as min_price,
                MAX(p.price) as max_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price) as median_price
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            """;
            
        return jdbcTemplate.queryForMap(sql);
    }
    
    // Recherche full-text optimisée
    public List<ProductSearchResult> searchProductsFullText(String query, int limit) {
        String sql = """
            SELECT p.id, p.name, p.price, c.name as category_name,
                   ts_rank(to_tsvector('french', p.name || ' ' || COALESCE(p.description, '')), 
                           plainto_tsquery('french', :query)) as rank
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE to_tsvector('french', p.name || ' ' || COALESCE(p.description, '')) 
                  @@ plainto_tsquery('french', :query)
            ORDER BY rank DESC, p.created_at DESC
            LIMIT :limit
            """;
            
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("query", query)
            .addValue("limit", limit);
            
        return namedJdbcTemplate.query(sql, params,
            (rs, rowNum) -> ProductSearchResult.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .price(rs.getBigDecimal("price"))
                .categoryName(rs.getString("category_name"))
                .relevanceScore(rs.getDouble("rank"))
                .build());
    }
}
```

## Monitoring et profiling

### Configuration Micrometer et métriques

::: info
Les métriques permettent d'identifier les performances en temps réel. Micrometer s'intègre parfaitement avec Prometheus, Grafana et autres systèmes de monitoring.
:::

```java
@Configuration
public class MetricsConfig {
    
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
    
    @Bean
    public CountedAspect countedAspect(MeterRegistry registry) {
        return new CountedAspect(registry);
    }
    
    // Métriques custom
    @Bean
    @ConditionalOnProperty(name = "app.metrics.custom.enabled", havingValue = "true")
    public MeterBinder customMetrics() {
        return registry -> {
            // Business metrics
            Gauge.builder("active.users.count")
                .description("Number of active users")
                .register(registry, this, MetricsConfig::getActiveUsersCount);
                
            // System metrics
            Gauge.builder("database.connection.pool.active")
                .description("Active database connections")
                .register(registry, this, MetricsConfig::getActiveConnections);
        };
    }
    
    private double getActiveUsersCount() {
        // Implementation pour compter les utilisateurs actifs
        return 0.0;
    }
    
    private double getActiveConnections() {
        // Implementation pour compter les connexions actives
        return 0.0;
    }
}
```

**Service avec métriques :**
```java
@Service
public class MeteredProductService {
    
    private final ProductRepository productRepository;
    private final MeterRegistry meterRegistry;
    
    private final Counter productCreatedCounter;
    private final Timer productFetchTimer;
    private final DistributionSummary productPriceSummary;
    
    public MeteredProductService(ProductRepository productRepository, 
                                MeterRegistry meterRegistry) {
        this.productRepository = productRepository;
        this.meterRegistry = meterRegistry;
        
        this.productCreatedCounter = Counter.builder("products.created")
            .description("Number of products created")
            .tag("service", "product")
            .register(meterRegistry);
            
        this.productFetchTimer = Timer.builder("products.fetch.time")
            .description("Time taken to fetch products")
            .register(meterRegistry);
            
        this.productPriceSummary = DistributionSummary.builder("products.price")
            .description("Distribution of product prices")
            .baseUnit("euros")
            .register(meterRegistry);
    }
    
    @Timed(value = "products.create", description = "Time taken to create product")
    @Counted(value = "products.create.attempts", description = "Product creation attempts")
    public ProductDto createProduct(ProductCreateDto request) {
        try {
            Product product = new Product();
            // Mapping logic...
            
            product = productRepository.save(product);
            
            // Custom metrics
            productCreatedCounter.increment();
            productPriceSummary.record(product.getPrice().doubleValue());
            
            return toDto(product);
        } catch (Exception e) {
            meterRegistry.counter("products.create.errors", 
                "error", e.getClass().getSimpleName()).increment();
            throw e;
        }
    }
    
    public List<ProductDto> getProducts(int page, int size) {
        return Timer.Sample.start(meterRegistry)
            .stop(productFetchTimer.timer("page", String.valueOf(page)))
            .recordCallable(() -> {
                PageRequest pageRequest = PageRequest.of(page, size);
                return productRepository.findAll(pageRequest)
                    .getContent()
                    .stream()
                    .map(this::toDto)
                    .toList();
            });
    }
}
```

### Health checks et observabilité

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    private final DataSource dataSource;
    private final MeterRegistry meterRegistry;
    
    @Override
    public Health health() {
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try (Connection connection = dataSource.getConnection()) {
            // Test simple query
            try (PreparedStatement stmt = connection.prepareStatement("SELECT 1")) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next() && rs.getInt(1) == 1) {
                    sample.stop(Timer.builder("health.database")
                        .tag("status", "up")
                        .register(meterRegistry));
                    
                    return Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("connection", "healthy")
                        .build();
                }
            }
        } catch (SQLException e) {
            sample.stop(Timer.builder("health.database")
                .tag("status", "down")
                .register(meterRegistry));
                
            return Health.down()
                .withDetail("database", "PostgreSQL")
                .withDetail("error", e.getMessage())
                .build();
        }
        
        return Health.down().build();
    }
}

// Health check custom pour services externes
@Component
public class ExternalServiceHealthIndicator implements HealthIndicator {
    
    private final WebClient webClient;
    
    @Override
    public Health health() {
        try {
            String response = webClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5))
                .block();
                
            return Health.up()
                .withDetail("external-service", "available")
                .withDetail("response", response)
                .build();
                
        } catch (Exception e) {
            return Health.down()
                .withDetail("external-service", "unavailable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## Profiling et diagnostic

### Configuration Java Flight Recorder (JFR)

::: tip
JFR est l'outil de profiling de référence pour les applications Java en production. Il a un overhead très faible (< 1%) et fournit des informations détaillées sur les performances.
:::

**Configuration JFR :**
```bash
# Arguments JVM pour JFR
JAVA_OPTS="$JAVA_OPTS \
-XX:+FlightRecorder \
-XX:StartFlightRecording=duration=300s,filename=/tmp/app-profile.jfr,settings=profile \
-XX:FlightRecorderOptions=dumponexit=true,dumponexitpath=/tmp/app-exit.jfr"

# Profiling ciblé via JFR API
# Dans le code Java :
FlightRecorder.getFlightRecorder().start();
```

**Service de profiling intégré :**
```java
@Service
public class ProfilingService {
    
    private final Logger log = LoggerFactory.getLogger(ProfilingService.class);
    
    @EventHandler
    public void onApplicationReady(ApplicationReadyEvent event) {
        if (isProfilingEnabled()) {
            startProfiling();
        }
    }
    
    public void startProfiling() {
        try {
            Recording recording = new Recording();
            recording.setName("application-profile");
            recording.setDuration(Duration.ofMinutes(5));
            recording.setToDisk(true);
            recording.setDestination(Paths.get("/tmp/spring-boot-profile.jfr"));
            
            recording.enable("jdk.CPULoad").withPeriod(Duration.ofSeconds(1));
            recording.enable("jdk.GCHeapSummary").withPeriod(Duration.ofSeconds(1));
            recording.enable("jdk.JavaMonitorEnter");
            recording.enable("jdk.JavaMonitorWait");
            
            recording.start();
            
            log.info("JFR profiling started: {}", recording.getName());
        } catch (Exception e) {
            log.error("Failed to start JFR recording", e);
        }
    }
    
    @Scheduled(fixedRate = 300000) // Toutes les 5 minutes
    public void generatePeriodicProfile() {
        if (shouldGenerateProfile()) {
            generateProfileSnapshot();
        }
    }
    
    private void generateProfileSnapshot() {
        try {
            Path profilePath = Paths.get("/tmp/profiles/profile-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".jfr");
            
            FlightRecorderMXBean flightRecorderMBean = ManagementFactory
                .getPlatformMXBean(FlightRecorderMXBean.class);
            
            long recordingId = flightRecorderMBean.newRecording();
            flightRecorderMBean.setPredefinedConfiguration(recordingId, "profile");
            flightRecorderMBean.startRecording(recordingId);
            
            // Enregistrer pendant 60 secondes
            Thread.sleep(60000);
            
            flightRecorderMBean.stopRecording(recordingId);
            long streamId = flightRecorderMBean.openStream(recordingId, null);
            
            // Copier les données vers le fichier
            try (InputStream is = new FlightRecorderInputStream(streamId);
                 OutputStream os = Files.newOutputStream(profilePath)) {
                is.transferTo(os);
            }
            
            flightRecorderMBean.closeRecording(recordingId);
            
            log.info("Profile snapshot generated: {}", profilePath);
        } catch (Exception e) {
            log.error("Failed to generate profile snapshot", e);
        }
    }
}
```

### Outils de diagnostic et monitoring

::: details Configuration complète de monitoring avec Spring Boot Actuator
Cette configuration expose tous les endpoints nécessaires pour le monitoring en production.
:::

```yaml
# Actuator configuration complète
management:
  endpoints:
    web:
      exposure:
        include: "*"
      base-path: /actuator
      cors:
        allowed-origins: "*"
        allowed-methods: "*"
    jmx:
      exposure:
        include: "*"
        
  endpoint:
    health:
      show-details: always
      show-components: always
      probes:
        enabled: true
    metrics:
      enabled: true
    prometheus:
      enabled: true
    httptrace:
      enabled: true
    threaddump:
      enabled: true
    heapdump:
      enabled: true
    
  metrics:
    export:
      prometheus:
        enabled: true
        descriptions: true
      jmx:
        enabled: true
    distribution:
      percentiles:
        http.server.requests: 0.5, 0.9, 0.95, 0.99
        spring.data.repository.invocations: 0.5, 0.9, 0.95, 0.99
      percentiles-histogram:
        http.server.requests: true
        spring.data.repository.invocations: true
    tags:
      application: ${spring.application.name}
      environment: ${spring.profiles.active}
      
  info:
    env:
      enabled: true
    build:
      enabled: true
    git:
      enabled: true
      mode: full
    java:
      enabled: true
      
  server:
    port: 8080
    
  # Security pour les endpoints actuator
  security:
    enabled: true
```

## Tests de performance

### Configuration JMeter pour Spring Boot

**Plan de test JMeter (performance-test.jmx) :**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.4.3">
  <hashTree>
    <!-- Test Plan -->
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Spring Boot Performance Test">
      <stringProp name="TestPlan.comments">Performance test for Spring Boot application</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel">
        <collectionProp name="Arguments.arguments">
          <elementProp name="host" elementType="Argument">
            <stringProp name="Argument.name">host</stringProp>
            <stringProp name="Argument.value">localhost</stringProp>
          </elementProp>
          <elementProp name="port" elementType="Argument">
            <stringProp name="Argument.name">port</stringProp>
            <stringProp name="Argument.value">8080</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    
    <!-- Thread Group -->
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Load Test">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">100</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
        <longProp name="ThreadGroup.start_time">1609459200000</longProp>
        <longProp name="ThreadGroup.end_time">1609459200000</longProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
      </ThreadGroup>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### Tests de charge avec Spring Boot Test

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.cache.type=simple"
})
class PerformanceTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private ProductRepository productRepository;
    
    @LocalServerPort
    private int port;
    
    private String baseUrl;
    
    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        
        // Préparer des données de test
        List<Product> products = IntStream.range(0, 10000)
            .mapToObj(i -> Product.builder()
                .name("Product " + i)
                .price(BigDecimal.valueOf(10.00 + i))
                .build())
            .toList();
            
        productRepository.saveAll(products);
    }
    
    @Test
    @Timeout(value = 30, unit = TimeUnit.SECONDS)
    void testProductListPerformance() {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        
        // Test performance pagination
        for (int page = 0; page < 10; page++) {
            ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/api/v1/products?page=" + page + "&size=100", 
                String.class);
                
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        }
        
        stopWatch.stop();
        
        // Assertion sur la performance
        assertThat(stopWatch.getTotalTimeMillis())
            .as("10 pages should load within 5 seconds")
            .isLessThan(5000);
    }
    
    @Test
    void testConcurrentAccess() throws InterruptedException {
        int threadCount = 50;
        int requestsPerThread = 10;
        CountDownLatch latch = new CountDownLatch(threadCount);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        
        List<Long> responseTimes = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < requestsPerThread; j++) {
                        long startTime = System.currentTimeMillis();
                        
                        try {
                            ResponseEntity<String> response = restTemplate.getForEntity(
                                baseUrl + "/api/v1/products?page=" + j, String.class);
                                
                            if (response.getStatusCode().is2xxSuccessful()) {
                                successCount.incrementAndGet();
                            } else {
                                errorCount.incrementAndGet();
                            }
                        } catch (Exception e) {
                            errorCount.incrementAndGet();
                        }
                        
                        long responseTime = System.currentTimeMillis() - startTime;
                        responseTimes.add(responseTime);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        latch.await(60, TimeUnit.SECONDS);
        executor.shutdown();
        
        // Analyse des résultats
        double averageResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
            
        long maxResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0L);
            
        double successRate = (double) successCount.get() / (successCount.get() + errorCount.get()) * 100;
        
        System.out.printf("Performance Results:%n");
        System.out.printf("Success Rate: %.2f%%%n", successRate);
        System.out.printf("Average Response Time: %.2f ms%n", averageResponseTime);
        System.out.printf("Max Response Time: %d ms%n", maxResponseTime);
        System.out.printf("Total Requests: %d%n", successCount.get() + errorCount.get());
        
        // Assertions de performance
        assertThat(successRate).isGreaterThan(95.0);
        assertThat(averageResponseTime).isLessThan(500.0);
        assertThat(maxResponseTime).isLessThan(2000L);
    }
}
```

## Déploiement optimisé

### Configuration Docker en production

::: warning
En production, utilisez toujours des images spécifiques avec digest SHA et configurez les resource limits pour éviter les problèmes de performance.
:::

```dockerfile
# Multi-stage build optimisé pour la production
FROM eclipse-temurin:21-jdk-alpine AS builder

# Installer des outils nécessaires
RUN apk add --no-cache git

WORKDIR /app

# Copier les fichiers de configuration en premier (cache Docker)
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
COPY gradle.properties ./

# Download dependencies (sera mis en cache si les fichiers ne changent pas)
RUN ./gradlew dependencies --no-daemon

# Copier le code source
COPY src/ src/

# Build optimisé avec profile production
RUN ./gradlew clean build -Pprod --no-daemon -x test && \
    java -Djarmode=layertools -jar build/libs/*.jar extract

# Production runtime image
FROM eclipse-temurin:21-jre-alpine AS runtime

# Sécurité : utilisateur non-root
RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -u 1001 -s /bin/false -G appuser appuser && \
    mkdir /app && \
    chown appuser:appuser /app

# Installation de outils monitoring (optionnel)
RUN apk add --no-cache \
    curl \
    jq \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copier les layers de l'application (optimisation Docker)
COPY --from=builder --chown=appuser:appuser app/dependencies/ ./
COPY --from=builder --chown=appuser:appuser app/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appuser app/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appuser app/application/ ./

USER appuser

# Configuration JVM optimisée pour containers
ENV JAVA_OPTS="-server \
               -XX:+UseG1GC \
               -XX:MaxGCPauseMillis=200 \
               -XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UnlockExperimentalVMOptions \
               -XX:+EnableJVMCI \
               -XX:+UseJVMCICompiler \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.profiles.active=production"

# Health check avec retry
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

# Démarrage optimisé avec Spring Boot launcher
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
```

### Configuration Kubernetes pour production

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-boot-app
  labels:
    app: spring-boot-app
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-boot-app
  template:
    metadata:
      labels:
        app: spring-boot-app
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      containers:
      - name: app
        image: myapp/spring-boot-app:1.0.0@sha256:abc123...
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        # Ressources optimisées
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        # Probes de santé
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 90
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        # Startup probe pour démarrage lent
        startupProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 10
        # Configuration volumes
        volumeMounts:
        - name: app-config
          mountPath: /app/config
          readOnly: true
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: app-config
        configMap:
          name: app-config
      - name: logs
        emptyDir: {}
      # Anti-affinity pour répartir les pods
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - spring-boot-app
              topologyKey: kubernetes.io/hostname
---
# HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: spring-boot-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: spring-boot-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

## Ressources et outils

### Documentation et références
- [Spring Boot Performance](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) - Documentation officielle
- [Micrometer Documentation](https://micrometer.io/docs) - Métriques et monitoring
- [HikariCP Performance](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing) - Optimisation pool de connexions
- [JVM Performance Tuning](https://docs.oracle.com/en/java/javase/17/gctuning/) - Guide Oracle officiel

### Outils de profiling
- **Java Flight Recorder (JFR)** - Profiling en production avec overhead minimal
- **VisualVM** - Profiling et monitoring JVM
- **JProfiler** - Profiler commercial avancé
- **async-profiler** - Profiler sampling haute performance

### Monitoring et observabilité
- **Prometheus + Grafana** - Métriques et dashboards
- **Jaeger** - Distributed tracing
- **ELK Stack** - Logs centralisés
- **APM Tools** - New Relic, DataDog, AppDynamics

## Conclusion

L'optimisation des performances Spring Boot en 2025 repose sur une approche méthodique :

**Points clés retenus :**
- **Mesurer avant d'optimiser** : Profiling et métriques sont essentiels
- **Configuration JVM moderne** : G1GC, containers support, JFR
- **Optimisations applicatives** : Cache, requêtes SQL, pools de connexions
- **Monitoring continu** : Actuator, Micrometer, alerting

**Impact sur les performances :**
- **JVM tuning** : 20-50% d'amélioration
- **Cache intelligent** : 10x-100x sur les données fréquentes
- **Optimisation SQL** : 2x-10x sur les requêtes
- **Monitoring proactif** : Détection précoce des régressions

**Prochaines étapes recommandées :**
1. **Audit** : Analyser votre application avec JFR
2. **Baseline** : Établir des métriques de référence
3. **Optimisation** : Appliquer les techniques adaptées
4. **Monitoring** : Mettre en place l'observabilité
5. **Tests** : Valider les améliorations avec des tests de charge

L'optimisation est un processus continu qui nécessite une culture de la performance dans l'équipe de développement.
