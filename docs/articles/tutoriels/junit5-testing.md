---
title: Tests unitaires efficaces avec JUnit 5
date: '2025-06-28T08:16:00.000Z'
tags:
  - junit5
  - testing
  - java
  - tdd
  - spring-boot
  - mockito
  - testcontainers
author: mooki
excerpt: >-
  Guide complet pour maîtriser JUnit 5 : annotations modernes, assertions
  avancées, tests paramétrés et bonnes pratiques 2025
category: tutoriels
---

# Tests unitaires efficaces avec JUnit 5

JUnit 5 révolutionne l'écriture de tests en Java avec une architecture modulaire, des annotations expressives et des fonctionnalités avancées. Ce guide couvre toutes les techniques modernes pour écrire des tests efficaces et maintenables.

## Introduction à JUnit 5

### Architecture JUnit 5

JUnit 5 est composé de trois sous-projets :

- **JUnit Platform** : Fondation pour lancer les tests
- **JUnit Jupiter** : Nouveau modèle de programmation et d'extension
- **JUnit Vintage** : Compatibilité avec JUnit 3 et 4

### Avantages de JUnit 5

- **Java 8+** : Support des lambdas et streams
- **Annotations expressives** : Tests plus lisibles
- **Extensions** : Système d'extension flexible
- **Tests paramétrés** : Multiples scénarios facilement
- **Tests dynamiques** : Génération de tests à l'exécution
- **Exécution parallèle** : Performance améliorée

## Configuration et dépendances

### Configuration Maven

```xml
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <junit.version>5.10.1</junit.version>
    <mockito.version>5.8.0</mockito.version>
    <assertj.version>3.24.2</assertj.version>
    <testcontainers.version>1.19.3</testcontainers.version>
</properties>

<dependencies>
    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Mockito pour les mocks -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>${mockito.version}</version>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-junit-jupiter</artifactId>
        <version>${mockito.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- AssertJ pour des assertions plus expressives -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>${assertj.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Testcontainers pour tests d'intégration -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${testcontainers.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.3</version>
            <configuration>
                <properties>
                    <configurationParameters>
                        junit.jupiter.execution.parallel.enabled=true
                        junit.jupiter.execution.parallel.mode.default=concurrent
                        junit.jupiter.displayname.generator.default=org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
                    </configurationParameters>
                </properties>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### Configuration Gradle

```kotlin
dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
    testImplementation("org.mockito:mockito-core:5.8.0")
    testImplementation("org.mockito:mockito-junit-jupiter:5.8.0")
    testImplementation("org.assertj:assertj-core:3.24.2")
    testImplementation("org.testcontainers:junit-jupiter:1.19.3")
}

tasks.test {
    useJUnitPlatform()
    
    systemProperties = mapOf(
        "junit.jupiter.execution.parallel.enabled" to "true",
        "junit.jupiter.execution.parallel.mode.default" to "concurrent",
        "junit.jupiter.displayname.generator.default" to 
            "org.junit.jupiter.api.DisplayNameGenerator\$ReplaceUnderscores"
    )
}
```

## Annotations essentielles

### Annotations de base

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Calculatrice - Tests unitaires")
class CalculatriceTest {
    
    private Calculatrice calculatrice;
    
    @BeforeAll
    static void setupClass() {
        // Configuration une seule fois pour toute la classe
        System.setProperty("test.environment", "unit");
    }
    
    @BeforeEach
    void setup() {
        // Configuration avant chaque test
        calculatrice = new Calculatrice();
    }
    
    @Test
    @DisplayName("Addition de deux nombres positifs")
    void should_add_two_positive_numbers() {
        // Given
        double a = 5.0;
        double b = 3.0;
        
        // When
        double result = calculatrice.additionner(a, b);
        
        // Then
        assertEquals(8.0, result);
    }
    
    @Test
    @DisplayName("Division par zéro lance une exception")
    void should_throw_exception_when_dividing_by_zero() {
        // Given
        double a = 10.0;
        double b = 0.0;
        
        // When & Then
        ArithmeticException exception = assertThrows(
            ArithmeticException.class,
            () -> calculatrice.diviser(a, b)
        );
        
        assertEquals("Division par zéro impossible", exception.getMessage());
    }
    
    @AfterEach
    void tearDown() {
        // Nettoyage après chaque test
        calculatrice = null;
    }
    
    @AfterAll
    static void tearDownClass() {
        // Nettoyage final
        System.clearProperty("test.environment");
    }
}
```

### Annotations de cycle de vie avancées

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ServiceTest {
    
    private DatabaseConnection connection;
    
    @BeforeAll
    void initializeDatabase() {
        // Avec PER_CLASS, pas besoin de static
        connection = new DatabaseConnection();
        connection.createSchema();
    }
    
    @AfterAll
    void cleanupDatabase() {
        connection.dropSchema();
        connection.close();
    }
}
```

## Assertions modernes

### Assertions de base améliorées

```java
import static org.junit.jupiter.api.Assertions.*;

class AssertionsModernesTest {
    
    @Test
    @DisplayName("Assertions avec messages personnalisés")
    void assertions_avec_messages() {
        String actual = "Hello World";
        
        // Message statique
        assertEquals("Hello World", actual, "Le message devrait être correct");
        
        // Message dynamique (lambda - évalué seulement en cas d'échec)
        assertEquals("Hello World", actual, 
            () -> "Attendu: Hello World, mais était: " + actual);
    }
    
    @Test
    @DisplayName("Assertions groupées")
    void assertions_groupees() {
        Person person = new Person("John", "Doe", 30);
        
        // Toutes les assertions sont exécutées même si certaines échouent
        assertAll("Person validation",
            () -> assertEquals("John", person.getFirstName()),
            () -> assertEquals("Doe", person.getLastName()),
            () -> assertTrue(person.getAge() > 0),
            () -> assertNotNull(person.getFullName())
        );
    }
    
    @Test
    @DisplayName("Assertions avec timeout")
    void assertions_avec_timeout() {
        // Timeout avec durée
        assertTimeout(Duration.ofSeconds(2), () -> {
            // Opération qui doit se terminer en moins de 2 secondes
            Thread.sleep(1000);
            return "Completed";
        });
        
        // Timeout preemptive (interruption forcée)
        assertTimeoutPreemptively(Duration.ofSeconds(1), () -> {
            // Cette opération sera interrompue après 1 seconde
            return someSlowOperation();
        });
    }
    
    @Test
    @DisplayName("Assertions d'exception avec vérification détaillée")
    void assertions_exception_detaillee() {
        Exception exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Person("", "", -1)
        );
        
        // Vérifications multiples sur l'exception
        assertAll("Exception validation",
            () -> assertEquals("Invalid person data", exception.getMessage()),
            () -> assertNotNull(exception.getCause()),
            () -> assertTrue(exception.getMessage().contains("Invalid"))
        );
    }
}
```

### AssertJ - Assertions fluides

```java
import static org.assertj.core.api.Assertions.*;

class AssertJExamplesTest {
    
    @Test
    @DisplayName("AssertJ - Assertions fluides et expressives")
    void assertj_examples() {
        List<String> names = List.of("Alice", "Bob", "Charlie");
        
        // Assertions sur collections
        assertThat(names)
            .isNotEmpty()
            .hasSize(3)
            .contains("Alice", "Bob")
            .doesNotContain("David")
            .allMatch(name -> name.length() > 2);
        
        // Assertions sur objets
        Person person = new Person("John", "Doe", 30);
        assertThat(person)
            .isNotNull()
            .extracting("firstName", "lastName", "age")
            .containsExactly("John", "Doe", 30);
        
        // Assertions sur strings
        String text = "Hello World";
        assertThat(text)
            .isNotBlank()
            .startsWith("Hello")
            .endsWith("World")
            .containsIgnoringCase("WORLD");
        
        // Assertions sur nombres
        double result = 10.5;
        assertThat(result)
            .isPositive()
            .isGreaterThan(10.0)
            .isCloseTo(10.6, within(0.2));
    }
    
    @Test
    @DisplayName("AssertJ - Assertions custom")
    void assertj_custom_assertions() {
        Person person = new Person("John", "Doe", 17);
        
        // Assertion custom avec message descriptif
        assertThat(person)
            .satisfies(p -> {
                assertThat(p.getAge()).as("Age should be valid").isBetween(0, 120);
                assertThat(p.getFullName()).as("Full name should be formatted correctly")
                    .isEqualTo("John Doe");
            });
        
        // Soft assertions (toutes les assertions sont vérifiées)
        SoftAssertions.assertSoftly(softly -> {
            softly.assertThat(person.getFirstName()).isEqualTo("John");
            softly.assertThat(person.getLastName()).isEqualTo("Doe");
            softly.assertThat(person.getAge()).isGreaterThan(18); // Échec
            softly.assertThat(person.isAdult()).isFalse(); // Sera quand même vérifié
        });
    }
}
```

## Tests paramétrés avancés

### Sources de données multiples

```java
class TestsParametresTest {
    
    @ParameterizedTest
    @DisplayName("Test avec différentes sources de valeurs")
    @ValueSource(strings = {"", " ", "   "})
    void should_detect_blank_strings(String input) {
        assertTrue(StringUtils.isBlank(input));
    }
    
    @ParameterizedTest
    @DisplayName("Test avec enum values")
    @EnumSource(DayOfWeek.class)
    void should_handle_all_days_of_week(DayOfWeek day) {
        assertNotNull(day);
        assertTrue(day.getValue() >= 1 && day.getValue() <= 7);
    }
    
    @ParameterizedTest
    @DisplayName("Test avec arguments multiples")
    @CsvSource({
        "1, 1, 2",
        "2, 3, 5", 
        "10, 15, 25",
        "-1, 1, 0"
    })
    void should_add_numbers_correctly(int a, int b, int expected) {
        assertEquals(expected, calculatrice.additionner(a, b));
    }
    
    @ParameterizedTest
    @DisplayName("Test avec fichier CSV")
    @CsvFileSource(resources = "/test-data.csv", numLinesToSkip = 1)
    void should_process_csv_data(String name, int age, String expectedCategory) {
        Person person = new Person(name, "", age);
        assertEquals(expectedCategory, person.getAgeCategory());
    }
    
    @ParameterizedTest
    @DisplayName("Test avec méthode de génération")
    @MethodSource("provideEmailTestCases")
    void should_validate_emails(String email, boolean isValid) {
        assertEquals(isValid, EmailValidator.isValid(email));
    }
    
    static Stream<Arguments> provideEmailTestCases() {
        return Stream.of(
            Arguments.of("test@example.com", true),
            Arguments.of("invalid.email", false),
            Arguments.of("user@domain.co.uk", true),
            Arguments.of("@missing-local.com", false),
            Arguments.of("user@.com", false)
        );
    }
    
    @ParameterizedTest
    @DisplayName("Test avec arguments converter")
    @ValueSource(strings = {"2024-01-01", "2024-12-31", "2025-06-15"})
    void should_parse_dates(@ConvertWith(LocalDateConverter.class) LocalDate date) {
        assertNotNull(date);
        assertTrue(date.getYear() >= 2024);
    }
    
    static class LocalDateConverter implements ArgumentConverter {
        @Override
        public Object convert(Object source, ParameterContext context) {
            return LocalDate.parse((String) source);
        }
    }
}
```

### Tests répétés et conditionnels

```java
class TestsRepeatsAndConditionsTest {
    
    @RepeatedTest(value = 5, name = "Exécution {currentRepetition}/{totalRepetitions}")
    @DisplayName("Test de génération de nombres aléatoires")
    void should_generate_random_numbers_in_range(RepetitionInfo repetitionInfo) {
        int randomNumber = RandomUtils.generateBetween(1, 100);
        
        assertThat(randomNumber)
            .isBetween(1, 100);
            
        // Information sur la répétition courante
        System.out.println("Répétition " + repetitionInfo.getCurrentRepetition() 
            + "/" + repetitionInfo.getTotalRepetitions() + ": " + randomNumber);
    }
    
    @Test
    @EnabledOnOs(OS.LINUX)
    @DisplayName("Test spécifique à Linux")
    void should_run_only_on_linux() {
        // Test spécifique à Linux
        assertTrue(System.getProperty("os.name").toLowerCase().contains("linux"));
    }
    
    @Test
    @EnabledOnJre(JRE.JAVA_21)
    @DisplayName("Test spécifique à Java 21")
    void should_run_only_on_java_21() {
        // Test utilisant des fonctionnalités Java 21
        assertNotNull(System.getProperty("java.version"));
    }
    
    @Test
    @EnabledIfSystemProperty(named = "environment", matches = "development")
    @DisplayName("Test en développement seulement")
    void should_run_only_in_development() {
        // Test spécifique à l'environnement de développement
        assertEquals("development", System.getProperty("environment"));
    }
    
    @Test
    @EnabledIfEnvironmentVariable(named = "DEBUG", matches = "true")
    @DisplayName("Test en mode debug")
    void should_run_only_in_debug_mode() {
        // Test en mode debug
        assertTrue(Boolean.parseBoolean(System.getenv("DEBUG")));
    }
    
    @Test
    @DisabledOnOs(OS.WINDOWS)
    @DisabledIfSystemProperty(named = "skip.integration.tests", matches = "true")
    @DisplayName("Test d'intégration conditionnel")
    void integration_test_conditional() {
        // Test d'intégration qui peut être désactivé
        assertTrue(true);
    }
}
```

## Tests dynamiques

### Génération de tests à l'exécution

```java
class TestsDynamiquesTest {
    
    @TestFactory
    @DisplayName("Tests dynamiques de validation")
    Stream<DynamicTest> dynamicValidationTests() {
        List<String> emails = List.of(
            "valid@example.com",
            "another.valid@domain.org", 
            "invalid.email",
            "@invalid.com",
            "missing@.com"
        );
        
        return emails.stream()
            .map(email -> DynamicTest.dynamicTest(
                "Validation de: " + email,
                () -> {
                    boolean isValid = EmailValidator.isValid(email);
                    if (email.contains("@") && email.contains(".")) {
                        assertTrue(isValid, "Email devrait être valide: " + email);
                    } else {
                        assertFalse(isValid, "Email devrait être invalide: " + email);
                    }
                }
            ));
    }
    
    @TestFactory
    @DisplayName("Tests mathématiques dynamiques")
    Stream<DynamicNode> dynamicMathTests() {
        return Stream.of(
            DynamicContainer.dynamicContainer("Addition",
                Stream.of(
                    DynamicTest.dynamicTest("2 + 2 = 4", 
                        () -> assertEquals(4, 2 + 2)),
                    DynamicTest.dynamicTest("5 + 3 = 8",
                        () -> assertEquals(8, 5 + 3))
                )
            ),
            DynamicContainer.dynamicContainer("Multiplication",
                Stream.of(
                    DynamicTest.dynamicTest("2 * 3 = 6",
                        () -> assertEquals(6, 2 * 3)),
                    DynamicTest.dynamicTest("4 * 5 = 20",
                        () -> assertEquals(20, 4 * 5))
                )
            )
        );
    }
    
    @TestFactory
    @DisplayName("Tests basés sur des données externes")
    Collection<DynamicTest> testsFromExternalData() {
        // Simulation de données externes (API, base de données, fichier)
        List<TestCase> testCases = loadTestCasesFromExternal();
        
        return testCases.stream()
            .map(testCase -> DynamicTest.dynamicTest(
                "Test: " + testCase.getName(),
                () -> {
                    Object result = processTestCase(testCase);
                    assertEquals(testCase.getExpected(), result);
                }
            ))
            .collect(Collectors.toList());
    }
    
    private List<TestCase> loadTestCasesFromExternal() {
        // Simulation du chargement de données
        return List.of(
            new TestCase("case1", "input1", "expected1"),
            new TestCase("case2", "input2", "expected2")
        );
    }
    
    private Object processTestCase(TestCase testCase) {
        // Simulation du traitement
        return testCase.getExpected();
    }
}
```

## Tests imbriqués et organisation

### Structure hiérarchique avec @Nested

```java
@DisplayName("Service de commandes - Tests complets")
class OrderServiceTest {
    
    private OrderService orderService;
    private PaymentService paymentService;
    private InventoryService inventoryService;
    
    @BeforeEach
    void setUp() {
        paymentService = mock(PaymentService.class);
        inventoryService = mock(InventoryService.class);
        orderService = new OrderService(paymentService, inventoryService);
    }
    
    @Nested
    @DisplayName("Création de commande")
    class OrderCreation {
        
        @Test
        @DisplayName("Commande valide - succès")
        void should_create_order_successfully() {
            // Given
            CreateOrderRequest request = validOrderRequest();
            when(inventoryService.isAvailable(any())).thenReturn(true);
            when(paymentService.processPayment(any())).thenReturn(successfulPayment());
            
            // When
            OrderResult result = orderService.createOrder(request);
            
            // Then
            assertThat(result)
                .extracting("success", "orderId")
                .containsExactly(true, not(nullValue()));
        }
        
        @Nested
        @DisplayName("Validation des données")
        class DataValidation {
            
            @Test
            @DisplayName("Produit inexistant - échec")
            void should_fail_when_product_not_exists() {
                // Given
                CreateOrderRequest request = orderRequestWithInvalidProduct();
                
                // When & Then
                assertThrows(ProductNotFoundException.class,
                    () -> orderService.createOrder(request));
            }
            
            @Test
            @DisplayName("Quantité négative - échec")
            void should_fail_when_negative_quantity() {
                // Given
                CreateOrderRequest request = orderRequestWithNegativeQuantity();
                
                // When & Then
                assertThrows(InvalidQuantityException.class,
                    () -> orderService.createOrder(request));
            }
        }
        
        @Nested
        @DisplayName("Gestion des stocks")
        class InventoryManagement {
            
            @Test
            @DisplayName("Stock insuffisant - échec")
            void should_fail_when_insufficient_stock() {
                // Given
                CreateOrderRequest request = validOrderRequest();
                when(inventoryService.isAvailable(any())).thenReturn(false);
                
                // When & Then
                InsufficientStockException exception = assertThrows(
                    InsufficientStockException.class,
                    () -> orderService.createOrder(request)
                );
                
                assertThat(exception.getMessage())
                    .contains("Stock insuffisant");
            }
        }
        
        @Nested
        @DisplayName("Traitement des paiements")
        class PaymentProcessing {
            
            @Test
            @DisplayName("Paiement échoué - rollback")
            void should_rollback_when_payment_fails() {
                // Given
                CreateOrderRequest request = validOrderRequest();
                when(inventoryService.isAvailable(any())).thenReturn(true);
                when(paymentService.processPayment(any()))
                    .thenThrow(new PaymentFailedException("Carte refusée"));
                
                // When & Then
                assertThrows(PaymentFailedException.class,
                    () -> orderService.createOrder(request));
                
                verify(inventoryService).releaseReservation(any());
            }
        }
    }
    
    @Nested
    @DisplayName("Annulation de commande")
    class OrderCancellation {
        
        @Test
        @DisplayName("Annulation dans les délais - succès")
        void should_cancel_order_within_time_limit() {
            // Test d'annulation
        }
        
        @Test
        @DisplayName("Annulation hors délai - échec")
        void should_fail_to_cancel_order_after_time_limit() {
            // Test d'annulation tardive
        }
    }
}
```

## Extensions et personnalisation

### Extensions personnalisées

```java
// Extension pour mesurer les performances
public class PerformanceExtension implements BeforeEachCallback, AfterEachCallback {
    
    private long startTime;
    
    @Override
    public void beforeEach(ExtensionContext context) {
        startTime = System.currentTimeMillis();
    }
    
    @Override
    public void afterEach(ExtensionContext context) {
        long duration = System.currentTimeMillis() - startTime;
        System.out.printf("Test %s executé en %d ms%n", 
            context.getDisplayName(), duration);
        
        // Assertion sur la performance
        if (duration > 1000) {
            System.err.println("⚠️  Test lent détecté: " + duration + "ms");
        }
    }
}

// Extension pour injection de dépendances
public class DatabaseExtension implements BeforeAllCallback, AfterAllCallback, 
                                         ParameterResolver {
    
    private static DatabaseConnection connection;
    
    @Override
    public void beforeAll(ExtensionContext context) throws Exception {
        connection = new DatabaseConnection("jdbc:h2:mem:test");
        connection.createSchema();
    }
    
    @Override
    public void afterAll(ExtensionContext context) throws Exception {
        connection.close();
    }
    
    @Override
    public boolean supportsParameter(ParameterContext parameterContext, 
                                   ExtensionContext extensionContext) {
        return parameterContext.getParameter().getType() == DatabaseConnection.class;
    }
    
    @Override
    public Object resolveParameter(ParameterContext parameterContext, 
                                 ExtensionContext extensionContext) {
        return connection;
    }
}

// Utilisation des extensions
@ExtendWith({PerformanceExtension.class, DatabaseExtension.class})
class ServiceIntegrationTest {
    
    @Test
    @DisplayName("Test avec injection de base de données")
    void should_save_user_to_database(DatabaseConnection db) {
        // La connection est injectée automatiquement
        UserRepository repository = new UserRepository(db);
        User user = new User("John", "john@example.com");
        
        repository.save(user);
        
        Optional<User> found = repository.findByEmail("john@example.com");
        assertThat(found).isPresent();
    }
}
```

### Annotations composées

```java
// Annotation personnalisée combinant plusieurs annotations
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Test
@ExtendWith(PerformanceExtension.class)
@Tag("integration")
@DisplayName("Test d'intégration")
public @interface IntegrationTest {
    String value() default "";
}

// Annotation pour tests de repository
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@ExtendWith(DatabaseExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("database")
public @interface RepositoryTest {
}

// Utilisation
@RepositoryTest
class UserRepositoryTest {
    
    @IntegrationTest("Sauvegarde utilisateur")
    void should_save_user() {
        // Test avec annotations composées
    }
}
```

## Mocking avec Mockito 5

### Mocks avancés et annotations

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private EmailService emailService;
    
    @Spy
    private UserValidator userValidator = new UserValidator();
    
    @InjectMocks
    private UserService userService;
    
    @Captor
    private ArgumentCaptor<User> userCaptor;
    
    @Test
    @DisplayName("Création utilisateur avec vérification des interactions")
    void should_create_user_and_send_welcome_email() {
        // Given
        CreateUserRequest request = new CreateUserRequest("John", "john@example.com");
        User savedUser = new User(1L, "John", "john@example.com");
        
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        // When
        UserResult result = userService.createUser(request);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        
        // Vérification des interactions
        verify(userRepository).save(userCaptor.capture());
        verify(emailService).sendWelcomeEmail(savedUser);
        verify(userValidator).validate(any());
        
        // Vérification des arguments capturés
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser)
            .extracting("name", "email")
            .containsExactly("John", "john@example.com");
    }
    
    @Test
    @DisplayName("Gestion des exceptions avec mocks")
    void should_handle_repository_exception() {
        // Given
        CreateUserRequest request = new CreateUserRequest("John", "john@example.com");
        when(userRepository.save(any())).thenThrow(new DatabaseException("Connection failed"));
        
        // When & Then
        DatabaseException exception = assertThrows(
            DatabaseException.class,
            () -> userService.createUser(request)
        );
        
        assertThat(exception.getMessage()).contains("Connection failed");
        verify(emailService, never()).sendWelcomeEmail(any());
    }
    
    @Test
    @DisplayName("Stubbing conditionnel")
    void should_handle_conditional_stubbing() {
        // Given
        User existingUser = new User(1L, "John", "john@example.com");
        User newUser = new User(2L, "Jane", "jane@example.com");
        
        when(userRepository.findByEmail("john@example.com"))
            .thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane@example.com"))
            .thenReturn(Optional.empty());
        
        // When & Then
        assertThat(userService.userExists("john@example.com")).isTrue();
        assertThat(userService.userExists("jane@example.com")).isFalse();
    }
    
    @Test
    @DisplayName("Mock avec réponses multiples")
    void should_handle_multiple_invocations() {
        // Given - Première tentative échoue, deuxième réussit
        when(emailService.sendEmail(anyString(), anyString()))
            .thenThrow(new EmailException("Server unavailable"))
            .thenReturn(true);
        
        // When
        boolean result = userService.sendEmailWithRetry("test@example.com", "Subject");
        
        // Then
        assertThat(result).isTrue();
        verify(emailService, times(2)).sendEmail(anyString(), anyString());
    }
}
```

### Mocks statiques et finaux

```java
class StaticMockTest {
    
    @Test
    @DisplayName("Mock de méthodes statiques")
    void should_mock_static_methods() {
        try (MockedStatic<LocalDateTime> mockedDateTime = mockStatic(LocalDateTime.class)) {
            // Given
            LocalDateTime fixedTime = LocalDateTime.of(2025, 1, 1, 12, 0);
            mockedDateTime.when(LocalDateTime::now).thenReturn(fixedTime);
            
            // When
            String timestamp = TimeService.getCurrentTimestamp();
            
            // Then
            assertThat(timestamp).isEqualTo("2025-01-01T12:00:00");
            mockedDateTime.verify(LocalDateTime::now);
        }
    }
    
    @Test
    @DisplayName("Mock de classes final")
    void should_mock_final_classes() {
        // Mockito 5 supporte les classes final et méthodes final
        String finalString = mock(String.class);
        when(finalString.length()).thenReturn(10);
        
        assertThat(finalString.length()).isEqualTo(10);
    }
}
```

## Tests d'intégration avec Testcontainers

### Configuration Testcontainers

```java
@Testcontainers
class DatabaseIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-test-data.sql");
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);
    
    private DataSource dataSource;
    private JedisPool jedisPool;
    
    @BeforeAll
    static void setupContainers() {
        // Les conteneurs sont démarrés automatiquement
        assertThat(postgres.isRunning()).isTrue();
        assertThat(redis.isRunning()).isTrue();
    }
    
    @BeforeEach
    void setupDataSources() {
        // Configuration DataSource
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(postgres.getJdbcUrl());
        config.setUsername(postgres.getUsername());
        config.setPassword(postgres.getPassword());
        dataSource = new HikariDataSource(config);
        
        // Configuration Redis
        jedisPool = new JedisPool(
            redis.getHost(), 
            redis.getMappedPort(6379)
        );
    }
    
    @Test
    @DisplayName("Test d'intégration complet avec base de données")
    void should_perform_complete_integration_test() {
        // Given
        UserRepository repository = new UserRepository(dataSource);
        CacheService cacheService = new CacheService(jedisPool);
        UserService userService = new UserService(repository, cacheService);
        
        // When
        User user = new User("John", "john@example.com");
        Long userId = userService.createUser(user);
        
        // Then
        Optional<User> foundUser = userService.findById(userId);
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getName()).isEqualTo("John");
        
        // Vérification cache
        try (Jedis jedis = jedisPool.getResource()) {
            String cachedUser = jedis.get("user:" + userId);
            assertThat(cachedUser).isNotNull();
        }
    }
    
    @Test
    @DisplayName("Test de migration de base de données")
    void should_run_database_migrations() {
        // Test avec Flyway
        Flyway flyway = Flyway.configure()
            .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
            .locations("classpath:db/migration")
            .load();
        
        MigrateResult result = flyway.migrate();
        
        assertThat(result.migrationsExecuted).isGreaterThan(0);
        assertThat(result.success).isTrue();
    }
}
```

### Tests avec Docker Compose

```java
@Testcontainers
class FullStackIntegrationTest {
    
    @Container
    static ComposeContainer environment = new ComposeContainer(
            new File("src/test/resources/docker-compose-test.yml"))
            .withExposedService("postgres", 5432)
            .withExposedService("redis", 6379)
            .withExposedService("app", 8080);
    
    @Test
    @DisplayName("Test de stack complète")
    void should_test_full_application_stack() {
        String appHost = environment.getServiceHost("app", 8080);
        Integer appPort = environment.getServicePort("app", 8080);
        
        // Test API REST
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://" + appHost + ":" + appPort + "/api/users";
        
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            new CreateUserRequest("John", "john@example.com"),
            String.class
        );
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

## Configuration Spring Boot Testing

### Tests de couches avec Spring Boot

```java
// Test de couche Web
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    @DisplayName("Création utilisateur via API REST")
    void should_create_user_via_rest_api() throws Exception {
        // Given
        CreateUserRequest request = new CreateUserRequest("John", "john@example.com");
        UserResponse response = new UserResponse(1L, "John", "john@example.com");
        
        when(userService.createUser(any())).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("John"))
            .andExpect(jsonPath("$.email").value("john@example.com"));
        
        verify(userService).createUser(any());
    }
}

// Test de couche Service
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {UserService.class})
class UserServiceSpringTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    @DisplayName("Test service avec contexte Spring")
    void should_work_with_spring_context() {
        // Test avec injection Spring
    }
}

// Test JPA Repository
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    @DisplayName("Test custom query repository")
    void should_find_users_by_email_domain() {
        // Given
        User user1 = new User("John", "john@company.com");
        User user2 = new User("Jane", "jane@company.com");
        User user3 = new User("Bob", "bob@other.com");
        
        entityManager.persistAndFlush(user1);
        entityManager.persistAndFlush(user2);
        entityManager.persistAndFlush(user3);
        
        // When
        List<User> companyUsers = userRepository.findByEmailDomain("company.com");
        
        // Then
        assertThat(companyUsers)
            .hasSize(2)
            .extracting("name")
            .containsExactlyInAnyOrder("John", "Jane");
    }
}
```

## Métriques et reporting

### Configuration reporting avancé

```xml
<!-- Maven Surefire avec reporting détaillé -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.3</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>
        <properties>
            <configurationParameters>
                junit.jupiter.execution.parallel.enabled=true
                junit.jupiter.execution.parallel.mode.default=concurrent
                junit.jupiter.execution.parallel.config.strategy=dynamic
                junit.jupiter.displayname.generator.default=org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
            </configurationParameters>
        </properties>
        <systemPropertyVariables>
            <junit.jupiter.extensions.autodetection.enabled>true</junit.jupiter.extensions.autodetection.enabled>
        </systemPropertyVariables>
    </configuration>
</plugin>

<!-- Plugin de couverture de code -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>CLASS</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### Métriques personnalisées

```java
// Extension pour collecter des métriques de test
public class TestMetricsExtension implements TestWatcher, BeforeEachCallback, AfterEachCallback {
    
    private static final Map<String, TestMetrics> metrics = new ConcurrentHashMap<>();
    private long startTime;
    
    @Override
    public void beforeEach(ExtensionContext context) {
        startTime = System.nanoTime();
    }
    
    @Override
    public void afterEach(ExtensionContext context) {
        long duration = System.nanoTime() - startTime;
        String testName = context.getDisplayName();
        
        metrics.computeIfAbsent(testName, k -> new TestMetrics())
            .addExecution(duration);
    }
    
    @Override
    public void testSuccessful(ExtensionContext context) {
        metrics.get(context.getDisplayName()).incrementSuccess();
    }
    
    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        metrics.get(context.getDisplayName()).incrementFailure();
    }
    
    @AfterAll
    static void generateReport() {
        System.out.println("\n=== MÉTRIQUES DE TESTS ===");
        metrics.forEach((testName, metric) -> {
            System.out.printf("Test: %s%n", testName);
            System.out.printf("  Durée moyenne: %.2f ms%n", metric.getAverageDuration() / 1_000_000.0);
            System.out.printf("  Taux de succès: %.2f%%%n", metric.getSuccessRate() * 100);
        });
    }
}
```

## Bonnes pratiques et patterns

### Règles d'or des tests JUnit 5

```java
class BonnesPratiquesTest {
    
    // ✅ ARRANGE-ACT-ASSERT pattern
    @Test
    @DisplayName("Pattern AAA - lisibilité maximale")
    void should_follow_arrange_act_assert_pattern() {
        // ARRANGE - Préparation des données
        String input = "Hello World";
        StringProcessor processor = new StringProcessor();
        
        // ACT - Exécution de l'action à tester
        String result = processor.process(input);
        
        // ASSERT - Vérification du résultat
        assertThat(result).isEqualTo("HELLO WORLD");
    }
    
    // ✅ Test names descriptifs
    @Test
    @DisplayName("Service de commande - échec quand stock insuffisant")
    void orderService_should_fail_when_insufficient_stock() {
        // Nom explicite sur le comportement attendu
    }
    
    // ✅ Un seul concept par test
    @Test
    @DisplayName("Validation email - format valide accepté")
    void emailValidation_should_accept_valid_format() {
        // Test focalisé sur un seul aspect
        assertTrue(EmailValidator.isValid("test@example.com"));
    }
    
    @Test
    @DisplayName("Validation email - format invalide rejeté")
    void emailValidation_should_reject_invalid_format() {
        // Test séparé pour l'aspect inverse
        assertFalse(EmailValidator.isValid("invalid-email"));
    }
    
    // ✅ Test data builders pour la lisibilité
    @Test
    @DisplayName("Création commande avec builder pattern")
    void should_create_order_with_builder() {
        // Given
        Order order = OrderTestDataBuilder.anOrder()
            .withCustomer("John Doe")
            .withProduct("Laptop", 1)
            .withShippingAddress("123 Main St")
            .build();
        
        // When & Then
        assertThat(order.getTotal()).isPositive();
    }
    
    // ✅ Assertions spécifiques et expressives
    @Test
    @DisplayName("Assertions expressives avec AssertJ")
    void should_use_expressive_assertions() {
        List<User> users = userService.findActiveUsers();
        
        // Plus expressif qu'un simple assertTrue
        assertThat(users)
            .isNotEmpty()
            .allSatisfy(user -> {
                assertThat(user.isActive()).isTrue();
                assertThat(user.getLastLogin()).isAfter(LocalDateTime.now().minusDays(30));
            });
    }
    
    // ✅ Gestion propre des exceptions
    @Test
    @DisplayName("Exception avec message détaillé")
    void should_verify_exception_details() {
        InvalidUserException exception = assertThrows(
            InvalidUserException.class,
            () -> userService.createUser(invalidUserRequest())
        );
        
        assertThat(exception)
            .hasMessage("Email is required")
            .hasCauseInstanceOf(ValidationException.class);
    }
}

// Builder pour les données de test
class OrderTestDataBuilder {
    private String customer = "Default Customer";
    private List<OrderItem> items = new ArrayList<>();
    private String shippingAddress = "Default Address";
    
    public static OrderTestDataBuilder anOrder() {
        return new OrderTestDataBuilder();
    }
    
    public OrderTestDataBuilder withCustomer(String customer) {
        this.customer = customer;
        return this;
    }
    
    public OrderTestDataBuilder withProduct(String product, int quantity) {
        this.items.add(new OrderItem(product, quantity));
        return this;
    }
    
    public OrderTestDataBuilder withShippingAddress(String address) {
        this.shippingAddress = address;
        return this;
    }
    
    public Order build() {
        return new Order(customer, items, shippingAddress);
    }
}
```

## Configuration avancée et optimisation

### Configuration performance

```properties
# junit-platform.properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=0.8

# Timeout global
junit.jupiter.execution.timeout.default=PT30S
junit.jupiter.execution.timeout.testable.method.default=PT10S

# Configuration mémoire
junit.jupiter.cleanup.mode=BEFORE_METHOD
junit.jupiter.displayname.generator.default=org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
```

### Script d'exécution optimisé

**run-tests.sh**
```bash
#!/bin/bash

echo "🧪 Exécution des tests JUnit 5 optimisée"

# Variables d'environnement
export MAVEN_OPTS="-Xmx4g -XX:+UseG1GC"
export JAVA_TOOL_OPTIONS="-Djava.awt.headless=true"

# Tests par catégorie
echo "📋 Tests unitaires..."
mvn test -Dgroups="unit"

echo "🔗 Tests d'intégration..."
mvn test -Dgroups="integration" -DforkCount=2

echo "📊 Génération du rapport de couverture..."
mvn jacoco:report

echo "✅ Tests terminés - Rapport disponible dans target/site/jacoco/"
```

## Ressources et documentation

### Documentation officielle
- [JUnit 5 User Guide](https://docs.junit.org/current/user-guide/) - Guide complet officiel
- [JUnit 5 API Documentation](https://junit.org/junit5/docs/current/api/) - Documentation API
- [JUnit 5 Release Notes](https://junit.org/junit5/docs/current/release-notes/) - Nouveautés

### Outils et intégrations
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html) - Documentation Mockito
- [AssertJ Documentation](https://assertj.github.io/doc/) - Assertions fluides
- [Testcontainers](https://www.testcontainers.org/) - Tests d'intégration avec containers

### Vidéos et formations
- [JUnit 5 Complete Guide](https://www.youtube.com/watch?v=flpmSXVTqBI) - Formation complète
- [Modern Testing with JUnit 5](https://www.youtube.com/watch?v=MisLk1U_5p8) - Techniques modernes

## Conclusion

JUnit 5 transforme l'écriture de tests Java avec :

**Fonctionnalités clés adoptées :**
- **Annotations expressives** : `@DisplayName`, `@ParameterizedTest`, `@Nested`
- **Assertions modernes** : AssertJ, timeouts, groupées
- **Extensions flexibles** : Injection, lifecycle, conditions
- **Tests dynamiques** : Génération à l'exécution
- **Exécution parallèle** : Performance optimisée

**Bonnes pratiques essentielles :**
- Pattern AAA (Arrange-Act-Assert)
- Noms de tests descriptifs
- Un concept par test
- Test data builders
- Mocking intelligent avec Mockito 5

**Résultats obtenus :**
- Tests plus lisibles et maintenables
- Couverture de code améliorée
- Feedback rapide avec exécution parallèle
- Intégration fluide avec Spring Boot et Testcontainers

JUnit 5 est indispensable pour un développement Java moderne et de qualité en 2025.
