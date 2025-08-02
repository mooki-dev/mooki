---
title: "Pipeline CI/CD moderne avec GitHub Actions"
date: 2025-08-02
tags: [github-actions, cicd, devops, automation, deployment, testing]
author: mooki
excerpt: "Créez des pipelines CI/CD modernes et robustes avec GitHub Actions : tests automatisés, déploiements multi-environnements, sécurité et monitoring"
category: infrastructure
---

# Pipeline CI/CD moderne avec GitHub Actions

<Badge type="tip" text="GitHub Actions 2025" />

GitHub Actions s'est imposé comme la solution de référence pour l'intégration et le déploiement continus en 2025. Cette plateforme native à GitHub offre une approche moderne et intégrée pour automatiser vos workflows de développement.

Ce guide présente les meilleures pratiques pour construire des pipelines robustes, sécurisés et performants.

## Avantages de GitHub Actions en 2025

::: info Adoption massive
- **78% des développeurs** utilisent GitHub Actions selon Stack Overflow Survey 2024
- **2x plus rapide** que Jenkins pour les projets de taille moyenne
- **Gratuit** jusqu'à 2000 minutes/mois pour les repositories publics
- **Plus de 20 millions de workflows** exécutés quotidiennement
:::

### Comparaison avec les solutions traditionnelles

| Aspect | Solutions traditionnelles | GitHub Actions |
|--------|--------------------------|----------------|
| Infrastructure | Serveurs CI à maintenir | Zero infrastructure |
| Configuration | Setup complexe | Prêt en quelques minutes |
| Plugins | Gestion manuelle | Marketplace intégré |
| Maintenance | Mises à jour manuelles | Maintenance automatique |

## Architecture d'un pipeline moderne

```mermaid
graph TD
    A[Push/PR] --> B[Tests]
    B --> C[Build]
    C --> D[Security Scan]
    D --> E[Deploy Staging]
    E --> F[Integration Tests]
    F --> G[Performance Tests]
    G --> H[Deploy Production]
    H --> I[Monitoring]
    
    style A fill:#e1f5fe
    style H fill:#c8e6c9
    style I fill:#fff3e0
```

::: tip Principe fondamental
Un pipeline moderne doit être **rapide**, **fiable** et **automatique**. Le feedback aux développeurs doit être fourni en moins de 10 minutes pour maintenir la productivité.
:::

## Workflow de base pour application Node.js

Voici un exemple de workflow complet pour une application Node.js moderne :

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:  # Permet le déclenchement manuel

jobs:
  # Phase de tests et qualité
  test:
    name: Tests & Quality
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20, 21]  # Test sur plusieurs versions LTS
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint code
      run: npm run lint
      
    - name: Run tests
      run: npm run test:coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v4
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        
  # Analyse de sécurité
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        
    - name: Run CodeQL analysis
      uses: github/codeql-action/init@v3
      with:
        languages: javascript
        
  # Build et déploiement
  deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: |
        docker build -t myapp:${{ github.sha }} .
        docker tag myapp:${{ github.sha }} myapp:latest
        
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
        
    - name: Push image
      run: |
        docker push myapp:${{ github.sha }}
        docker push myapp:latest
```

::: warning Gestion des secrets
Ne jamais inclure de mots de passe ou tokens en dur dans les workflows. Utilisez toujours `secrets.NOM_SECRET` et configurez les secrets dans les paramètres du repository.
:::

## Workflows multi-environnements

Pour une approche professionnelle, implémentons un pipeline avec gestion multi-environnements :

::: details Stratégie de déploiement recommandée
- **develop** → Tests + Déploiement staging automatique
- **main** → Tests + Déploiement production (avec approbation)
- **feature/** → Tests uniquement
:::

```yaml
# .github/workflows/deploy.yml
name: Multi-Environment Deploy

on:
  push:
    branches: [ main, develop ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Build unique pour tous les environnements
  build:
    name: Build Application
    runs-on: ubuntu-latest
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-name: ${{ steps.meta.outputs.tags }}
      
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix=sha-
          type=raw,value=latest,enable={{is_default_branch}}
          
    - name: Build and push
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Déploiement staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
    environment: 
      name: staging
      url: https://staging.myapp.com
      
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying ${{ needs.build.outputs.image-name }} to staging..."
        # Logique de déploiement (Kubernetes, Docker Swarm, etc.)
        
    - name: Run smoke tests
      run: |
        sleep 30  # Attendre que l'application démarre
        curl -f https://staging.myapp.com/health || exit 1
        echo "Staging deployment successful"
        
    - name: Run E2E tests
      uses: cypress-io/github-action@v6
      with:
        config: baseUrl=https://staging.myapp.com
        spec: cypress/e2e/smoke/**
        
  # Déploiement production (avec approbation)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production')
    environment: 
      name: production
      url: https://myapp.com
      
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying ${{ needs.build.outputs.image-name }} to production..."
        
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      if: always()
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        
    - name: Run production health check
      run: |
        for i in {1..10}; do
          if curl -f https://myapp.com/health; then
            echo "Production deployment successful"
            exit 0
          fi
          sleep 30
        done
        echo "Production health check failed"
        exit 1
```

## Stratégie de tests automatisés

::: tip Pyramide des tests moderne
```
    ▲ E2E Tests (peu, critiques)
   ▲▲ Integration Tests (modérés)
  ▲▲▲ Unit Tests (nombreux, rapides)
```
Les tests unitaires forment la base : ils sont rapides et nombreux. Les tests E2E sont moins nombreux mais testent les parcours critiques.
:::

### Workflow de tests parallélisés

```yaml
# .github/workflows/tests.yml
name: Test Suite

on:
  pull_request:
  push:
    branches: [ main, develop ]

jobs:
  # Tests unitaires (rapides)
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false  # Continue même si une version échoue
      matrix:
        node-version: [18, 20, 21]
        
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage --watchAll=false
      
    - name: Upload coverage
      if: matrix.node-version == '20'  # Éviter les doublons
      uses: codecov/codecov-action@v4

  # Tests d'intégration  
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - run: npm ci
    
    - name: Setup database
      run: npm run db:migrate
      env:
        DATABASE_URL: postgres://postgres:test@localhost:5432/testdb
        
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgres://postgres:test@localhost:5432/testdb
        REDIS_URL: redis://localhost:6379
        
  # Tests E2E (lents mais critiques)
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build app for testing
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30  # Attendre que tout démarre
        
    - name: Setup Playwright
      uses: microsoft/playwright-github-action@v1
      
    - name: Run E2E tests
      run: npx playwright test --config=playwright.config.ts
      
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7
```

## Sécurité du pipeline

La sécurité est un aspect critique des pipelines CI/CD modernes. Voici les contrôles essentiels à implémenter :

::: danger Check-list sécurité obligatoire
- [ ] Scan des vulnérabilités dans les dépendances
- [ ] Analyse statique du code (SAST)
- [ ] Scan des secrets dans le code
- [ ] Vérification des images Docker
- [ ] Tests de sécurité dynamiques (DAST)
:::

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
  schedule:
    - cron: '0 2 * * 1'  # Tous les lundis à 2h du matin

jobs:
  # Scan des secrets
  secret-scan:
    name: Secret Detection
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Historique complet pour truffleHog
        
    - name: TruffleHog OSS
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: main
        head: HEAD
        extra_args: --debug --only-verified

  # Analyse statique (SAST)
  sast:
    name: SAST Analysis
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript, typescript
        queries: security-extended,security-and-quality
        
    - name: Autobuild
      uses: github/codeql-action/autobuild@v3
      
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: "/language:javascript"

  # Scan des dépendances
  dependency-scan:
    name: Dependency Security
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high --fail-on=upgradable
        
    - name: Upload Snyk report
      uses: github/codeql-action/upload-sarif@v3
      if: always()
      with:
        sarif_file: snyk.sarif

  # Sécurité Docker
  docker-security:
    name: Docker Security
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build image for testing
      run: docker build -t security-test .
      
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'security-test'
        format: 'sarif'
        output: 'trivy-results.sarif'
        
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'
```

## Optimisation des performances

Un pipeline lent impact directement la productivité des équipes de développement. Voici les techniques d'optimisation essentielles :

::: tip Optimisations critiques
1. **Cache agressif** de tout ce qui peut l'être
2. **Parallélisation** maximum des jobs
3. **Skip intelligent** des étapes inutiles
4. **Build incrémental** quand possible
:::

```yaml
# .github/workflows/optimized.yml
name: Optimized Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:

# Variables globales pour éviter la répétition
env:
  NODE_VERSION: '20'
  CACHE_VERSION: v1  # Incrémente pour forcer un nouveau cache

jobs:
  # Job de détection des changements
  changes:
    name: Detect Changes
    runs-on: ubuntu-latest
    outputs:
      src: ${{ steps.changes.outputs.src }}
      docs: ${{ steps.changes.outputs.docs }}
      docker: ${{ steps.changes.outputs.docker }}
      
    steps:
    - uses: actions/checkout@v4
    
    - uses: dorny/paths-filter@v3
      id: changes
      with:
        filters: |
          src:
            - 'src/**'
            - 'package*.json'
            - 'tsconfig.json'
          docs:
            - 'docs/**'
            - '*.md'
          docker:
            - 'Dockerfile'
            - 'docker-compose*.yml'

  # Tests seulement si le code a changé
  test:
    name: Smart Tests
    runs-on: ubuntu-latest
    needs: changes
    if: needs.changes.outputs.src == 'true'
    
    steps:
    - uses: actions/checkout@v4
    
    # Cache multi-niveaux
    - name: Cache node_modules
      uses: actions/cache@v4
      with:
        path: node_modules
        key: ${{ env.CACHE_VERSION }}-node-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
        restore-keys: |
          ${{ env.CACHE_VERSION }}-node-${{ runner.os }}-
          
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        
    # Installation conditionnelle
    - name: Install dependencies
      if: steps.cache.outputs.cache-hit != 'true'
      run: npm ci --prefer-offline --no-audit
      
    # Tests avec cache des résultats
    - name: Cache test results
      uses: actions/cache@v4
      with:
        path: coverage
        key: test-results-${{ github.sha }}
        
    - name: Run tests with cache
      run: npm run test:coverage

  # Build optimisé avec layer caching
  build:
    name: Optimized Build
    runs-on: ubuntu-latest
    needs: [changes, test]
    if: needs.changes.outputs.src == 'true' || needs.changes.outputs.docker == 'true'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: Build with advanced caching
      uses: docker/build-push-action@v5
      with:
        context: .
        tags: myapp:latest
        cache-from: |
          type=gha,scope=build-cache
          type=registry,ref=myapp:buildcache
        cache-to: |
          type=gha,scope=build-cache,mode=max
          type=registry,ref=myapp:buildcache,mode=max
        build-args: |
          BUILDKIT_INLINE_CACHE=1
```

## Workflows réutilisables

::: tip Principe DRY pour les workflows
Ne pas répéter le même code ! GitHub Actions permet de créer des workflows réutilisables pour factoriser la logique commune.
:::

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
        description: 'Environment to deploy to'
      image-tag:
        required: true
        type: string
        description: 'Docker image tag to deploy'
      health-check-url:
        required: false
        type: string
        default: '/health'
        description: 'Health check endpoint'
    secrets:
      DEPLOY_TOKEN:
        required: true
      SLACK_WEBHOOK:
        required: false
    outputs:
      deployment-url:
        description: "URL of the deployed application"
        value: ${{ jobs.deploy.outputs.url }}

jobs:
  deploy:
    name: Deploy to ${{ inputs.environment }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    outputs:
      url: ${{ steps.deploy.outputs.url }}
      
    steps:
    - name: Deploy application
      id: deploy
      run: |
        echo "Deploying ${{ inputs.image-tag }} to ${{ inputs.environment }}"
        
        # Logique de déploiement
        DEPLOYMENT_URL="https://${{ inputs.environment }}.myapp.com"
        echo "url=${DEPLOYMENT_URL}" >> $GITHUB_OUTPUT
        
        # Simulation du déploiement
        sleep 10
        
    - name: Health check
      run: |
        echo "Checking health at ${{ steps.deploy.outputs.url }}${{ inputs.health-check-url }}"
        
        for i in {1..12}; do  # 2 minutes max
          if curl -f "${{ steps.deploy.outputs.url }}${{ inputs.health-check-url }}"; then
            echo "Deployment successful on ${{ inputs.environment }}"
            exit 0
          fi
          echo "Waiting for ${{ inputs.environment }} to be ready... ($i/12)"
          sleep 10
        done
        
        echo "Health check failed for ${{ inputs.environment }}"
        exit 1
        
    - name: Notify success
      if: success() && secrets.SLACK_WEBHOOK
      uses: 8398a7/action-slack@v3
      with:
        status: success
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        message: |
          Deployment successful on **${{ inputs.environment }}**
          Image: `${{ inputs.image-tag }}`
          URL: ${{ steps.deploy.outputs.url }}
```

## Monitoring et observabilité

```yaml
# .github/workflows/monitoring.yml
name: Pipeline Monitoring

on:
  workflow_run:
    workflows: ["CI/CD Pipeline", "Test Suite"]
    types: [completed]

jobs:
  # Collecte des métriques
  collect-metrics:
    name: Collect Metrics
    runs-on: ubuntu-latest
    
    steps:
    - name: Send metrics to DataDog
      uses: masci/datadog@v1
      with:
        api-key: ${{ secrets.DATADOG_API_KEY }}
        metrics: |
          - type: "count"
            name: "github.actions.workflow.runs"
            value: 1.0
            tags:
              - "workflow:${{ github.workflow }}"
              - "status:${{ github.event.workflow_run.conclusion }}"
              - "repository:${{ github.repository }}"
              
    - name: Custom metrics calculation
      run: |
        # Calcul du temps d'exécution
        DURATION=$(($(date +%s) - ${{ github.event.workflow_run.created_at }}))
        echo "duration=${DURATION}" >> $GITHUB_OUTPUT
        
        # Envoi à votre système de monitoring
        curl -X POST "https://your-monitoring-endpoint.com/metrics" \
          -H "Authorization: Bearer ${{ secrets.MONITORING_TOKEN }}" \
          -d '{
            "pipeline_duration": "'$DURATION'",
            "pipeline_status": "${{ github.event.workflow_run.conclusion }}",
            "repository": "${{ github.repository }}",
            "workflow": "${{ github.workflow }}",
            "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
          }'

  # Alerting intelligent  
  alert-on-failure:
    name: Smart Alerting
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'failure'
    
    steps:
    - name: Analyze failure pattern
      id: analyze
      run: |
        # Récupérer l'historique des échecs
        RECENT_FAILURES=$(gh api repos/${{ github.repository }}/actions/runs \
          --jq '[.workflow_runs[] | select(.conclusion == "failure") | select(.created_at > (now - 86400))] | length')
        
        echo "recent_failures=${RECENT_FAILURES}" >> $GITHUB_OUTPUT
        
        if [ "$RECENT_FAILURES" -gt 3 ]; then
          echo "critical=true" >> $GITHUB_OUTPUT
        else
          echo "critical=false" >> $GITHUB_OUTPUT
        fi
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Critical alert
      if: steps.analyze.outputs.critical == 'true'
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#critical-alerts'
        webhook_url: ${{ secrets.SLACK_WEBHOOK_CRITICAL }}
        title: "PIPELINE FAILURE PATTERN DETECTED"
        message: |
          **${{ steps.analyze.outputs.recent_failures }}** failures in the last 24h
          Workflow: ${{ github.event.workflow_run.html_url }}
          Immediate investigation required
```

## Déploiement sur plateformes cloud

### Vercel (applications frontend)

```yaml
# .github/workflows/deploy-vercel.yml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
    paths: ['frontend/**']

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Vercel CLI
      run: npm install --global vercel@latest
      
    - name: Pull Vercel Environment Information
      run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      working-directory: ./frontend
      
    - name: Build Project Artifacts
      run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      working-directory: ./frontend
      
    - name: Deploy Project Artifacts to Vercel
      id: deploy
      run: |
        URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
        echo "url=$URL" >> $GITHUB_OUTPUT
      working-directory: ./frontend
      
    - name: Comment on PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `**Preview deployed!**\n\n**URL:** ${{ steps.deploy.outputs.url }}\n\n[Visit preview](${{ steps.deploy.outputs.url }})`
          })
```

## Gestion des environnements et secrets

::: warning Sécurité des secrets
- Jamais de secrets en dur dans le code
- Rotation régulière des tokens
- Principe du moindre privilège
- Audit des accès régulier
:::

```yaml
# .github/workflows/env-management.yml
name: Environment Management

on:
  workflow_dispatch:
    inputs:
      action:
        description: 'Action to perform'
        required: true
        type: choice
        options:
          - deploy
          - rollback
          - scale
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      
jobs:
  manage-environment:
    name: Manage ${{ inputs.environment }}
    runs-on: ubuntu-latest
    environment: 
      name: ${{ inputs.environment }}
      url: ${{ steps.get-url.outputs.url }}
      
    steps:
    - name: Get environment URL
      id: get-url
      run: |
        case "${{ inputs.environment }}" in
          "development") echo "url=https://dev.myapp.com" >> $GITHUB_OUTPUT ;;
          "staging") echo "url=https://staging.myapp.com" >> $GITHUB_OUTPUT ;;
          "production") echo "url=https://myapp.com" >> $GITHUB_OUTPUT ;;
        esac
        
    - name: Execute action
      run: |
        echo "Executing ${{ inputs.action }} on ${{ inputs.environment }}"
        
        case "${{ inputs.action }}" in
          "deploy")
            echo "Deploying to ${{ inputs.environment }}"
            # Logique de déploiement
            ;;
          "rollback")
            echo "Rolling back ${{ inputs.environment }}"
            # Logique de rollback
            ;;
          "scale")
            echo "Scaling ${{ inputs.environment }}"
            # Logique de scaling
            ;;
        esac
```

## Debugging et troubleshooting

Techniques de debugging avancées pour résoudre les problèmes de pipeline :

::: tip Techniques de debugging
1. **Debug mode** avec `ACTIONS_STEP_DEBUG=true`
2. **Artifacts** pour sauvegarder les logs et outputs
3. **SSH dans le runner** pour investigation live
4. **Matrix debugging** pour isoler les problèmes
:::

```yaml
# .github/workflows/debug.yml
name: Debug Workflow

on:
  workflow_dispatch:
    inputs:
      enable_ssh:
        description: 'Enable SSH access for debugging'
        required: false
        default: false
        type: boolean
      debug_level:
        description: 'Debug level'
        required: false
        default: 'info'
        type: choice
        options:
          - info
          - debug
          - trace

env:
  ACTIONS_STEP_DEBUG: ${{ inputs.debug_level == 'debug' || inputs.debug_level == 'trace' }}
  ACTIONS_RUNNER_DEBUG: ${{ inputs.debug_level == 'trace' }}

jobs:
  debug-session:
    name: Debug Session
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Capture environment info
      run: |
        echo "System Information:"
        echo "=================="
        echo "OS: $(lsb_release -d | cut -f2)"
        echo "Kernel: $(uname -r)"
        echo "CPU: $(nproc) cores"
        echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
        echo "Disk: $(df -h / | tail -1 | awk '{print $4}') available"
        echo ""
        echo "Environment Variables:"
        echo "====================="
        env | grep -E '^(GITHUB_|RUNNER_|CI)' | sort
        
    - name: Debug dependencies
      run: |
        echo "Package versions:"
        echo "================"
        node --version || echo "Node.js not installed"
        npm --version || echo "npm not installed"
        docker --version || echo "Docker not installed"
        git --version
        
    - name: Save debug artifacts
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: debug-info-${{ github.run_id }}
        path: |
          /tmp/*.log
          ~/.npm/_logs/
        retention-days: 7
        
    - name: Setup SSH access
      if: inputs.enable_ssh
      uses: mxschmitt/action-tmate@v3
      with:
        limit-access-to-actor: true
        sudo: false
      timeout-minutes: 30
```

## Ressources et références

### Documentation officielle
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Guide officiel complet
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) - Référence de syntaxe
- [Actions Marketplace](https://github.com/marketplace?type=actions) - Actions communautaires
- [Security Hardening](https://docs.github.com/en/actions/security-guides) - Guides de sécurité

### Outils et extensions
- [GitHub CLI](https://cli.github.com/) - Interface en ligne de commande
- [Actions Toolkit](https://github.com/actions/toolkit) - SDK pour créer des actions
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions) - Support IDE

### Ressources communautaires
- [Awesome Actions](https://github.com/sdras/awesome-actions) - Collection d'actions
- [GitHub Actions Examples](https://github.com/actions/example-workflows) - Exemples officiels
- [Actions Runner Images](https://github.com/actions/runner-images) - Images des runners

## Conclusion

GitHub Actions révolutionne l'approche CI/CD en 2025 en offrant une plateforme intégrée, performante et sécurisée. Cette technologie permet de construire des pipelines modernes qui améliorent significativement la productivité des équipes de développement.

### Points clés retenus

::: info Récap de l'arsenal GitHub Actions
- **Pipeline de base** → Tests, build, déploiement automatisés
- **Multi-environnements** → Staging et production avec approbations
- **Sécurité intégrée** → SAST, DAST, scan de vulnérabilités
- **Optimisations** → Cache, parallélisation, détection des changements
- **Monitoring** → Métriques, alerting, observabilité
- **Réutilisabilité** → Workflows composables et maintenables
:::

### Prochaines étapes recommandées

1. **Commencer simple** → Implémenter un pipeline basique
2. **Mesurer** → Ajouter monitoring et métriques  
3. **Optimiser** → Cache et parallélisation
4. **Sécuriser** → Intégrer les scans de sécurité
5. **Scalabiliser** → Actions réutilisables et templates

### Bonnes pratiques finales

::: tip Commandements du pipeline moderne
1. **Rapidité** → Feedback en moins de 10 minutes
2. **Fiabilité** → Taux de succès supérieur à 95%
3. **Sécurité** → Zero secrets en dur, scans automatisés
4. **Observabilité** → Logs et métriques omniprésents
5. **Maintenabilité** → Code DRY et documentation claire
:::

GitHub Actions démocratise l'accès aux pipelines CI/CD de qualité professionnelle, permettant à toutes les équipes de bénéficier des meilleures pratiques DevOps sans infrastructure complexe à maintenir.