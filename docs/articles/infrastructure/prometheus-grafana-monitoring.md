---
title: "Mettre en place un monitoring avec Prometheus et Grafana"
date: 2025-08-02
tags: [monitoring, prometheus, grafana, observability, devops, metrics]
author: mooki
excerpt: "Guide complet pour déployer une stack de monitoring moderne avec Prometheus et Grafana : collecte de métriques, alerting et dashboards"
category: infrastructure
---

# Mettre en place un monitoring avec Prometheus et Grafana

Une stack de monitoring robuste avec Prometheus et Grafana est essentielle pour maintenir la santé et les performances de vos applications en production. Ce guide couvre une installation complète avec alerting et bonnes pratiques.

## Architecture de la solution

### Vue d'ensemble

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Applications  │    │   Prometheus    │    │     Grafana     │
│                 │────│                 │────│                 │
│ - Node Exporter │    │ - TSDB          │    │ - Dashboards    │
│ - App Metrics   │    │ - Scraping      │    │ - Alerting      │
│ - Custom        │    │ - Rules         │    │ - Users         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Alertmanager  │
                       │                 │
                       │ - Routes        │
                       │ - Notifications │
                       │ - Silences      │
                       └─────────────────┘
```

### Composants principaux

- **Prometheus** : Collecte et stockage des métriques time-series
- **Grafana** : Visualisation et dashboards
- **Alertmanager** : Gestion des alertes et notifications
- **Node Exporter** : Métriques système
- **Exporters** : Métriques spécialisées (Redis, PostgreSQL, etc.)

## Installation avec Docker Compose

### Structure du projet

```bash
mkdir monitoring-stack && cd monitoring-stack
mkdir -p {prometheus,grafana,alertmanager}/{config,data}
chmod 777 grafana/data prometheus/data alertmanager/data
```

### Docker Compose

**docker-compose.yml**
```yaml
version: '3.8'

services:
  # Prometheus - Collecte des métriques
  prometheus:
    image: prom/prometheus:v2.48.1
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/config:/etc/prometheus
      - ./prometheus/data:/prometheus
      - /etc/localtime:/etc/localtime:ro
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--storage.tsdb.retention.size=50GB'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    networks:
      - monitoring

  # Grafana - Visualisation
  grafana:
    image: grafana/grafana:10.3.1
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel
    volumes:
      - ./grafana/data:/var/lib/grafana
      - ./grafana/config:/etc/grafana
      - /etc/localtime:/etc/localtime:ro
    networks:
      - monitoring

  # Alertmanager - Gestion des alertes
  alertmanager:
    image: prom/alertmanager:v0.27.0
    container_name: alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/config:/etc/alertmanager
      - ./alertmanager/data:/alertmanager
      - /etc/localtime:/etc/localtime:ro
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    networks:
      - monitoring

  # Node Exporter - Métriques système
  node-exporter:
    image: prom/node-exporter:v1.7.0
    container_name: node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
      - /etc/localtime:/etc/localtime:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  # cAdvisor - Métriques des conteneurs
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: cadvisor
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
      - /etc/localtime:/etc/localtime:ro
    privileged: true
    devices:
      - /dev/kmsg:/dev/kmsg
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

## Configuration Prometheus

### Configuration principale

**prometheus/config/prometheus.yml**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    replica: 'A'

rule_files:
  - "alert_rules.yml"
  - "recording_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Prometheus lui-même
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 5s

  # Node Exporter (métriques système)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 10s

  # cAdvisor (métriques conteneurs)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    scrape_interval: 10s

  # Grafana
  - job_name: 'grafana'
    static_configs:
      - targets: ['grafana:3000']
    scrape_interval: 30s

  # Applications custom (exemple Spring Boot)
  - job_name: 'spring-app'
    static_configs:
      - targets: ['host.docker.internal:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 15s

  # PostgreSQL Exporter
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 30s

  # Redis Exporter
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 30s

  # Nginx Exporter
  - job_name: 'nginx-exporter'
    static_configs:
      - targets: ['nginx-exporter:9113']
    scrape_interval: 30s

  # Discovery automatique (Docker)
  - job_name: 'docker-discovery'
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__meta_docker_container_label_monitoring]
        action: keep
        regex: true
      - source_labels: [__meta_docker_container_name]
        target_label: container_name
      - source_labels: [__meta_docker_container_label_service]
        target_label: service
```

### Règles d'alerting

**prometheus/config/alert_rules.yml**
```yaml
groups:
  - name: system.rules
    rules:
      # CPU élevé
      - alert: HighCpuUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU usage high on {{ $labels.instance }}"
          description: "CPU usage is above 80% for more than 5 minutes on {{ $labels.instance }}"

      # Mémoire faible
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Memory usage high on {{ $labels.instance }}"
          description: "Memory usage is above 90% on {{ $labels.instance }}"

      # Espace disque faible
      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low on {{ $labels.instance }}"
          description: "Disk usage is above 85% on {{ $labels.instance }} ({{ $labels.mountpoint }})"

      # Instance down
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ $labels.instance }} down"
          description: "{{ $labels.instance }} of job {{ $labels.job }} has been down for more than 1 minute"

  - name: application.rules
    rules:
      # Erreurs HTTP élevées
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "Error rate is above 5% for {{ $labels.instance }}"

      # Latence élevée
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on {{ $labels.instance }}"
          description: "95th percentile latency is above 500ms for {{ $labels.instance }}"

  - name: database.rules
    rules:
      # Connexions PostgreSQL élevées
      - alert: PostgreSQLHighConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL high connections"
          description: "PostgreSQL has {{ $value }}% connections used"

      # Replication lag PostgreSQL
      - alert: PostgreSQLReplicationLag
        expr: pg_replication_lag > 30
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL replication lag"
          description: "PostgreSQL replication lag is {{ $value }} seconds"
```

### Règles de recording

**prometheus/config/recording_rules.yml**
```yaml
groups:
  - name: instance_down:recording_rules
    interval: 30s
    rules:
      - record: instance:up
        expr: up

  - name: cpu:recording_rules
    interval: 30s
    rules:
      - record: instance:cpu_utilization
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

  - name: memory:recording_rules
    interval: 30s
    rules:
      - record: instance:memory_utilization
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

  - name: disk:recording_rules
    interval: 30s
    rules:
      - record: instance:disk_utilization
        expr: (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100

  - name: http:recording_rules
    interval: 30s
    rules:
      - record: instance:http_requests:rate5m
        expr: rate(http_requests_total[5m])
      
      - record: instance:http_errors:rate5m
        expr: rate(http_requests_total{status=~"5.."}[5m])

      - record: instance:http_error_rate
        expr: instance:http_errors:rate5m / instance:http_requests:rate5m * 100
```

## Configuration Alertmanager

**alertmanager/config/alertmanager.yml**
```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@votredomaine.com'
  smtp_auth_username: 'alerts@votredomaine.com'
  smtp_auth_password: 'votre-mot-de-passe'
  smtp_require_tls: true

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    # Alertes critiques -> Slack + Email
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true
    
    # Alertes warning -> Slack seulement
    - match:
        severity: warning
      receiver: 'warning-alerts'
      continue: true

    # Alertes base de données
    - match_re:
        alertname: 'PostgreSQL.*'
      receiver: 'database-team'

receivers:
  - name: 'default'
    email_configs:
      - to: 'admin@votredomaine.com'
        subject: '[MONITORING] {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Instance: {{ .Labels.instance }}
          Severity: {{ .Labels.severity }}
          {{ end }}

  - name: 'critical-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-critical'
        color: 'danger'
        title: 'Critical Alert: {{ .GroupLabels.alertname }}'
        text: |
          {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Instance:* {{ .Labels.instance }}
          *Severity:* {{ .Labels.severity }}
          {{ end }}
    email_configs:
      - to: 'oncall@votredomaine.com'
        subject: '[CRITICAL] {{ .GroupLabels.alertname }}'

  - name: 'warning-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-warning'
        color: 'warning'
        title: 'Warning: {{ .GroupLabels.alertname }}'

  - name: 'database-team'
    email_configs:
      - to: 'dba@votredomaine.com'
        subject: '[DB] {{ .GroupLabels.alertname }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
```

## Configuration Grafana

### Provisioning des datasources

**grafana/config/provisioning/datasources/prometheus.yml**
```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    basicAuth: false
    jsonData:
      timeInterval: "15s"
      queryTimeout: "60s"
      httpMethod: "POST"
```

### Dashboard système

**grafana/config/provisioning/dashboards/node-exporter.json**
```json
{
  "dashboard": {
    "id": null,
    "title": "Node Exporter Full",
    "description": "Dashboard complet pour Node Exporter",
    "tags": ["prometheus", "node-exporter"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "CPU Usage",
        "type": "stat",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{ instance }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 70},
                {"color": "red", "value": 90}
              ]
            }
          }
        }
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "30s"
  }
}
```

## Exporters supplémentaires

### PostgreSQL Exporter

**docker-compose.override.yml**
```yaml
version: '3.8'

services:
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:v0.15.0
    container_name: postgres-exporter
    restart: unless-stopped
    ports:
      - "9187:9187"
    environment:
      DATA_SOURCE_NAME: "postgresql://username:password@postgres:5432/database?sslmode=disable"
    networks:
      - monitoring

  redis-exporter:
    image: oliver006/redis_exporter:v1.55.0
    container_name: redis-exporter
    restart: unless-stopped
    ports:
      - "9121:9121"
    environment:
      REDIS_ADDR: "redis:6379"
    networks:
      - monitoring

  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:1.0.0
    container_name: nginx-exporter
    restart: unless-stopped
    ports:
      - "9113:9113"
    command:
      - '-nginx.scrape-uri=http://nginx:8080/nginx_status'
    networks:
      - monitoring
```

### Blackbox Exporter (monitoring endpoints)

```yaml
  blackbox-exporter:
    image: prom/blackbox-exporter:v0.25.0
    container_name: blackbox-exporter
    restart: unless-stopped
    ports:
      - "9115:9115"
    volumes:
      - ./blackbox/config:/etc/blackbox_exporter
    networks:
      - monitoring
```

**blackbox/config/config.yml**
```yaml
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: []
      method: GET
      follow_redirects: true
      preferred_ip_protocol: "ip4"

  http_post_2xx:
    prober: http
    timeout: 5s
    http:
      method: POST
      headers:
        Content-Type: application/json
      body: '{}'

  tcp_connect:
    prober: tcp
    timeout: 5s

  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"
```

## Métriques applicatives

### Spring Boot avec Micrometer

**build.gradle**
```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-registry-prometheus'
}
```

**application.yml**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: mon-app
      environment: production
```

### Métriques custom Java

```java
@RestController
public class MetricsController {
    
    private final Counter requestCounter;
    private final Timer requestTimer;
    private final Gauge activeUsers;
    
    public MetricsController(MeterRegistry meterRegistry) {
        this.requestCounter = Counter.builder("http_requests_total")
            .description("Total HTTP requests")
            .tag("endpoint", "api")
            .register(meterRegistry);
            
        this.requestTimer = Timer.builder("http_request_duration")
            .description("HTTP request duration")
            .register(meterRegistry);
            
        this.activeUsers = Gauge.builder("active_users")
            .description("Currently active users")
            .register(meterRegistry, this, MetricsController::getActiveUserCount);
    }
    
    @GetMapping("/api/data")
    public ResponseEntity<String> getData() {
        return Timer.Sample.start(requestTimer)
            .stop(timer -> {
                requestCounter.increment();
                return ResponseEntity.ok("Data");
            });
    }
    
    private double getActiveUserCount() {
        // Logic to count active users
        return 42.0;
    }
}
```

## Scripts d'administration

### Script de démarrage

**start.sh**
```bash
#!/bin/bash

echo "Démarrage de la stack monitoring..."

# Créer les répertoires nécessaires
mkdir -p {prometheus,grafana,alertmanager}/{config,data}
chmod 777 grafana/data prometheus/data alertmanager/data

# Démarrer les services
docker-compose up -d

# Attendre que Prometheus soit prêt
echo "Attente du démarrage de Prometheus..."
while ! curl -s http://localhost:9090/-/ready > /dev/null; do
    sleep 2
done

# Attendre que Grafana soit prêt
echo "Attente du démarrage de Grafana..."
while ! curl -s http://localhost:3000/api/health > /dev/null; do
    sleep 2
done

echo "Stack monitoring démarrée avec succès !"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin123)"
echo "Alertmanager: http://localhost:9093"
```

### Script de backup

**backup.sh**
```bash
#!/bin/bash

BACKUP_DIR="/backup/monitoring"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Sauvegarde de la stack monitoring..."

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

# Backup des configurations
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    prometheus/config \
    grafana/config \
    alertmanager/config

# Backup des données Grafana
docker exec grafana cp -r /var/lib/grafana /tmp/grafana_backup
docker cp grafana:/tmp/grafana_backup $BACKUP_DIR/grafana_$DATE

# Backup snapshot Prometheus (optionnel)
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot
SNAPSHOT=$(curl -s http://localhost:9090/api/v1/admin/tsdb/snapshot | jq -r '.data.name')
docker cp prometheus:/prometheus/snapshots/$SNAPSHOT $BACKUP_DIR/prometheus_$DATE

echo "Sauvegarde terminée : $BACKUP_DIR"
```

### Monitoring des services

**health-check.sh**
```bash
#!/bin/bash

services=("prometheus:9090" "grafana:3000" "alertmanager:9093" "node-exporter:9100")

for service in "${services[@]}"; do
    name=${service%:*}
    port=${service#*:}
    
    if curl -s -f http://localhost:$port/health > /dev/null 2>&1 || \
       curl -s -f http://localhost:$port > /dev/null 2>&1; then
        echo "✅ $name est accessible"
    else
        echo "❌ $name n'est pas accessible"
    fi
done

# Vérifier les targets Prometheus
targets=$(curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | select(.health != "up") | .labels.job')
if [ -n "$targets" ]; then
    echo "⚠️  Targets down: $targets"
else
    echo "✅ Toutes les targets sont up"
fi
```

## Bonnes pratiques

### Dimensionnement

**Configuration Prometheus optimisée**
```yaml
# prometheus.yml - section global
global:
  scrape_interval: 15s      # Collecte toutes les 15s
  evaluation_interval: 15s  # Évaluation des règles
  
# Rétention optimisée
command:
  - '--storage.tsdb.retention.time=30d'
  - '--storage.tsdb.retention.size=100GB'
  - '--storage.tsdb.min-block-duration=2h'
  - '--storage.tsdb.max-block-duration=25h'
```

### Étiquetage (Labels)

```yaml
# Bonnes pratiques de labelling
global:
  external_labels:
    cluster: 'production'
    datacenter: 'eu-west-1'
    replica: 'prometheus-01'

scrape_configs:
  - job_name: 'web-app'
    static_configs:
      - targets: ['app1:8080', 'app2:8080']
        labels:
          environment: 'production'
          team: 'backend'
          service: 'api'
```

### Sécurité

**Basic Auth pour Prometheus**
```yaml
# docker-compose.yml
services:
  prometheus:
    # ... autres configs
    volumes:
      - ./prometheus/web.yml:/etc/prometheus/web.yml
    command:
      - '--web.config.file=/etc/prometheus/web.yml'
```

**prometheus/web.yml**
```yaml
basic_auth_users:
  admin: $2b$12$hNf2lSsxfm0.i4a.1kVpSOVyBCfIB51VRjgBUyv6kdnyTlgWj81Ay  # bcrypt hash of 'password'
```

## Ressources et documentation

### Documentation officielle
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Guide](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Node Exporter](https://github.com/prometheus/node_exporter)

### Dashboards Grafana populaires
- [Node Exporter Full](https://grafana.com/grafana/dashboards/1860)
- [Docker Container Metrics](https://grafana.com/grafana/dashboards/193)
- [Spring Boot Statistics](https://grafana.com/grafana/dashboards/6756)

### Outils complémentaires
- [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator) pour Kubernetes
- [VictoriaMetrics](https://victoriametrics.com/) - Alternative haute performance
- [Thanos](https://thanos.io/) - Prometheus haute disponibilité

### Vidéos recommandées
- [Prometheus Monitoring Guide](https://www.youtube.com/watch?v=9TJx7QTrTyo)
- [Grafana Dashboards Best Practices](https://www.youtube.com/watch?v=pJKI_kJkfXs)

Cette stack Prometheus + Grafana vous donne une base solide pour le monitoring en production, avec alerting intelligent et visualisations efficaces. L'important est de commencer simple et d'itérer en fonction des besoins de votre infrastructure.