---
title: "Kubernetes : Orchestration de conteneurs en production"
date: 2025-08-18
author: Andrea Larboullet Marin
category: devops
tags: ["kubernetes", "orchestration", "containers", "production", "devops", "architecture"]
description: "Guide de référence pour Kubernetes, couvrant l'orchestration de conteneurs en production avec exemples pratiques et analyses architecturales"
---

# Kubernetes : Orchestration de conteneurs en production

Comment orchestrer efficacement des milliers de conteneurs sans perdre la raison ? Cette question hante les équipes d'infrastructure depuis l'explosion des microservices. En 2025, Kubernetes s'impose comme la réponse incontournable, mais sa complexité apparente décourage encore de nombreux architectes.

Cette complexité n'est pourtant qu'apparente. Kubernetes révèle sa logique profonde dès que l'on comprend ses concepts fondamentaux et leurs implications architecturales. Loin d'être un simple « Docker à grande échelle », c'est un système distribué sophistiqué qui repense intégralement la gestion d'applications en production.

## Qu'est-ce que Kubernetes ?

### Le problème que résout Kubernetes

Avant Kubernetes, déployer une application conteneurisée en production relevait du parcours du combattant. Imaginez devoir gérer manuellement :

- Le placement de 50 conteneurs sur 10 serveurs différents
- Le redémarrage automatique des conteneurs qui crashent
- La mise à jour d'une application sans interruption de service
- L'équilibrage de charge entre les instances
- La gestion des secrets et configurations
- La surveillance de la santé de chaque composant

Chaque équipe développait ses propres scripts, créant des solutions fragiles et non réutilisables. Kubernetes standardise et automatise ces opérations complexes.

### Les concepts de base à retenir

Avant de plonger dans les détails, établissons le vocabulaire essentiel :

**Cluster** : Un ensemble de machines (nœuds) qui forment votre infrastructure Kubernetes. Pensez-y comme à votre "datacenter virtuel".

**Pod** : L'unité de déploiement la plus petite. Un pod contient un ou plusieurs conteneurs qui partagent le réseau et le stockage. Dans 95% des cas, un pod = un conteneur.

**Node** : Une machine physique ou virtuelle dans votre cluster. Chaque nœud peut héberger plusieurs pods.

**Service** : Un point d'accès stable pour vos pods. Même si les pods apparaissent et disparaissent, le service reste accessible à la même adresse.

**Deployment** : Décrit comment vous voulez que votre application soit déployée (combien d'instances, quelle image, etc.).

```yaml
# Exemple simple : déployer 3 instances de nginx
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mon-site-web
spec:
  replicas: 3  # Je veux 3 instances
  selector:
    matchLabels:
      app: mon-site
  template:
    metadata:
      labels:
        app: mon-site
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
```

Cet exemple dit simplement : "Je veux 3 copies de nginx qui tournent en permanence". Kubernetes se charge du reste.

### La différence avec Docker

Docker et Kubernetes sont complémentaires, pas concurrents :

- **Docker** : Crée et exécute des conteneurs sur une seule machine
- **Kubernetes** : Orchestre des conteneurs sur plusieurs machines

Si Docker est comme conduire une voiture, Kubernetes est comme gérer une flotte de transport en commun.

## Installation et configuration

### Installation sur Windows

#### Option 1 : Docker Desktop (Recommandée pour débuter)

```powershell
# 1. Télécharger Docker Desktop depuis docker.com
# 2. Installer avec les options par défaut
# 3. Activer Kubernetes dans les paramètres Docker Desktop

# Vérifier l'installation
kubectl version --client
kubectl cluster-info
```

#### Option 2 : WSL2 + kind

```powershell
# Installer WSL2 et Ubuntu
wsl --install

# Dans WSL2, installer kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Créer un cluster
kind create cluster --name mon-cluster

# Installer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### Installation sur macOS

#### Option 1 : Docker Desktop

```bash
# 1. Installer Docker Desktop depuis docker.com
# 2. Activer Kubernetes dans les préférences

# Vérifier
kubectl version --client
```

#### Option 2 : Homebrew + kind

```bash
# Installer les outils
brew install kind kubectl

# Créer un cluster local
kind create cluster --name dev-cluster

# Vérifier
kubectl get nodes
```

#### Option 3 : minikube

```bash
# Installer minikube
brew install minikube

# Démarrer un cluster
minikube start --driver=docker

# Ouvrir le dashboard
minikube dashboard
```

### Installation sur Linux

#### Ubuntu/Debian

```bash
# Installer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Installer kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Créer un cluster
kind create cluster --config=cluster.yaml
```

#### Configuration cluster kind avancée

```yaml
# cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: dev-cluster
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
```

#### Arch Linux / Manjaro

```bash
# Installer via pacman
sudo pacman -S kubectl kind

# Ou via AUR pour la dernière version
yay -S kubectl-bin kind-bin

# Créer un cluster
kind create cluster
```

### Vérification de l'installation

```bash
# Vérifier kubectl
kubectl version --client

# Vérifier la connexion au cluster
kubectl cluster-info

# Lister les nœuds
kubectl get nodes

# Lister les pods système
kubectl get pods -n kube-system
```

### Configuration de base

#### Configurer l'autocomplétion

```bash
# Bash
echo 'source <(kubectl completion bash)' >>~/.bashrc

# Zsh
echo 'source <(kubectl completion zsh)' >>~/.zshrc

# Fish
kubectl completion fish | source
```

#### Alias utiles

```bash
# Ajouter à votre .bashrc/.zshrc
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get services'
alias kgd='kubectl get deployments'
alias kdp='kubectl describe pod'
alias kl='kubectl logs'
```

## Les fondements conceptuels de Kubernetes

### L'état déclaratif : le cœur de Kubernetes

Le principe fondamental de Kubernetes tient en une phrase : **vous déclarez ce que vous voulez, Kubernetes se charge de l'obtenir et le maintenir**.

Prenons un exemple concret. Avec les scripts traditionnels, vous écririez :

```bash
# Approche impérative (traditionnelle)
docker run -d --name web1 nginx:1.25
docker run -d --name web2 nginx:1.25
docker run -d --name web3 nginx:1.25
# Si web1 crash, vous devez le détecter et le relancer manuellement
```

Avec Kubernetes, vous déclarez simplement :

```yaml
# Approche déclarative (Kubernetes)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3  # "Je veux toujours 3 instances"
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
```

Kubernetes surveille continuellement cet état. Si un conteneur crash, il le relance automatiquement. Si un nœud tombe, il redémarre les conteneurs ailleurs. Cette auto-réparation transforme votre infrastructure en système résilient.

Imaginez un thermostat intelligent : vous réglez la température souhaitée (état désiré), et il ajuste automatiquement le chauffage pour maintenir cette température (état actuel). C'est exactement le fonctionnement de Kubernetes.

### La magie des ressources (resources)

Chaque "chose" dans Kubernetes est une ressource : Pods, Services, Deployments, etc. Ces ressources sont décrites en YAML et stockées dans la base de données du cluster.

```yaml
# Un Deployment plus détaillé
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: app
        image: nginx:1.25
        ports:
        - containerPort: 80
        resources:
          requests:     # "J'ai besoin d'au minimum..."
            memory: "64Mi"
            cpu: "250m"
          limits:       # "Je ne dois jamais dépasser..."
            memory: "128Mi"
            cpu: "500m"
```

Les `requests` garantissent des ressources minimales, les `limits` empêchent qu'une application monopolise la machine. Kubernetes utilise ces informations pour placer intelligemment vos applications sur les nœuds disponibles.

### Comment Kubernetes maintient l'état désiré

Derrière cette "magie" se cache un mécanisme simple mais puissant : **les controllers**. Un controller surveille un type de ressource et s'assure que la réalité correspond à ce que vous avez déclaré.

Voici le cycle de base :

1. **Observer** : "Combien de pods nginx ai-je actuellement ?"
2. **Comparer** : "J'en ai 2, mais je devrais en avoir 3"
3. **Agir** : "Je lance un pod supplémentaire"
4. **Attendre** et recommencer

```bash
# Vous pouvez voir ce processus en action
kubectl get pods
# web-app-abc123  Running
# web-app-def456  Running
# web-app-ghi789  Running

# Simulez un crash
kubectl delete pod web-app-abc123

# Quelques secondes plus tard...
kubectl get pods
# web-app-def456  Running
# web-app-ghi789  Running
# web-app-xyz999  Running  <- Nouveau pod créé automatiquement
```

Chaque type de ressource a son controller dédié : le Deployment Controller gère les Deployments, le Service Controller gère les Services, etc. Cette architecture modulaire explique pourquoi Kubernetes est si extensible.

### Labels : le système nerveux de Kubernetes

Kubernetes utilise un système d'**étiquettes** (labels) pour connecter les ressources entre elles. C'est comme un système de tags qui permet de créer des relations dynamiques.

```yaml
# Un pod avec des labels
apiVersion: v1
kind: Pod
metadata:
  name: mon-pod
  labels:
    app: web-app      # "Je suis une instance de web-app"
    version: v1       # "Je suis la version 1"
    tier: frontend    # "Je suis du frontend"
spec:
  containers:
  - name: nginx
    image: nginx:1.25
```

Maintenant, un Service peut "trouver" ce pod grâce à ses labels :

```yaml
# Service qui route le trafic vers les pods web-app
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web-app    # "Envoie le trafic vers tous les pods avec app=web-app"
  ports:
  - port: 80
    targetPort: 80
```

Le Service ne "connaît" pas les pods spécifiques. Il se contente de chercher tous les pods qui ont le label `app: web-app`. Si vous ajoutez des pods avec ce label, ils reçoivent automatiquement du trafic. Si vous les supprimez, le trafic s'arrête.

Cette flexibilité permet des déploiements sophistiqués :

```bash
# Déployer une version canary (5% du trafic)
kubectl scale deployment web-app-v1 --replicas=19  # 95% v1
kubectl scale deployment web-app-v2 --replicas=1   # 5% v2
# Les deux versions ont le label app=web-app, donc reçoivent du trafic
```

### Votre premier déploiement

Maintenant que vous comprenez les concepts de base, voyons un exemple complet qui déploie une application web simple :

```yaml
# deployment.yaml - Décrit votre application
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
      - name: app
        image: nginx:1.25
        ports:
        - containerPort: 80

---
# service.yaml - Expose votre application
apiVersion: v1
kind: Service
metadata:
  name: hello-world-service
spec:
  selector:
    app: hello-world
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer  # Accessible depuis l'extérieur
```

Pour déployer cette application :

```bash
# Appliquer la configuration
kubectl apply -f deployment.yaml

# Vérifier que tout fonctionne
kubectl get deployments
kubectl get pods
kubectl get services

# Obtenir l'URL de votre application
kubectl get service hello-world-service
```

En quelques commandes, vous avez déployé une application résiliente avec équilibrage de charge automatique.

## Architecture et composants du cluster

Maintenant que vous savez ce que fait Kubernetes, découvrons **comment** il fonctionne. Un cluster Kubernetes se compose de deux types de machines :

- **Control Plane** (le cerveau) : Prend les décisions, stocke l'état du cluster
- **Worker Nodes** (les muscles) : Exécutent vos applications

```
┌─────────────────────────────────────────┐
│              CONTROL PLANE              │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐ │
│  │API      │ │Scheduler│ │Controller   │ │
│  │Server   │ │         │ │Manager      │ │
│  └─────────┘ └─────────┘ └─────────────┘ │
│         ┌─────────┐                      │
│         │  etcd   │                      │
│         └─────────┘                      │
└─────────────────────────────────────────┘
           │        │        │
           ▼        ▼        ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Worker 1 │ │ Worker 2 │ │ Worker 3 │
  │          │ │          │ │          │
  │ Pod Pod  │ │ Pod Pod  │ │ Pod Pod  │
  │ Pod Pod  │ │ Pod      │ │ Pod      │
  └──────────┘ └──────────┘ └──────────┘
```

### Le control plane : cerveau du cluster

Le control plane contient quatre composants essentiels qui travaillent ensemble :

#### 1. API Server : la porte d'entrée

L'API Server est le seul point d'accès au cluster. **Tout** passe par lui :

```bash
# Toutes ces commandes parlent à l'API Server
kubectl get pods        # "Montre-moi les pods"
kubectl apply -f app.yaml  # "Crée cette application"
kubectl delete pod mon-pod # "Supprime ce pod"
```

Quand vous faites `kubectl apply`, voici ce qui se passe :

1. kubectl envoie votre YAML à l'API Server
2. L'API Server vérifie que vous avez les permissions
3. Il valide que votre YAML est correct
4. Il sauvegarde l'état désiré dans etcd
5. Il répond "OK, c'est enregistré"

L'API Server ne fait jamais le travail lui-même, il ne fait qu'enregistrer vos souhaits.

#### 2. etcd : la mémoire du cluster

etcd est une base de données qui stocke **tout** l'état de votre cluster. Chaque pod, service, secret existe dans etcd.

```bash
# Structure simplifiée d'etcd
/registry/pods/default/mon-pod → {"spec": ..., "status": ...}
/registry/services/default/mon-service → {"spec": ..., "status": ...}
/registry/deployments/default/mon-app → {"spec": ..., "status": ...}
```

Si etcd disparaît, **tout votre cluster disparaît**. C'est pourquoi en production, etcd tourne toujours en cluster répliqué (3 ou 5 instances minimum).

Pensez à etcd comme au disque dur de Kubernetes : sans lui, rien ne fonctionne.

#### 3. Scheduler : l'organisateur intelligent

Quand un nouveau pod doit être créé, le Scheduler décide **où** le placer. Il évalue chaque nœud disponible :

```bash
# Le Scheduler réfléchit comme ça :
# "J'ai un pod nginx qui a besoin de 512Mi RAM et 0.5 CPU"
# "Nœud 1 : 2Gi RAM libre, 1 CPU libre ✓"
# "Nœud 2 : 256Mi RAM libre ✗ (pas assez)"
# "Nœud 3 : 4Gi RAM libre, 2 CPU libres ✓"
# "Je choisis le nœud 1 (moins de gaspillage)"
```

Le Scheduler prend en compte :
- Les ressources disponibles (CPU, mémoire)
- Les contraintes que vous avez définies
- L'équilibrage de charge entre nœuds
- Les affinités/anti-affinités

```yaml
# Exemple : forcer un pod sur des nœuds SSD
apiVersion: v1
kind: Pod
spec:
  nodeSelector:
    disktype: ssd  # "Place-moi uniquement sur un nœud avec disktype=ssd"
  containers:
  - name: app
    image: nginx
```

#### 4. Controller Manager : les superviseurs

Le Controller Manager contient des dizaines de "superviseurs" (controllers) qui surveillent chacun un type de ressource :

- **Deployment Controller** : "Est-ce que j'ai le bon nombre de pods qui tournent ?"
- **Service Controller** : "Est-ce que mes services sont correctement configurés ?"
- **Node Controller** : "Est-ce que tous mes nœuds sont en bonne santé ?"

Exemple concret avec le Deployment Controller :

```yaml
# Vous demandez 3 répliques
spec:
  replicas: 3
```

Le Deployment Controller surveille en permanence :
- "J'ai actuellement 3 pods ? ✓"
- "Un pod a crashé ? Je dois en relancer un !"
- "L'utilisateur veut 5 répliques maintenant ? Je crée 2 pods supplémentaires"

Chaque controller suit la même logique :
1. Observer l'état actuel
2. Comparer avec l'état désiré
3. Corriger si nécessaire
4. Recommencer

### Les nœuds workers : là où ça se passe

Les worker nodes sont les machines qui exécutent réellement vos applications. Chaque worker contient trois composants principaux :

#### 1. kubelet : l'agent local

Le kubelet est "l'ouvrier" sur chaque nœud. Il :

1. **Écoute** l'API Server : "Quels pods dois-je faire tourner ?"
2. **Lance** les conteneurs via Docker/containerd
3. **Surveille** la santé des pods
4. **Rapporte** l'état au control plane

```bash
# Le kubelet fait ça en permanence :
# "API Server, comment vont mes pods ?"
# "Pod web-app-123 : Running ✓"
# "Pod web-app-456 : Crashed ✗ - je le relance"
# "Pod database-789 : Running ✓"
```

Quand vous faites `kubectl get pods`, vous voyez les rapports du kubelet de chaque nœud.

#### 2. kube-proxy : le routeur de trafic

kube-proxy gère le réseau des Services. Quand vous créez un Service, kube-proxy configure automatiquement les règles réseau pour router le trafic.

```yaml
# Vous créez un Service
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web-app
  ports:
  - port: 80
```

kube-proxy traduit ça en :
- "Trafic vers web-service:80 → répartir entre les pods web-app"
- "Pod 1 : 192.168.1.10:80"
- "Pod 2 : 192.168.1.11:80"
- "Pod 3 : 192.168.1.12:80"

Il maintient ces règles automatiquement quand des pods apparaissent/disparaissent.

#### 3. Container Runtime : l'exécuteur

Le container runtime (Docker, containerd, CRI-O) est ce qui lance réellement vos conteneurs. C'est l'équivalent du moteur dans une voiture.

```bash
# Le kubelet dit au container runtime :
# "Lance un conteneur nginx:1.25 avec 512Mi de RAM"
# Le runtime répond :
# "OK, conteneur créé avec l'ID abc123"
```

### Comment tout ça communique

Voici le flux typique quand vous deployez une application :

```bash
1. kubectl apply -f app.yaml
   └→ API Server: "Sauvegarde ce Deployment"
       └→ etcd: "Deployment sauvegardé"

2. Controller Manager: "Un nouveau Deployment ! Je crée des pods"
   └→ API Server: "Crée 3 pods pour ce Deployment"
       └→ etcd: "3 pods en attente de placement"

3. Scheduler: "3 pods à placer ! Je les assigne aux nœuds"
   └→ API Server: "Pod 1 va sur nœud-A, Pod 2 sur nœud-B..."
       └→ etcd: "Placements sauvegardés"

4. kubelet (sur chaque nœud): "J'ai un nouveau pod ! Je le lance"
   └→ Container Runtime: "Lance nginx:1.25"
       └→ API Server: "Pod démarré avec succès"
```

Tout passe par l'API Server, qui centralise la sécurité et l'audit.

## Votre premier cluster en pratique

Avant d'approfondir, voyons comment interagir avec un cluster Kubernetes au quotidien.

### kubectl : votre outil principal

```bash
# Les commandes essentielles
kubectl get pods              # Lister les pods
kubectl get services          # Lister les services
kubectl get deployments       # Lister les deployments

kubectl describe pod mon-pod  # Détails d'un pod
kubectl logs mon-pod          # Logs d'un pod
kubectl exec -it mon-pod -- bash  # Se connecter à un pod

kubectl apply -f fichier.yaml # Déployer une configuration
kubectl delete -f fichier.yaml # Supprimer une configuration
```

### Les namespaces : organiser vos ressources

Les namespaces séparent vos ressources en "espaces de noms" :

```bash
# Créer un namespace pour la production
kubectl create namespace production

# Déployer dans ce namespace
kubectl apply -f app.yaml -n production

# Lister les pods du namespace production
kubectl get pods -n production

# Voir tous les namespaces
kubectl get namespaces
```

```yaml
# Spécifier le namespace dans le YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production  # Déploie dans le namespace production
spec:
  # ...
```

Les namespaces permettent d'isoler les environnements (dev, staging, prod) sur le même cluster.

## Déploiement et gestion des applications

### Stratégies de déploiement en production

Le déploiement d'applications sur Kubernetes transcende le simple lancement de conteneurs. Il s'agit de concevoir des stratégies résilientes qui minimisent les risques métier tout en maximisant la vélocité des équipes.

#### Rolling Updates : mise à jour progressive

La stratégie par défaut des Deployments orchestre les mises à jour en remplaçant progressivement les anciens pods par les nouveaux. Cette approche équilibre disponibilité et sécurité.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # 25% de pods supplémentaires maximum
      maxUnavailable: 25%  # 25% de pods indisponibles maximum
  template:
    spec:
      containers:
      - name: app
        image: myapp:v2
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
```

La readinessProbe joue un rôle crucial : elle garantit qu'un pod ne reçoit du trafic qu'une fois complètement initialisé. Sans cette probe, des requêtes pourraient atteindre des pods non prêts, causant des erreurs utilisateur.

Le processus de rolling update suit une chorégraphie précise :

1. Création d'un nouveau ReplicaSet avec l'image v2
2. Démarrage du premier pod v2
3. Attente que sa readinessProbe réussisse
4. Ajout du pod au Service (il commence à recevoir du trafic)
5. Suppression d'un pod v1
6. Répétition jusqu'au remplacement complet

Cette orchestration assure une transition transparente pour les utilisateurs finaux.

#### Blue-Green : basculement instantané

Le déploiement blue-green maintient deux environnements identiques et bascule instantanément entre eux. Kubernetes facilite cette stratégie grâce aux labels et sélecteurs.

```yaml
# Version "blue" actuellement en production
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
      version: blue
  template:
    metadata:
      labels:
        app: web-app
        version: blue
    spec:
      containers:
      - name: app
        image: myapp:v1

---
# Service pointant vers la version "blue"
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web-app
    version: blue  # Trafic vers blue
  ports:
  - port: 80
```

Pour déployer la version "green" :

```bash
# 1. Déployer la version green en parallèle
kubectl apply -f web-app-green-deployment.yaml

# 2. Valider que green fonctionne correctement
kubectl port-forward deployment/web-app-green 8080:80
# Tests sur localhost:8080

# 3. Basculer instantanément le trafic
kubectl patch service web-service -p '
{
  "spec": {
    "selector": {
      "app": "web-app",
      "version": "green"
    }
  }
}'
```

Le basculement est instantané et atomique. En cas de problème, le rollback consiste simplement à remettre le sélecteur sur "blue".

#### Canary : validation progressive

Le déploiement canary expose une nouvelle version à un sous-ensemble d'utilisateurs avant le déploiement complet. Cette stratégie détecte les régressions avec un impact limité.

```yaml
# 90% du trafic vers la version stable
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: web-app
      track: stable

---
# 10% du trafic vers la version canary
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-app
      track: canary
  template:
    metadata:
      labels:
        app: web-app
        track: canary
    spec:
      containers:
      - name: app
        image: myapp:v2  # Nouvelle version

---
# Service qui équilibre entre stable et canary
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web-app  # Sélectionne stable ET canary
  ports:
  - port: 80
```

Le ratio 9:1 des répliques détermine la répartition du trafic. Si les métriques du canary sont satisfaisantes, vous augmentez progressivement sa proportion jusqu'au remplacement complet de la version stable.

### Gestion des configurations et secrets

#### ConfigMaps : externaliser la configuration

Les ConfigMaps découplent la configuration du code applicatif, permettant de modifier le comportement d'une application sans rebuild de l'image.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database.properties: |
    host=db.example.com
    port=5432
    dbname=production
    pool_size=20
    timeout=30s
  log-level: "INFO"
  feature-flags.json: |
    {
      "new-ui": true,
      "beta-feature": false,
      "metrics-enabled": true
    }
```

Les pods consomment ces configurations via des volumes ou variables d'environnement :

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: log-level
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
      volumes:
      - name: config-volume
        configMap:
          name: app-config
```

Modifier une ConfigMap déclenche automatiquement la mise à jour des fichiers montés dans les pods (avec un délai de quelques secondes). Les variables d'environnement, en revanche, nécessitent un redémarrage des pods.

#### Secrets : protéger les données sensibles

Les Secrets gèrent les informations sensibles avec des précautions supplémentaires : chiffrement au repos dans etcd, transmission sécurisée, et montage en mémoire (tmpfs) dans les pods.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: cG9zdGdyZXM=      # postgres (base64)
  password: c2VjcmV0UGFzcw==  # secretPass (base64)

---
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTi...
  tls.key: LS0tLS1CRUdJTi...
```

Les pods accèdent aux secrets de manière sécurisée :

```yaml
spec:
  containers:
  - name: app
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: password
    volumeMounts:
    - name: tls-certs
      mountPath: /etc/ssl/certs
      readOnly: true
  volumes:
  - name: tls-certs
    secret:
      secretName: tls-secret
```

En production, intégrez Kubernetes avec un gestionnaire de secrets externe (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) via des operators dédiés :

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: vault-secret
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
  - secretKey: password
    remoteRef:
      key: secret/data/database
      property: password
```

### Mise à l'échelle et haute disponibilité

#### Horizontal Pod Autoscaler (HPA) : adaptation dynamique

L'HPA ajuste automatiquement le nombre de répliques selon les métriques observées. Cette capacité d'adaptation transforme les applications statiques en services élastiques.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 100
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
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

Cette configuration maintient la charge CPU autour de 70% et la mémoire sous 80%. Les paramètres de `behavior` évitent les oscillations : montée rapide (doublement possible), descente prudente (réduction de 10% maximum par minute).

Pour des métriques business personnalisées :

```yaml
metrics:
- type: Object
  object:
    metric:
      name: requests-per-second
    target:
      type: Value
      value: "1000"
    describedObject:
      apiVersion: v1
      kind: Service
      name: web-service
```

#### Pod Disruption Budget : résilience planifiée

Les Pod Disruption Budgets (PDB) protègent contre les interruptions volontaires (maintenance, mises à jour de nœuds) en garantissant un nombre minimum de pods disponibles.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-app-pdb
spec:
  minAvailable: 2        # Minimum 2 pods toujours disponibles
  # ou maxUnavailable: 1  # Maximum 1 pod indisponible
  selector:
    matchLabels:
      app: web-app
```

Quand un administrateur draine un nœud (`kubectl drain node-1`), Kubernetes respecte le PDB : il ne supprime les pods que si le budget n'est pas violé.

#### Affinité et anti-affinité : placement intelligent

L'affinité contrôle finement le placement des pods pour optimiser les performances ou la résilience.

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      affinity:
        # Anti-affinité : répartir les pods sur différents nœuds
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values: ["web-app"]
            topologyKey: kubernetes.io/hostname
        # Affinité de nœud : préférer les nœuds SSD
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: disktype
                operator: In
                values: ["ssd"]
```

Cette configuration empêche la colocation de pods identiques (résilience) tout en privilégiant les nœuds performants.

## Observabilité et debugging

### Monitoring et métriques

L'observabilité dans Kubernetes requiert une approche multicouche : métriques système, métriques applicatives, traces distribuées, et logs structurés. Cette visibilité complète transforme un cluster opaque en système diagnosticable.

#### Metrics Server et métriques de base

Metrics Server collecte les métriques de ressources (CPU, mémoire) directement depuis les kubelets. Ces métriques alimentent `kubectl top` et l'HPA.

```bash
# Installation de Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Consultation des métriques
kubectl top nodes
kubectl top pods --all-namespaces
kubectl top pods --sort-by=cpu
kubectl top pods --sort-by=memory
```

#### Prometheus : métriques avancées

Prometheus s'intègre naturellement avec Kubernetes via la découverte automatique des services et pods. L'architecture suit le pattern pull : Prometheus scrape les endpoints exposés par les applications.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web-app-metrics
spec:
  selector:
    matchLabels:
      app: web-app
  endpoints:
  - port: metrics      # Port exposant /metrics
    interval: 30s
    path: /metrics
    honorLabels: true
```

Les applications exposent leurs métriques métier :

```python
# Exemple Python avec prometheus_client
from prometheus_client import Counter, Histogram, generate_latest
from flask import Flask, Response

app = Flask(__name__)

# Métriques métier
REQUESTS_TOTAL = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request latency')

@app.route('/metrics')
def metrics():
    return Response(generate_latest(), mimetype='text/plain')

@app.route('/api/users')
def get_users():
    with REQUEST_DURATION.time():
        REQUESTS_TOTAL.labels(method='GET', endpoint='/api/users').inc()
        # Logique applicative
        return {'users': []}
```

Ces métriques permettent des alertes métier précises :

```yaml
# Règle d'alerte Prometheus
groups:
- name: web-app.rules
  rules:
  - alert: HighErrorRate
    expr: |
      (
        sum(rate(http_requests_total{job="web-app",code=~"5.."}[5m]))
        /
        sum(rate(http_requests_total{job="web-app"}[5m]))
      ) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} for 5 minutes"
```

### Logging centralisé

#### Architecture de logging

Kubernetes génère des logs à plusieurs niveaux : conteneurs, pods, nœuds, et composants du control plane. La centralisation de ces logs nécessite une architecture distribuée robuste.

```yaml
# DaemonSet Fluent Bit pour la collecte
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
spec:
  selector:
    matchLabels:
      name: fluent-bit
  template:
    spec:
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:2.2
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

Configuration Fluent Bit pour l'enrichissement automatique :

```ini
[INPUT]
    Name              tail
    Tag               kube.*
    Path              /var/log/containers/*.log
    Parser            cri
    DB                /var/log/flb_kube.db
    Mem_Buf_Limit     50MB
    Skip_Long_Lines   On
    Refresh_Interval  10

[FILTER]
    Name                kubernetes
    Match               kube.*
    Kube_URL            https://kubernetes.default.svc:443
    Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
    Kube_Tag_Prefix     kube.var.log.containers.
    Merge_Log           On
    K8S-Logging.Parser  On
    K8S-Logging.Exclude Off
    Annotations         Off
```

Cette configuration enrichit automatiquement chaque log avec les métadonnées Kubernetes (namespace, pod, labels, annotations), facilitant le filtrage et la recherche.

#### Logs structurés

Les applications modernes émettent des logs structurés (JSON) pour faciliter l'analyse :

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'funcName': record.funcName,
            'thread_id': record.thread,
            'trace_id': getattr(record, 'trace_id', None),
            'user_id': getattr(record, 'user_id', None)
        })

# Configuration
logger = logging.getLogger('web-app')
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# Usage avec contexte
logger.info("User action", extra={'user_id': '12345', 'action': 'login'})
```

### Tracing distribué

Dans une architecture microservices, une requête traverse multiples services. Le tracing distribué reconstitue ces chemins d'exécution complexes.

#### OpenTelemetry : standard d'instrumentation

OpenTelemetry unifie la collecte de traces, métriques, et logs :

```python
# Instrumentation automatique Flask
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# Configuration du tracer
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Export vers Jaeger
jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger-agent",
    agent_port=6831,
)
span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Instrumentation automatique
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

# Spans personnalisés
@app.route('/api/orders')
def create_order():
    with tracer.start_as_current_span("create_order") as span:
        span.set_attribute("order.type", "premium")

        # Appel service externe avec propagation automatique du contexte
        response = requests.post('http://payment-service/charge')

        span.set_attribute("payment.status", response.status_code)
        return {'order_id': '12345'}
```

#### Déploiement Jaeger sur Kubernetes

```yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: jaeger
spec:
  strategy: production
  storage:
    type: elasticsearch
    elasticsearch:
      nodeCount: 3
      storage:
        storageClassName: fast-ssd
        size: 100Gi
      redundancyPolicy: SingleRedundancy
  collector:
    replicas: 3
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"
```

### Techniques de debugging

#### Debugging des pods

Le debugging de pods nécessite une approche méthodique combinant observation des événements, analyse des logs, et inspection de l'état.

```bash
# Diagnostic complet d'un pod
kubectl describe pod my-pod
kubectl logs my-pod --previous    # Logs du conteneur précédent si crashé
kubectl logs my-pod -c init-container  # Logs d'un conteneur spécifique

# Inspection de l'état
kubectl get pod my-pod -o yaml
kubectl get events --field-selector involvedObject.name=my-pod

# Debug interactif
kubectl exec -it my-pod -- /bin/bash
kubectl port-forward my-pod 8080:80
```

Les événements Kubernetes révèlent souvent la cause racine des problèmes :

```bash
# Événements récents triés par timestamp
kubectl get events --sort-by=.metadata.creationTimestamp

# Événements d'avertissement uniquement
kubectl get events --field-selector type=Warning
```

#### Debug containers

Kubernetes 1.25+ introduit les containers éphémères pour le debugging de pods en production sans modification :

```bash
# Attacher un container de debug à un pod existant
kubectl debug my-pod -it --image=busybox --target=my-container

# Créer une copie du pod avec debugging tools
kubectl debug my-pod -it --image=ubuntu --share-processes --copy-to=my-pod-debug
```

#### Probes de santé

Les probes constituent la première ligne de défense contre les dysfonctionnements :

```yaml
spec:
  containers:
  - name: app
    livenessProbe:
      httpGet:
        path: /health/live
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 1
    startupProbe:
      httpGet:
        path: /health/startup
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 10
      failureThreshold: 30  # 5 minutes maximum
```

Chaque probe a un rôle spécifique :
- **startupProbe** : protège les applications à démarrage lent
- **livenessProbe** : redémarre les conteneurs bloqués
- **readinessProbe** : contrôle l'inclusion dans le Service

## Patterns avancés et bonnes pratiques

### Architecture microservices sur Kubernetes

Kubernetes excelle dans l'orchestration de microservices, mais cette capacité technique ne garantit pas automatiquement une architecture réussie. Les patterns suivants guident la conception d'systèmes distribués robustes.

#### Service Mesh : communication sécurisée

Un service mesh abstrait la complexité des communications inter-services. Istio, l'implémentation la plus mature, injecte des proxies sidecar qui interceptent tout le trafic réseau.

```yaml
# Activation d'Istio sur un namespace
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    istio-injection: enabled

---
# Configuration de trafic avec retry automatique
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service-dr
spec:
  host: user-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
    retryPolicy:
      attempts: 3
      perTryTimeout: 2s
      retryOn: 5xx,reset,connect-failure,refused-stream
```

Cette configuration implémente circuit breaking, retry avec backoff, et détection automatique des instances défaillantes. Le service mesh transforme des applications "best effort" en services résilients.

#### API Gateway : point d'entrée unifié

L'API Gateway centralise les préoccupations transversales : authentification, rate limiting, transformation de requêtes, routage intelligent.

```yaml
# Gateway Istio exposant l'API
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: api-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: api-tls-secret
    hosts:
    - api.example.com

---
# Routage avec authentification JWT
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-routes
spec:
  hosts:
  - api.example.com
  gateways:
  - api-gateway
  http:
  - match:
    - uri:
        prefix: /api/v1/users
    route:
    - destination:
        host: user-service
        port:
          number: 80
    headers:
      request:
        add:
          x-forwarded-proto: https
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s  # Chaos engineering
```

#### Event-Driven Architecture

Les microservices communiquent efficacement via des événements asynchrones. Apache Kafka s'intègre naturellement avec Kubernetes via l'opérateur Strimzi.

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: event-cluster
spec:
  kafka:
    replicas: 3
    listeners:
    - name: plain
      port: 9092
      type: internal
      tls: false
    - name: tls
      port: 9093
      type: internal
      tls: true
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      log.message.format.version: "3.0"
    storage:
      type: persistent-claim
      size: 100Gi
      class: fast-ssd
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 10Gi
      class: fast-ssd
```

Les applications publient et consomment des événements via des topics Kafka :

```python
# Publisher d'événements
from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=['event-cluster-kafka-bootstrap:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

@app.route('/api/orders', methods=['POST'])
def create_order():
    order = create_order_logic()

    # Publication événement
    event = {
        'event_type': 'order.created',
        'order_id': order['id'],
        'customer_id': order['customer_id'],
        'amount': order['total'],
        'timestamp': datetime.utcnow().isoformat()
    }

    producer.send('orders', value=event)
    return {'order_id': order['id']}
```

### Sécurité en production

#### RBAC : contrôle d'accès fin

Le Role-Based Access Control (RBAC) implémente le principe du moindre privilège. Chaque utilisateur et service account ne possède que les permissions strictement nécessaires.

```yaml
# ServiceAccount pour une application
apiVersion: v1
kind: ServiceAccount
metadata:
  name: web-app
  namespace: production

---
# Role avec permissions minimales
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: config-reader
  namespace: production
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
  resourceNames: ["web-app-*"]  # Restriction aux pods de l'app

---
# Liaison Role -> ServiceAccount
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: web-app-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: web-app
  namespace: production
roleRef:
  kind: Role
  name: config-reader
  apiGroup: rbac.authorization.k8s.io
```

#### Network Policies : microsegmentation

Les Network Policies implémentent une microsegmentation réseau, limitant les communications aux flux légitimes.

```yaml
# Politique par défaut : tout refuser
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}  # S'applique à tous les pods
  policyTypes:
  - Ingress
  - Egress

---
# Autoriser uniquement les flux nécessaires
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-system
    - podSelector:
        matchLabels:
          app: load-balancer
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []  # DNS
    ports:
    - protocol: UDP
      port: 53
```

#### Security Contexts et Pod Security Standards

Les Security Contexts définissent les privilèges d'exécution des conteneurs. Kubernetes 1.25+ remplace Pod Security Policies par Pod Security Standards.

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      # Security context au niveau du pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
      - name: app
        # Security context au niveau du conteneur
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
            add:
            - NET_BIND_SERVICE  # Uniquement si nécessaire
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: var-run
          mountPath: /var/run
      volumes:
      - name: tmp
        emptyDir: {}
      - name: var-run
        emptyDir: {}

---
# Namespace avec politique de sécurité restreinte
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Optimisation des ressources

#### Resource Quotas : gouvernance des ressources

Les Resource Quotas préviennent l'accaparement des ressources par une équipe ou application mal configurée.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    # Limites de calcul
    requests.cpu: "100"
    requests.memory: 200Gi
    limits.cpu: "200"
    limits.memory: 400Gi

    # Limites d'objets
    pods: "50"
    persistentvolumeclaims: "10"
    services: "10"
    secrets: "20"
    configmaps: "20"

    # Limites de stockage
    requests.storage: 1Ti
    persistentvolumeclaims.storage-class.gold.storage-class.kubernetes.io/requests.storage: 500Gi

---
# LimitRange pour valeurs par défaut
apiVersion: v1
kind: LimitRange
metadata:
  name: production-limits
  namespace: production
spec:
  limits:
  - default:      # Limites par défaut
      cpu: "500m"
      memory: "512Mi"
    defaultRequest: # Requests par défaut
      cpu: "100m"
      memory: "128Mi"
    type: Container
  - max:          # Limites maximales
      cpu: "2"
      memory: "4Gi"
    min:          # Limites minimales
      cpu: "50m"
      memory: "64Mi"
    type: Container
```

#### Vertical Pod Autoscaler : optimisation automatique

Le VPA analyse l'utilisation réelle et recommande (ou applique) des ajustements de ressources.

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  updatePolicy:
    updateMode: "Auto"    # "Off" pour recommandations seulement
  resourcePolicy:
    containerPolicies:
    - containerName: app
      minAllowed:
        cpu: 50m
        memory: 64Mi
      maxAllowed:
        cpu: 2
        memory: 4Gi
      controlledResources: ["cpu", "memory"]
      controlledValues: RequestsAndLimits
```

#### Node Affinity et Taints/Tolerations

Ces mécanismes optimisent le placement des workloads selon leurs besoins spécifiques.

```yaml
# Nœud dédié avec taint
apiVersion: v1
kind: Node
metadata:
  name: gpu-node-1
spec:
  taints:
  - key: "workload-type"
    value: "gpu-intensive"
    effect: "NoSchedule"
  - key: "hardware"
    value: "nvidia-v100"
    effect: "NoSchedule"

---
# Workload ML tolérant les taints GPU
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      tolerations:
      - key: "workload-type"
        operator: "Equal"
        value: "gpu-intensive"
        effect: "NoSchedule"
      - key: "hardware"
        operator: "Equal"
        value: "nvidia-v100"
        effect: "NoSchedule"
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: "accelerator"
                operator: In
                values: ["nvidia-tesla-v100"]
      containers:
      - name: ml-trainer
        resources:
          limits:
            nvidia.com/gpu: 1
```

## Évolution et tendances 2025

### Gateway API : l'avenir du routage

Gateway API remplace progressivement Ingress avec une approche plus flexible et orientée rôles. Cette évolution simplifie la gestion du trafic dans des environnements multi-tenants.

```yaml
# GatewayClass : définit le contrôleur
apiVersion: gateway.networking.k8s.io/v1beta1
kind: GatewayClass
metadata:
  name: istio
spec:
  controllerName: istio.io/gateway-controller
  description: "Istio-based gateway"

---
# Gateway : infrastructure réseau
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: production-gateway
  namespace: gateway-system
spec:
  gatewayClassName: istio
  listeners:
  - name: https
    hostname: "*.example.com"
    port: 443
    protocol: HTTPS
    tls:
      mode: Terminate
      certificateRefs:
      - name: example-com-tls
  - name: http
    port: 80
    protocol: HTTP

---
# HTTPRoute : routage applicatif
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: web-app-route
  namespace: production
spec:
  parentRefs:
  - name: production-gateway
    namespace: gateway-system
  hostnames:
  - "app.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /api/v1
    backendRefs:
    - name: api-service
      port: 80
      weight: 90
    - name: api-service-canary
      port: 80
      weight: 10  # Canary deployment
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: frontend-service
      port: 80
```

### WebAssembly (WASM) : extension native

WASM permet d'étendre Kubernetes avec du code performant et sécurisé, dépassant les limitations des scripts traditionnels.

```yaml
# Envoy Filter avec extension WASM
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: wasm-auth-filter
spec:
  configPatches:
  - applyTo: HTTP_FILTER
    match:
      context: SIDECAR_INBOUND
      listener:
        filterChain:
          filter:
            name: "envoy.filters.network.http_connection_manager"
    patch:
      operation: INSERT_BEFORE
      value:
        name: wasm-auth
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
          config:
            root_id: auth_filter
            vm_config:
              vm_id: auth_filter
              runtime: envoy.wasm.runtime.v8
              code:
                remote:
                  http_uri:
                    uri: https://storage.example.com/auth-filter.wasm
                    timeout: 10s
                  sha256: "a1b2c3d4e5f6..."
```

### eBPF : observabilité kernel-level

eBPF révolutionne l'observabilité en permettant l'exécution de code sécurisé directement dans le kernel Linux, offrant une visibilité sans précédent.

```yaml
# Cilium avec eBPF pour network policies
apiVersion: v1
kind: ConfigMap
metadata:
  name: cilium-config
  namespace: kube-system
data:
  enable-bpf-masquerade: "true"
  enable-host-reachable-services: "true"
  enable-local-redirect-policy: "true"
  hubble-enabled: "true"
  hubble-metrics: "dns,drop,tcp,flow,port-distribution,icmp,http"

---
# Tetragon pour runtime security
apiVersion: cilium.io/v1alpha1
kind: TracingPolicy
metadata:
  name: file-monitoring
spec:
  kprobes:
  - call: "security_file_open"
    syscall: false
    return: false
    args:
    - index: 0
      type: "file"
    selectors:
    - matchArgs:
      - index: 0
        operator: "Prefix"
        values:
        - "/etc/passwd"
        - "/etc/shadow"
    - matchActions:
      - action: Sigkill
```

### Multi-cluster et Edge Computing

Les déploiements multi-cluster deviennent la norme pour la résilience et la conformité réglementaire.

```yaml
# Cluster API pour gestion déclarative
apiVersion: cluster.x-k8s.io/v1beta1
kind: Cluster
metadata:
  name: edge-cluster-eu
  namespace: fleet-system
spec:
  clusterNetwork:
    pods:
      cidrBlocks: ["192.168.0.0/16"]
  infrastructureRef:
    apiVersion: infrastructure.cluster.x-k8s.io/v1beta1
    kind: AWSCluster
    name: edge-cluster-eu-infra
  controlPlaneRef:
    kind: KubeadmControlPlane
    apiVersion: controlplane.cluster.x-k8s.io/v1beta1
    name: edge-cluster-eu-control-plane

---
# Fleet management avec Flux
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: apps-production
  namespace: flux-system
spec:
  sourceRef:
    kind: GitRepository
    name: fleet-repo
  path: "./clusters/production"
  prune: true
  interval: 5m
  targetNamespace: production
  postBuild:
    substitute:
      cluster_name: "production-eu-west-1"
      environment: "production"
```

## Conclusion

Kubernetes en 2025 transcende son rôle initial d'orchestrateur de conteneurs pour devenir une plateforme d'infrastructure cloud-native complète. Sa maturité technique, démontrée par l'adoption massive en production, s'accompagne d'une évolution constante qui maintient sa pertinence face aux défis émergents.

L'écosystème Kubernetes révèle sa véritable puissance dans l'intégration harmonieuse de ses composants. L'état déclaratif, les controllers, le système d'étiquetage, et l'API extensible forment un ensemble cohérent qui transforme la complexité opérationnelle en simplicité conceptuelle. Cette cohérence architecturale explique pourquoi Kubernetes résiste aux effets de mode technologique : il résout des problèmes fondamentaux de l'informatique distribuée.

Les tendances 2025 confirment cette évolution vers une plateforme universelle. Gateway API standardise la gestion du trafic, WebAssembly démocratise l'extensibilité, eBPF révolutionne l'observabilité, et les déploiements multi-cluster généralisent la résilience géographique. Ces innovations ne remplacent pas les fondements de Kubernetes mais les enrichissent, préservant les investissements existants tout en ouvrant de nouvelles possibilités.

La maîtrise de Kubernetes nécessite donc une double approche : comprendre profondément ses concepts fondamentaux intemporels et rester informé de ses évolutions technologiques. Cette combinaison garantit la capacité à concevoir des architectures robustes aujourd'hui et adaptables demain.

L'orchestration de conteneurs n'est finalement que le point d'entrée vers une nouvelle façon de concevoir l'infrastructure logicielle. Kubernetes fournit les primitives ; c'est à nous de les composer intelligemment pour créer des systèmes à la fois performants, résilients, et maintenables. Dans cette perspective, chaque déploiement devient un acte architectural qui engage l'avenir de nos applications.

## Ressources

### Documentation officielle
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
- [kubectl Reference](https://kubernetes.io/docs/reference/kubectl/)
- [Gateway API Documentation](https://gateway-api.sigs.k8s.io/)

### Outils et projets essentiels
- [Helm - Package Manager](https://helm.sh/)
- [Istio - Service Mesh](https://istio.io/)
- [Prometheus - Monitoring](https://prometheus.io/)
- [Jaeger - Distributed Tracing](https://www.jaegertracing.io/)
- [Cilium - eBPF Networking](https://cilium.io/)

### Ressources d'apprentissage
- [Kubernetes Patterns (O'Reilly)](https://www.oreilly.com/library/view/kubernetes-patterns/9781492050285/)
- [The DevOps Handbook](https://itrevolution.com/the-devops-handbook/)
- [Building Microservices (Newman)](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)
- [CNCF Landscape](https://landscape.cncf.io/)

### Certifications
- [Certified Kubernetes Administrator (CKA)](https://www.cncf.io/certification/cka/)
- [Certified Kubernetes Application Developer (CKAD)](https://www.cncf.io/certification/ckad/)
- [Certified Kubernetes Security Specialist (CKS)](https://www.cncf.io/certification/cks/)
