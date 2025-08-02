---
title: "Les commentaires dans le code, toujours utiles ?"
date: 2025-08-02
tags: ["clean-code", "documentation", "best-practices", "productivity"]
author: mooki
excerpt: "Entre code auto-documenté et commentaires nécessaires, trouvons l'équilibre pragmatique"
cover: /images/les-commentaires-dans-le-code-toujours-utiles.jpg
category: reflexions
readingTime: 22
---

# Les commentaires dans le code, toujours utiles ?

J'ai récemment rejoint une équipe où le code ressemblait à un roman de Tolkien : chaque ligne était accompagnée d'un commentaire détaillé, expliquant ce que faisait `i++`. Trois mois plus tard, dans une autre mission, j'ai découvert l'extrême opposé : 10 000 lignes de code sans un seul commentaire, avec des noms de variables comme `x`, `temp` et mon préféré, `doTheThing()`. Entre ces deux extrêmes, où se situe la vérité ?

## Le pendule historique

L'histoire des commentaires dans le code ressemble à un pendule qui oscille entre deux extrêmes. Dans les années 90, documenter chaque ligne était la norme. Les manuels de programmation recommandaient des ratios commentaires/code de 1:1. Puis est arrivé l'Agile Manifesto avec son "Working software over comprehensive documentation", suivi du mouvement Clean Code qui prônait le code auto-documenté.

En 2025, nous avons enfin compris que la réalité est plus nuancée. Les dernières études montrent que 58% des développeurs considèrent le manque de contexte dans le code comme leur principale source de frustration lors des code reviews. Paradoxalement, 42% se plaignent aussi des commentaires obsolètes qui induisent en erreur.

[IMAGE: Graphique montrant l'évolution des pratiques de documentation du code de 1990 à 2025]

## Quand un commentaire vaut mille lignes

Contrairement au dogme du "code auto-documenté", certains commentaires sont irremplaçables. Voici les cas où ils apportent une vraie valeur :

### L'intention derrière les décisions complexes

```python
# On utilise une recherche linéaire au lieu d'un dict car :
# 1. La liste contient max 10 éléments (vérifié en prod sur 2 ans)
# 2. Les clés sont des objets mutables non hashables
# 3. Le profiling montre 0.3% de gain avec dict vs 15% de RAM en plus
def find_config_item(configs: list[Config], key: str) -> Config | None:
    for config in configs:
        if config.matches(key):
            return config
    return None
```

Ce commentaire explique le "pourquoi" d'une décision qui pourrait sembler sous-optimale au premier abord. Sans lui, un développeur bien intentionné pourrait "optimiser" ce code et introduire des problèmes de performance.

### Les workarounds et leurs raisons d'être

```javascript
// Safari 17.4+ a un bug avec les Intersection Observers dans les iframes
// Ticket: https://bugs.webkit.org/show_bug.cgi?id=123456
// Workaround: on utilise un polling avec requestAnimationFrame
// À retirer quand Safari 18 sera largement adopté (Q2 2026)
function observeElementInIframe(element) {
  if (isSafari() && getSafariVersion() >= 17.4) {
    return createPollingObserver(element);
  }
  return new IntersectionObserver(handleIntersection);
}
```

### Les algorithmes non triviaux

```java
/**
 * Implémentation de l'algorithme de Kadane pour trouver la sous-séquence
 * de somme maximale en O(n). Utilisé pour analyser les patterns de charge
 * sur nos serveurs et identifier les pics d'utilisation.
 * 
 * @see https://en.wikipedia.org/wiki/Maximum_subarray_problem
 */
public class LoadAnalyzer {
    public LoadPeriod findPeakUsage(List<ServerLoad> loads) {
        // L'algo maintient deux variables : max jusqu'ici et max global
        long maxSoFar = 0;
        long maxEndingHere = 0;
        int start = 0, end = 0, tempStart = 0;
        
        for (int i = 0; i < loads.size(); i++) {
            maxEndingHere += loads.get(i).getCpuUsage();
            
            if (maxSoFar < maxEndingHere) {
                maxSoFar = maxEndingHere;
                start = tempStart;
                end = i;
            }
            
            if (maxEndingHere < 0) {
                maxEndingHere = 0;
                tempStart = i + 1;
            }
        }
        
        return new LoadPeriod(start, end, maxSoFar);
    }
}
```

## Les anti-patterns qui nous hantent

Après avoir analysé des milliers de pull requests, voici les pires pratiques que je continue de voir en 2025 :

### Le capitaine Obvious

```python
# Incrémente i de 1
i += 1

# Retourne True si x est plus grand que y
def is_greater(x, y):
    return x > y
```

Ces commentaires n'apportent aucune valeur et polluent le code. Pire, ils créent une dette technique : si vous changez le code, vous devez aussi mettre à jour le commentaire.

### Le roman fleuve

```javascript
/**
 * Cette fonction a été créée le 12 mars 2019 par Jean-Michel
 * durant le sprint 42. À l'époque, nous utilisions MongoDB
 * mais nous sommes passés à PostgreSQL en 2021. Jean-Michel
 * a quitté l'entreprise en 2020 pour devenir apiculteur.
 * La fonction originale faisait 200 lignes mais a été refactorisée
 * par Sophie en 2022. Sophie est maintenant tech lead.
 * 
 * Mise à jour 2023 : Ajout du support multi-tenant
 * Mise à jour 2024 : Migration vers TypeScript
 * Mise à jour 2025 : Optimisation des performances
 * 
 * NOTE: Ne pas toucher sans l'accord de l'équipe Platform
 * NOTE2: Voir aussi le document Confluence (lien cassé)
 * NOTE3: Cette fonction est critique pour la facturation
 */
function calculateInvoice(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Le commentaire zombie

```java
// TODO: Implémenter la gestion d'erreur
// FIXME: Fuite mémoire possible ici
// HACK: Solution temporaire, à refactorer
public class UserService {
    // Code écrit en 2018, les TODOs sont toujours là en 2025
}
```

[IMAGE: Comic strip montrant un développeur découvrant un TODO de 2015 dans le code]

## L'approche pragmatique pour 2025

Après des années d'expérimentation, voici l'approche qui fonctionne vraiment :

### 1. Privilégier le code expressif

Au lieu de :
```python
def calc(x, y, z):
    # Calcule le prix avec taxe et remise
    return x * (1 + y) * (1 - z)
```

Préférer :
```python
def calculate_price_with_tax_and_discount(
    base_price: Decimal,
    tax_rate: Decimal,
    discount_rate: Decimal
) -> Decimal:
    price_with_tax = base_price * (1 + tax_rate)
    final_price = price_with_tax * (1 - discount_rate)
    return final_price
```

### 2. Documenter les contrats avec les outils modernes

Python avec les type hints et docstrings :
```python
from typing import Optional
from datetime import datetime

def schedule_deployment(
    service_name: str,
    target_env: str,
    scheduled_at: Optional[datetime] = None,
    *,
    force: bool = False
) -> DeploymentTicket:
    """
    Schedule a service deployment to the specified environment.
    
    Args:
        service_name: Name of the service to deploy
        target_env: Target environment (dev, staging, prod)
        scheduled_at: When to deploy. None means immediate.
        force: Skip validation checks (requires admin role)
    
    Returns:
        DeploymentTicket with status and tracking information
    
    Raises:
        ValidationError: If service or environment is invalid
        PermissionError: If force=True without admin role
        
    Example:
        >>> ticket = schedule_deployment("api-gateway", "prod")
        >>> print(ticket.status)  # "pending"
    """
```

JavaScript avec JSDoc et TypeScript :
```typescript
/**
 * Process payment with retry logic and fraud detection
 * @param {PaymentRequest} request - Payment details
 * @param {PaymentOptions} [options] - Optional configuration
 * @returns {Promise<PaymentResult>} Payment confirmation or rejection
 * @throws {PaymentError} When payment fails after all retries
 * @example
 * const result = await processPayment({
 *   amount: 99.99,
 *   currency: 'EUR',
 *   method: 'card'
 * });
 */
async function processPayment(
  request: PaymentRequest,
  options?: PaymentOptions
): Promise<PaymentResult> {
  const config = { ...defaultOptions, ...options };
  
  // Fraud detection first - fail fast principle
  if (await detectFraud(request)) {
    throw new PaymentError('Suspicious activity detected', 'FRAUD_SUSPECTED');
  }
  
  return retryWithBackoff(
    () => paymentGateway.charge(request),
    config.maxRetries
  );
}
```

### 3. Les commentaires stratégiques

Concentrez vos efforts de documentation sur :

**Les points d'entrée du système** : Les APIs publiques, les handlers principaux, les classes façade méritent une documentation complète.

**Les invariants métier** : 
```java
public class OrderStateMachine {
    /**
     * États possibles d'une commande. Transitions autorisées :
     * DRAFT -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
     *                    \-> CANCELLED
     * 
     * Une commande CANCELLED ou DELIVERED est finale.
     * Seules les commandes DRAFT peuvent être modifiées.
     */
    private OrderState currentState;
}
```

**Les optimisations non évidentes** :
```python
# Cette regex compilée est ~40% plus rapide que str.split() 
# pour nos logs Apache (benchmarké sur 1M de lignes)
LOG_PARSER = re.compile(r'(\S+) (\S+) (\S+) \[(.*?)\] "(.*?)" (\d+) (\d+)')
```

## Les outils qui changent la donne

L'écosystème 2025 offre des outils qui rendent la documentation plus facile et plus utile :

### Génération automatique intelligente

Les IDE modernes et les assistants IA peuvent maintenant générer des docstrings pertinentes :
- **GitHub Copilot** et **Amazon Q** analysent le contexte pour suggérer une documentation appropriée
- **Mintlify** génère automatiquement la documentation à partir du code
- Les linters comme **ESLint** avec `eslint-plugin-jsdoc` vérifient la cohérence

### Validation continue

```yaml
# .github/workflows/doc-check.yml
name: Documentation Quality
on: [pull_request]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check Python docstrings
        run: |
          pipx run pydocstyle --convention=google src/
          pipx run interrogate -vv src/
      
      - name: Check JSDoc coverage
        run: |
          npm run jsdoc -- --pedantic
          npm run documentation -- coverage src/
```

::: tip
Les équipes les plus performantes en 2025 automatisent la vérification de la documentation dans leur CI/CD, avec des seuils de couverture pour les fonctions publiques.
:::

## Le futur est déjà là

Les tendances émergentes montrent une évolution intéressante :

**Documentation augmentée** : Les IDE intègrent des LLMs qui expliquent le code en temps réel, rendant certains commentaires obsolètes.

**Commentaires interactifs** : Des outils comme Quokka.js permettent d'avoir des exemples exécutables directement dans les commentaires.

**Documentation as Code** : Les tests deviennent la documentation vivante :
```python
def test_payment_retry_behavior():
    """
    When payment gateway is temporarily unavailable,
    the system should retry 3 times with exponential backoff
    before marking the payment as failed.
    """
    # Le test EST la documentation
```

## Conclusion : L'équilibre pragmatique

Après toutes ces années, ma philosophie sur les commentaires tient en quelques principes :

1. **Le code dit "quoi", les commentaires disent "pourquoi"**
2. **Un bon nom vaut mieux qu'un commentaire**
3. **Documentez les décisions, pas les évidences**
4. **Les commentaires obsolètes sont pires que pas de commentaires**
5. **Les tests sont la meilleure documentation**

Le débat "commentaires vs code auto-documenté" est un faux dilemme. En 2025, nous avons les outils et la maturité pour adopter une approche équilibrée : écrire du code expressif ET ajouter des commentaires là où ils apportent une vraie valeur.

La prochaine fois qu'un collègue vous dit "le code devrait se documenter lui-même", rappelez-lui que même le code le plus clair ne peut pas expliquer les décisions business, les contraintes externes ou les raisons historiques. Et si quelqu'un insiste pour commenter chaque ligne, proposez-lui plutôt d'améliorer les noms et la structure.

[IMAGE: Développeur satisfait devant un code bien équilibré entre clarté et documentation utile]

## Ressources

- [JSDoc - Getting Started Guide](https://jsdoc.app/about-getting-started) - Documentation officielle JSDoc (2024)
- [PEP 257 - Docstring Conventions](https://peps.python.org/pep-0257/) - Conventions Python officielles
- [Google Java Style Guide - Javadoc](https://google.github.io/styleguide/javaguide.html#s7-javadoc) - Guide de style Google
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/) - Dustin Boswell & Trevor Foucher
- [Write Better Comments](https://stackoverflow.blog/2021/12/23/best-practices-for-writing-code-comments/) - Stack Overflow Blog (2024)
- [Modern Code Documentation Tools](https://github.com/documentationjs/documentation) - Liste d'outils modernes
- [Clean Code vs Comments Debate](https://softwareengineering.stackexchange.com/questions/1/comments-are-a-code-smell) - Discussion approfondie