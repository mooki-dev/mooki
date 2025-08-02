---
title: "Orchestration Kubernetes pour débutants"
date: 2025-08-02
tags: [kubernetes, orchestration, containers, devops, microservices, k8s]
author: mooki
excerpt: "Guide complet pour débuter avec Kubernetes : concepts fondamentaux, installation, déploiements et bonnes pratiques d'orchestration 2025"
category: guides
---

# Orchestration Kubernetes pour débutants

Kubernetes est devenu le standard de facto pour l'orchestration de conteneurs. Ce guide complet vous accompagne depuis les concepts de base jusqu'au déploiement d'applications en production, avec les dernières bonnes pratiques 2025.

## Introduction à Kubernetes

### Qu'est-ce que Kubernetes ?

Kubernetes (K8s) est une plateforme open-source d'orchestration de conteneurs qui automatise le déploiement, la mise à l'échelle et la gestion d'applications conteneurisées.

**Problèmes résolus par Kubernetes :**
- **Orchestration** : Gestion automatique des conteneurs
- **Haute disponibilité** : Redémarrage automatique des conteneurs défaillants
- **Mise à l'échelle** : Scaling automatique selon la charge
- **Load balancing** : Distribution du trafic
- **Rolling updates** : Déploiements sans interruption
- **Auto-découverte** : Services qui se trouvent automatiquement

### Pourquoi utiliser Kubernetes en 2025 ?

::: info
Kubernetes est maintenant le standard de facto pour l'orchestration de conteneurs, avec plus de 94% des organisations utilisant des conteneurs en production selon la CNCF Survey 2024.
:::

```
Applications monolithiques → Microservices → Kubernetes
┌─────────────────────┐   ┌──────────────────┐   ┌────────────────────┐
│ Un seul serveur     │   │ Multiple services│   │ Orchestration auto │
│ Scaling vertical    │ → │ Containers       │ → │ Healing & Scaling  │
│ Point de défaillance│   │ Déploiement      │   │ Service Discovery  │
│ Mise à jour risquée │   │ complexe         │   │ Zero-downtime      │
└─────────────────────┘   └──────────────────┘   └────────────────────┘
```

### Architecture Kubernetes

```
┌─────────────────── Cluster Kubernetes ──────────────────┐
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  Control Plane  │    │          Worker Nodes        │ │
│  │                 │    │                             │ │
│  │ ┌─────────────┐ │    │ ┌─────────┐ ┌─────────────┐ │ │
│  │ │ API Server  │ │    │ │ kubelet │ │    Pods     │ │ │
│  │ └─────────────┘ │    │ └─────────┘ │ ┌─────────┐ │ │ │
│  │ ┌─────────────┐ │    │ ┌─────────┐ │ │Container│ │ │ │
│  │ │   etcd      │ │◄──►│ │ kube-   │ │ └─────────┘ │ │ │
│  │ └─────────────┘ │    │ │ proxy   │ │ ┌─────────┐ │ │ │
│  │ ┌─────────────┐ │    │ └─────────┘ │ │Container│ │ │ │
│  │ │ Scheduler   │ │    │ ┌─────────┐ │ └─────────┘ │ │ │
│  │ └─────────────┘ │    │ │Container│ └─────────────┘ │ │
│  │ ┌─────────────┐ │    │ │ Runtime │                 │ │
│  │ │ Controller  │ │    │ └─────────┘                 │ │
│  │ │ Manager     │ │    └─────────────────────────────┘ │
│  │ └─────────────┘ │                                   │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

## Installation et configuration

### Options d'installation en 2025

#### 1. Environnement local - Minikube

::: tip
Minikube est parfait pour débuter avec Kubernetes. Il crée un cluster local single-node idéal pour l'apprentissage et le développement.
:::

```bash
# Installation Minikube (recommandé pour débuter)
# macOS
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Windows (PowerShell en tant qu'admin)
New-Item -Path 'c:\' -Name 'minikube' -ItemType Directory -Force
Invoke-WebRequest -OutFile 'c:\minikube\minikube.exe' -Uri 'https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe' -UseBasicParsing

# Démarrage du cluster
minikube start --driver=docker --cpus=4 --memory=8192
minikube addons enable dashboard
minikube addons enable ingress
```

#### 2. Local avec Kind (Kubernetes in Docker)

```bash
# Installation Kind
# macOS/Linux
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Configuration cluster multi-nœuds
cat << EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
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
EOF

# Créer le cluster
kind create cluster --config kind-config.yaml --name dev-cluster

# Installer kubectl si nécessaire
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

#### 3. Services cloud managés

```bash
# Google Kubernetes Engine (GKE)
gcloud container clusters create dev-cluster \
    --num-nodes=3 \
    --zone=europe-west1-b \
    --machine-type=e2-standard-2 \
    --enable-autoscaling \
    --max-nodes=10 \
    --min-nodes=1

# Amazon EKS
eksctl create cluster \
    --name dev-cluster \
    --version 1.33 \
    --region eu-west-1 \
    --nodegroup-name standard-workers \
    --node-type t3.medium \
    --nodes 3 \
    --nodes-min 1 \
    --nodes-max 4

# Azure AKS
az aks create \
    --resource-group myResourceGroup \
    --name dev-cluster \
    --node-count 3 \
    --enable-addons monitoring \
    --generate-ssh-keys \
    --kubernetes-version 1.33.3
```

### Installation kubectl et configuration

```bash
# Vérification de l'installation
kubectl version --client
kubectl cluster-info

# Configuration contexts multiples
kubectl config get-contexts
kubectl config use-context minikube
kubectl config set-context --current --namespace=development

# Autocomplétion bash/zsh
echo 'source <(kubectl completion zsh)' >> ~/.zshrc
echo 'alias k=kubectl' >> ~/.zshrc
echo 'complete -F __start_kubectl k' >> ~/.zshrc
```

## Concepts fondamentaux

### 1. Pods - L'unité atomique

```yaml
# pod-simple.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:1.25-alpine
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    env:
    - name: ENV
      value: "development"
```

**Création et gestion :**
```bash
# Créer le pod
kubectl apply -f pod-simple.yaml

# Lister les pods
kubectl get pods
kubectl get pods -o wide
kubectl get pods --show-labels

# Inspecter un pod
kubectl describe pod nginx-pod
kubectl logs nginx-pod
kubectl logs nginx-pod -f  # Follow logs

# Se connecter au pod
kubectl exec -it nginx-pod -- /bin/sh

# Supprimer le pod
kubectl delete pod nginx-pod
```

### 2. ReplicaSets - Gestion des répliques

```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

```bash
# Appliquer le ReplicaSet
kubectl apply -f replicaset.yaml

# Vérifier les répliques
kubectl get rs
kubectl get pods

# Scaler le ReplicaSet
kubectl scale rs nginx-replicaset --replicas=5

# Test de résilience - supprimer un pod
kubectl delete pod <pod-name>
kubectl get pods  # Un nouveau pod est créé automatiquement
```

::: warning
Attention : Ne supprimez jamais directement des pods en production. Utilisez toujours les Deployments pour gérer vos pods.
:::


### 3. Deployments - Gestion déclarative

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
        version: v1
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Gestion des déploiements :**
```bash
# Créer le deployment
kubectl apply -f deployment.yaml

# Surveiller le déploiement
kubectl rollout status deployment/nginx-deployment

# Historique des déploiements
kubectl rollout history deployment/nginx-deployment

# Mise à jour rolling
kubectl set image deployment/nginx-deployment nginx=nginx:1.26-alpine
kubectl rollout status deployment/nginx-deployment

# Rollback
kubectl rollout undo deployment/nginx-deployment
kubectl rollout undo deployment/nginx-deployment --to-revision=2

# Scaling
kubectl scale deployment nginx-deployment --replicas=5

::: tip
Les Deployments permettent des mises à jour "rolling" sans interruption de service. Kubernetes remplace progressivement les anciens pods par les nouveaux.
:::
```

## Services et découverte de services

### Types de services

#### 1. ClusterIP (par défaut)

```yaml
# service-clusterip.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

#### 2. NodePort

```yaml
# service-nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080
  type: NodePort
```

#### 3. LoadBalancer

```yaml
# service-loadbalancer.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

### Découverte de services et DNS

```bash
# Test de connectivité interne
kubectl run debug --image=busybox:1.36 --rm -it --restart=Never -- sh

# Dans le pod debug :
nslookup nginx-service
nslookup nginx-service.default.svc.cluster.local
wget -O- nginx-service

# Variables d'environnement automatiques
env | grep NGINX_SERVICE

::: info
Kubernetes crée automatiquement des variables d'environnement et des entrées DNS pour tous les services, permettant la découverte automatique entre les composants.
:::
```

## ConfigMaps et Secrets

### ConfigMaps pour la configuration

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database.url: "mongodb://mongo:27017/myapp"
  app.debug: "true"
  log.level: "info"
  # Fichier de configuration complet
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
        location /api/ {
            proxy_pass http://backend:8080/;
        }
    }
```

**Utilisation dans un Deployment :**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        # Variables d'environnement depuis ConfigMap
        envFrom:
        - configMapRef:
            name: app-config
        # Variables spécifiques
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database.url
        # Mount fichier de configuration
        volumeMounts:
        - name: config-volume
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
      volumes:
      - name: config-volume
        configMap:
          name: app-config
```

### Secrets pour les données sensibles

```bash
# Créer un secret depuis la ligne de commande
kubectl create secret generic app-secrets \
  --from-literal=database-password='mon-mot-de-passe-secret' \
  --from-literal=api-key='sk-1234567890abcdef'

# Depuis un fichier
echo -n 'admin' > username.txt
echo -n 'super-secret-password' > password.txt
kubectl create secret generic user-credentials \
  --from-file=username.txt \
  --from-file=password.txt

# Secret TLS pour HTTPS
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key
```

**Secret declaratif :**

::: danger
⚠️ **Sécurité** : Ne jamais committer des secrets en base64 dans Git ! Utilisez des outils comme Sealed Secrets, External Secrets Operator, ou des gestionnaires de secrets cloud.
:::

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # Base64 encodé
  database-password: bW9uLW1vdC1kZS1wYXNzZS1zZWNyZXQ=
  api-key: c2stMTIzNDU2Nzg5MGFiY2RlZg==
---
apiVersion: v1
kind: Secret
metadata:
  name: docker-registry-secret
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: eyJhdXRocyI6eyJyZWdpc3RyeS5jb20iOnsidXNlcm5hbWUiOiJ1c2VyIiwicGFzc3dvcmQiOiJwYXNzIiwiYXV0aCI6ImRYTmxjanB3WVhOeiJ9fX0=
```

## Volumes et stockage persistant

### Types de volumes

#### 1. EmptyDir (temporaire)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shared-volume-pod
spec:
  containers:
  - name: writer
    image: busybox:1.36
    command: ['sh', '-c', 'echo "Hello from writer" > /shared/message.txt; sleep 3600']
    volumeMounts:
    - name: shared-storage
      mountPath: /shared
  - name: reader
    image: busybox:1.36
    command: ['sh', '-c', 'while true; do cat /shared/message.txt; sleep 10; done']
    volumeMounts:
    - name: shared-storage
      mountPath: /shared
  volumes:
  - name: shared-storage
    emptyDir: {}
```

#### 2. PersistentVolume et PersistentVolumeClaim

```yaml
# pv.yaml - PersistentVolume
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-storage
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /mnt/data
---
# pvc.yaml - PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-storage
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

**Utilisation dans un Deployment :**
```yaml
# deployment-with-storage.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_DB
          value: myapp
        - name: POSTGRES_USER
          value: user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        ports:
        - containerPort: 5432
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: pvc-storage
```

## Namespaces et organisation

### Gestion des namespaces

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
  labels:
    environment: dev
    team: backend
---
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: prod
    team: ops
```

```bash
# Commandes de gestion
kubectl create namespace staging
kubectl get namespaces
kubectl describe namespace development

# Définir un namespace par défaut
kubectl config set-context --current --namespace=development

# Déployer dans un namespace spécifique
kubectl apply -f deployment.yaml -n production

# Lister les ressources par namespace
kubectl get all -n development
kubectl get all --all-namespaces
```

### ResourceQuotas et LimitRanges

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: development
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "10"
    persistentvolumeclaims: "4"
    services: "5"
---
# limit-range.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: development
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
  - max:
      cpu: "2"
      memory: "2Gi"
    min:
      cpu: "50m"
      memory: "64Mi"
    type: Container
```

## Ingress et exposition externe

### Configuration Ingress

```bash
# Activer Ingress Controller (Minikube)
minikube addons enable ingress

# Pour Kind, installer nginx-ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
  - host: grafana.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana-service
            port:
              number: 3000
```

## Projet pratique : Application complète

### Architecture de l'application

```
┌─────────────────────────────────────────┐
│            Internet/Users               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              Ingress                    │
│         (nginx-ingress)                 │
└─────────────┬───────────┬───────────────┘
              │           │
    ┌─────────▼─────────┐ │
    │    Frontend       │ │
    │   (React/Vue)     │ │
    │   Port: 80        │ │
    └─────────┬─────────┘ │
              │           │
              │    ┌──────▼──────┐
              │    │   Backend   │
              │    │  (Node.js)  │
              │    │  Port: 8080 │
              │    └──────┬──────┘
              │           │
              │    ┌──────▼──────┐
              │    │  Database   │
              │    │ (PostgreSQL)│
              │    │  Port: 5432 │
              │    └─────────────┘
              │
       ┌──────▼──────┐
       │    Redis    │
       │ (Cache/DB)  │
       │  Port: 6379 │
       └─────────────┘
```

### 1. Base de données PostgreSQL

```yaml
# postgres.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
data:
  postgres-password: cG9zdGdyZXMxMjM=  # postgres123
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
  labels:
    app: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_DB
          value: myapp
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: postgres-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

### 2. Cache Redis

```yaml
# redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-deployment
  labels:
    app: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          tcpSocket:
            port: 6379
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
```

### 3. Backend API

```yaml
# backend.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  NODE_ENV: "production"
  PORT: "8080"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "myapp"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  labels:
    app: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
        version: v1
    spec:
      containers:
      - name: backend
        image: myapp/backend:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: backend-config
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: postgres-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### 4. Frontend

```yaml
# frontend.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
        
        location /api/ {
            proxy_pass http://backend-service:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  labels:
    app: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        version: v1
    spec:
      containers:
      - name: frontend
        image: myapp/frontend:latest
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d/default.conf
          subPath: nginx.conf
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: nginx-config
        configMap:
          name: frontend-config
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### 5. Ingress pour exposition

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 6. Déploiement de l'application complète

::: details Script de déploiement automatisé
Ce script déploie tous les composants dans l'ordre correct et vérifie leur état de santé.
:::

```bash
# Script de déploiement
#!/bin/bash

echo "🚀 Déploiement de l'application complète..."

# Créer le namespace
kubectl create namespace myapp --dry-run=client -o yaml | kubectl apply -f -

# Déployer dans l'ordre de dépendance
echo "📊 Déploiement de PostgreSQL..."
kubectl apply -f postgres.yaml -n myapp

echo "🗃️ Déploiement de Redis..."
kubectl apply -f redis.yaml -n myapp

echo "⏳ Attente de la disponibilité des bases de données..."
kubectl wait --for=condition=ready pod -l app=postgres -n myapp --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n myapp --timeout=300s

echo "🔧 Déploiement du Backend..."
kubectl apply -f backend.yaml -n myapp

echo "⏳ Attente de la disponibilité du backend..."
kubectl wait --for=condition=ready pod -l app=backend -n myapp --timeout=300s

echo "🎨 Déploiement du Frontend..."
kubectl apply -f frontend.yaml -n myapp

echo "🌐 Configuration de l'Ingress..."
kubectl apply -f ingress.yaml -n myapp

echo "✅ Déploiement terminé !"

# Vérifier le statut
kubectl get all -n myapp

# Instructions pour accéder à l'application
echo ""
echo "📝 Pour accéder à l'application :"
echo "1. Ajouter dans /etc/hosts : $(minikube ip) myapp.local"
echo "2. Ouvrir http://myapp.local dans votre navigateur"

# Obtenir l'IP Minikube
if command -v minikube &> /dev/null; then
    echo "IP Minikube : $(minikube ip)"
fi

::: tip
Pour tester rapidement votre application, vous pouvez utiliser `kubectl port-forward service/frontend-service 8080:80` et accéder à http://localhost:8080
:::
```

## Monitoring et observabilité

### Health checks et probes

```yaml
# Exemple de probes avancées
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-probes
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        # Liveness Probe - redémarre le container si échec
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
            httpHeaders:
            - name: Custom-Header
              value: HealthCheck
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1
        
        # Readiness Probe - retire du service si échec
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1
        
        # Startup Probe - pour les applications à démarrage lent
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
          successThreshold: 1
```

### Métriques avec Prometheus

```yaml
# monitoring-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
---
# prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:v2.49.1
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus/prometheus.yml
          subPath: prometheus.yml
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus/'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
        - '--storage.tsdb.retention.time=200h'
        - '--web.enable-lifecycle'
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
```

## Bonnes pratiques et sécurité

### 1. Gestion des ressources

```yaml
# resource-management.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: efficient-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: efficient-app
  template:
    metadata:
      labels:
        app: efficient-app
    spec:
      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: app
        image: myapp:latest
        # Security context au niveau container
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        # Gestion fine des ressources
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
            ephemeral-storage: "1Gi"
          limits:
            memory: "512Mi"
            cpu: "500m"
            ephemeral-storage: "2Gi"
        # Variables d'environnement sécurisées
        env:
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        # Volumes pour les fichiers temporaires
        volumeMounts:
        - name: tmp-volume
          mountPath: /tmp
        - name: cache-volume
          mountPath: /app/cache
      volumes:
      - name: tmp-volume
        emptyDir: {}
      - name: cache-volume
        emptyDir: {}
```

### 2. NetworkPolicies pour la sécurité

```yaml
# network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: myapp
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Autoriser le trafic depuis le frontend
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
  # Autoriser le trafic depuis l'ingress
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  # Autoriser l'accès à PostgreSQL
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  # Autoriser l'accès à Redis
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  # Autoriser DNS
  - to: []
    ports:
    - protocol: UDP
      port: 53
```

### 3. Autoscaling

```yaml
# hpa.yaml - Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: myapp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
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

## Outils et workflows avancés

### 1. Outils recommandés

```bash
# Installation d'outils essentiels
# kubectl avec plugins utiles
kubectl krew install ctx ns tree view-secret

# k9s - Interface TUI pour Kubernetes
brew install k9s

# helm - Gestionnaire de packages
curl https://get.helm.sh/helm-v3.14.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/

# kubectx/kubens - Changement rapide de contexte
brew install kubectx

# stern - Logs aggregés
brew install stern

# kustomize - Gestion de configuration
brew install kustomize
```

### 2. Helm Charts

```yaml
# Chart.yaml
apiVersion: v2
name: myapp
description: Application de démonstration Kubernetes
type: application
version: 0.1.0
appVersion: "1.0.0"
```

```yaml
# values.yaml
replicaCount: 3

image:
  repository: myapp/backend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8080

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: myapp.local
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

database:
  enabled: true
  image: postgres:16-alpine
  storage: 5Gi
```

### 3. CI/CD avec Kubernetes

```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        push: true
        tags: ${{ secrets.REGISTRY }}/myapp:${{ github.sha }}
    
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.33.3'
    
    - name: Deploy to Kubernetes
      run: |
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
        # Update image
        kubectl set image deployment/backend-deployment \
          backend=${{ secrets.REGISTRY }}/myapp:${{ github.sha }} \
          -n myapp
        
        # Wait for rollout
        kubectl rollout status deployment/backend-deployment -n myapp
        
        # Run tests
        kubectl run test-pod --image=curlimages/curl:8.5.0 --rm -i --restart=Never -- \
          curl -f http://backend-service:8080/health
```

## Ressources et apprentissage

### Documentation officielle
- [Kubernetes Documentation](https://kubernetes.io/docs/) - Documentation complète
- [Kubernetes Tutorials](https://kubernetes.io/docs/tutorials/) - Tutoriels officiels
- [kubectl Reference](https://kubernetes.io/docs/reference/kubectl/) - Référence des commandes
- [API Reference](https://kubernetes.io/docs/reference/kubernetes-api/) - Référence API

### Outils de formation
- [Kubernetes Playground](https://labs.play-with-k8s.com/) - Environnement de test en ligne
- [Katacoda Kubernetes](https://www.katacoda.com/courses/kubernetes) - Scénarios interactifs
- [Kind](https://kind.sigs.k8s.io/) - Kubernetes dans Docker
- [K3s](https://k3s.io/) - Kubernetes léger

::: tip
Le site [Play with Kubernetes](https://labs.play-with-k8s.com/) vous permet de tester Kubernetes directement dans votre navigateur sans rien installer !
:::

### Certifications recommandées
- **CKA** (Certified Kubernetes Administrator) - Administration
- **CKAD** (Certified Kubernetes Application Developer) - Développement
- **CKS** (Certified Kubernetes Security Specialist) - Sécurité

### Ressources avancées
- [CNCF Landscape](https://landscape.cncf.io/) - Écosystème cloud-native
- [Awesome Kubernetes](https://github.com/ramitsurana/awesome-kubernetes) - Resources communautaires
- [Kubernetes Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices) - Bonnes pratiques Google

## Conclusion

Kubernetes révolutionne le déploiement et la gestion d'applications en 2025. Ce guide vous a présenté :

**Compétences acquises :**
- **Concepts fondamentaux** : Pods, Services, Deployments, ConfigMaps, Secrets
- **Orchestration avancée** : Ingress, Volumes, Namespaces, NetworkPolicies
- **Projet pratique** : Application complète multi-tiers
- **Bonnes pratiques** : Sécurité, monitoring, autoscaling

**Prochaines étapes recommandées :**
1. **Pratique** : Déployer l'application d'exemple
2. **Exploration** : Tester différents types de workloads
3. **Approfondissement** : Étudier Helm, Istio, ou Operators
4. **Certification** : Préparer une certification Kubernetes
5. **Production** : Implémenter dans un environnement réel

Kubernetes demande un investissement en apprentissage mais offre des capacités d'orchestration inégalées pour les architectures cloud-natives modernes.