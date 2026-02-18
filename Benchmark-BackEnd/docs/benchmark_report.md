# 🎭 Benchmark Backend Multi-Théâtres
## Comparaison Node.js vs Go vs Rust

---

## 📋 Table des Matières

1. [Objectif](#objectif)
2. [Méthodologie](#méthodologie)
3. [Architecture des Tests](#architecture-des-tests)
4. [Résultats Bruts](#résultats-bruts)
5. [Analyse Comparative](#analyse-comparative)
6. [Graphiques](#graphiques)
7. [Analyse des Compromis](#analyse-des-compromis)
8. [Recommandation Finale](#recommandation-finale)
9. [Conclusion](#conclusion)

---

## 🎯 Objectif

Évaluer et comparer les performances de différents frameworks backend pour une architecture API scalable multi-théâtres, capable de gérer des pics de charge importants (exemple : ouverture de spectacle avec 1000+ utilisateurs simultanés).

**Technologies évaluées :**
- **Node.js** : Express.js, Fastify
- **Go** : Fiber, Gin
- **Rust** : Actix-web, Axum

---

## 🔬 Méthodologie

### Environnement de Test

- **CPU** : 2 vCPUs par container
- **RAM** : 512 MB par container
- **Réseau** : Localhost (latence minimale)
- **Isolation** : Docker containers

### Scénarios de Test

#### Test de Charge Principal
- **Durée** : 11 minutes
- **Montée en charge** :
  - 0-100 utilisateurs (1 min)
  - 100 utilisateurs constants (2 min)
  - 100-500 utilisateurs (1 min)
  - 500 utilisateurs constants (2 min)
  - 500-1000 utilisateurs (1 min)
  - **1000 utilisateurs constants (3 min)** ← Pic principal
  - Descente (1 min)

#### Endpoints Testés
- `GET /health` - Santé du service
- `GET /users` - Liste des utilisateurs
- `GET /users/:id` - Détail utilisateur
- `GET /events` - Liste des événements
- `GET /events/:id` - Détail événement

### Métriques Mesurées

| Métrique | Description | Objectif |
|----------|-------------|----------|
| **RPS** | Requêtes par seconde | > 1000 req/s |
| **Latence Moyenne** | Temps de réponse moyen | < 100 ms |
| **Latence P95** | 95e percentile | < 200 ms |
| **Latence P99** | 99e percentile | < 500 ms |
| **Taux d'échec** | % de requêtes échouées | < 1% |
| **RAM** | Consommation mémoire | < 512 MB |
| **CPU** | Utilisation processeur | < 200% |

---

## 🏗 Architecture des Tests

```
┌─────────────────────────────────────────┐
│          k6 Load Generator              │
│       (1000 Virtual Users)              │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌─────────┐           ┌─────────┐
│ Node.js │           │   Go    │
├─────────┤           ├─────────┤
│ Express │           │  Fiber  │
│ Fastify │           │   Gin   │
└─────────┘           └─────────┘
                           
                ┌─────────┐
                │  Rust   │
                ├─────────┤
                │  Actix  │
                │  Axum   │
                └─────────┘
```

### Endpoints Identiques

Tous les services implémentent exactement la même logique :

```typescript
// Données simulées en mémoire
Users: [Alice, Bob, Charlie]
Events: [Le Cid, Hamlet, Macbeth]

// Endpoints
GET    /health          → Status + timestamp
GET    /users           → Liste complète
GET    /users/:id       → Détail utilisateur
POST   /users           → Créer utilisateur
GET    /events          → Liste complète
GET    /events/:id      → Détail événement
POST   /events          → Créer événement
```

---

## 📊 Résultats Bruts

### Tableau Récapitulatif

> **Note** : Les valeurs ci-dessous sont des exemples. Vos résultats réels seront générés après l'exécution du benchmark.

| Framework | RPS Moyen | Latence Moy. | P95 | P99 | Échec % | RAM (MB) | CPU % |
|-----------|-----------|--------------|-----|-----|---------|----------|-------|
| **Rust Actix** | 12,450 | 78 ms | 145 ms | 210 ms | 0.01% | 45 MB | 165% |
| **Rust Axum** | 11,890 | 82 ms | 152 ms | 225 ms | 0.02% | 48 MB | 162% |
| **Go Fiber** | 10,230 | 95 ms | 178 ms | 265 ms | 0.05% | 68 MB | 175% |
| **Go Gin** | 9,850 | 98 ms | 185 ms | 280 ms | 0.08% | 72 MB | 178% |
| **Node.js Fastify** | 7,340 | 132 ms | 245 ms | 385 ms | 0.15% | 125 MB | 180% |
| **Node.js Express** | 5,920 | 165 ms | 312 ms | 485 ms | 0.28% | 142 MB | 185% |

### Détails par Service

#### 🦀 Rust Actix
```
✓ RPS Maximum : 12,450 req/s
✓ Latence Moyenne : 78 ms
✓ P99 : 210 ms
✓ Taux d'échec : 0.01%
✓ RAM : 45 MB
✓ CPU : 165%
```

#### 🦀 Rust Axum
```
✓ RPS Maximum : 11,890 req/s
✓ Latence Moyenne : 82 ms
✓ P99 : 225 ms
✓ Taux d'échec : 0.02%
✓ RAM : 48 MB
✓ CPU : 162%
```

#### 🐹 Go Fiber
```
✓ RPS Maximum : 10,230 req/s
✓ Latence Moyenne : 95 ms
✓ P99 : 265 ms
✓ Taux d'échec : 0.05%
✓ RAM : 68 MB
✓ CPU : 175%
```

#### 🐹 Go Gin
```
✓ RPS Maximum : 9,850 req/s
✓ Latence Moyenne : 98 ms
✓ P99 : 280 ms
✓ Taux d'échec : 0.08%
✓ RAM : 72 MB
✓ CPU : 178%
```

#### 🟢 Node.js Fastify
```
✓ RPS Maximum : 7,340 req/s
✓ Latence Moyenne : 132 ms
✓ P99 : 385 ms
✓ Taux d'échec : 0.15%
✓ RAM : 125 MB
✓ CPU : 180%
```

#### 🟢 Node.js Express
```
✓ RPS Maximum : 5,920 req/s
✓ Latence Moyenne : 165 ms
✓ P99 : 485 ms
✓ Taux d'échec : 0.28%
✓ RAM : 142 MB
✓ CPU : 185%
```

---

## 📈 Graphiques

Les graphiques suivants sont générés automatiquement après le benchmark :

### 1. Comparaison des Latences
![Latency Comparison](./results/latency_comparison.png)

**Observation** : Rust Actix/Axum maintiennent les latences les plus basses, même sous forte charge.

---

### 2. Comparaison du Débit (Throughput)
![Throughput Comparison](./results/throughput_comparison.png)

**Observation** : Rust traite 2x plus de requêtes que Node.js Express.

---

### 3. Matrice de Performance
![Performance Matrix](./results/performance_matrix.png)

**Observation** : Vue d'ensemble normalisée des performances.

---

### 4. Taux d'Échec
![Failure Rate](./results/failure_rate.png)

**Observation** : Tous les frameworks restent sous le seuil de 1% d'échec.

---

### 5. Vue Complète
![Comprehensive Comparison](./results/comprehensive_comparison.png)

---

## ⚖️ Analyse des Compromis

### 🥇 Performances Pures : Rust
**Avantages :**
- ✅ Débit exceptionnel (12,000+ RPS)
- ✅ Latences ultra-faibles (< 100 ms)
- ✅ Consommation RAM minimale (< 50 MB)
- ✅ Prédictibilité sous charge
- ✅ Pas de Garbage Collector

**Inconvénients :**
- ❌ Courbe d'apprentissage raide
- ❌ Temps de compilation plus long
- ❌ Écosystème moins mature que Node.js
- ❌ Pool de développeurs limité
- ❌ Complexité du système de types

**Verdict** : Idéal pour systèmes critiques nécessitant performance maximale.

---

### 🥈 Équilibre Performance/Simplicité : Go
**Avantages :**
- ✅ Excellentes performances (10,000 RPS)
- ✅ Syntaxe simple et lisible
- ✅ Compilation rapide
- ✅ Concurrence native (goroutines)
- ✅ Binaires standalone
- ✅ Courbe d'apprentissage douce

**Inconvénients :**
- ⚠️ Gestion d'erreurs verbose
- ⚠️ Pas de génériques avancés
- ⚠️ Moins performant que Rust

**Verdict** : Excellent compromis pour équipes mixtes.

---

### 🥉 Productivité/Écosystème : Node.js
**Avantages :**
- ✅ Écosystème NPM gigantesque
- ✅ Développement rapide
- ✅ Pool de développeurs énorme
- ✅ Paradigme async/await familier
- ✅ Fastify = amélioration significative vs Express

**Inconvénients :**
- ❌ Performances 2x inférieures à Rust
- ❌ Consommation RAM élevée
- ❌ Garbage Collector = latences imprévisibles
- ❌ Single-threaded (sans clustering)

**Verdict** : Bon pour MVP et équipes JavaScript.

---

## 🎯 Recommandation Finale

### Pour une Architecture Multi-Théâtres Scalable

#### 🏆 Choix Principal : **Go (Fiber ou Gin)**

**Justification :**

1. **Performance suffisante** : 10,000 RPS largement au-dessus des besoins
2. **Maintenance facilitée** : Code simple, équipes peuvent monter en compétence rapidement
3. **Coûts d'infrastructure** : Consommation RAM 3x inférieure à Node.js
4. **Fiabilité** : Comportement prévisible sous charge
5. **Écosystème mature** : Bibliothèques stables pour APIs REST

#### 📊 Scénario de Décision

| Critère | Node.js | **Go** ✓ | Rust |
|---------|---------|----------|------|
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Productivité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Maintenabilité | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Coût Infrastructure | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Recrutement | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **SCORE GLOBAL** | 16/25 | **21/25** ✓ | 17/25 |

---

### Cas d'Usage Spécifiques

#### Choisir **Rust** si :
- ✅ Performance absolue critique (> 50,000 RPS)
- ✅ Budget serveur très limité
- ✅ Équipe senior avec expertise systems programming
- ✅ Latence P99 < 100 ms obligatoire

#### Choisir **Go** si :
- ✅ **Équilibre performance/productivité** (recommandé)
- ✅ Équipe de taille moyenne
- ✅ Besoin de scalabilité importante
- ✅ Maintenance long terme

#### Choisir **Node.js** si :
- ✅ Équipe exclusivement JavaScript
- ✅ MVP / Prototypage rapide
- ✅ Intégration forte avec frontend JS
- ✅ Budget serveur confortable

---

## 📐 Architecture Recommandée

### Phase 1 : Implémentation Go
```
┌───────────────────────────────────────┐
│         Load Balancer (Nginx)         │
└─────────────┬─────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐         ┌─────────┐
│ Go API  │         │ Go API  │
│ (Fiber) │ ◄─────► │ (Fiber) │
└────┬────┘         └────┬────┘
     │                   │
     └─────────┬─────────┘
               ▼
         ┌──────────┐
         │ Database │
         └──────────┘
```

### Phase 2 : Hybride (Si nécessaire)
```
Go API (Fiber) → Endpoints critiques
  - /events (haute charge)
  - /bookings (temps réel)

Node.js (Fastify) → Endpoints admin
  - /admin/* (low traffic)
  - Intégrations tierces
```

---

## 💡 Conseils d'Implémentation

### 1. Configuration Production Go

```go
// Configuration optimale Fiber
app := fiber.New(fiber.Config{
    Prefork:       true,  // Multi-process
    CaseSensitive: true,
    StrictRouting: false,
    ServerHeader:  "StageOps",
    AppName:       "Multi-Theatre API v1.0",
    
    // Limites
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  120 * time.Second,
    
    // Body limits
    BodyLimit: 4 * 1024 * 1024, // 4MB
})
```

### 2. Monitoring Essentiel

```yaml
Métriques à surveiller :
  - RPS par endpoint
  - Latence P50, P95, P99
  - Taux d'erreur 5xx
  - Goroutines actives
  - RAM / CPU par instance
  - Durée requêtes DB
```

### 3. Auto-scaling

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## ✅ Conclusion

### Résumé Exécutif

Le benchmark démontre clairement que **Go (Fiber/Gin) offre le meilleur équilibre** pour une architecture API multi-théâtres :

1. ✅ **Performance** : 10,000+ RPS suffisent pour la majorité des cas
2. ✅ **Maintenabilité** : Code simple, équipes productives rapidement
3. ✅ **Coûts** : 2-3x moins de serveurs qu'avec Node.js
4. ✅ **Fiabilité** : Comportement prévisible sous charge extrême

### ROI Estimé

| Aspect | Node.js Express | **Go Fiber** | Économie |
|--------|-----------------|--------------|----------|
| Serveurs (1M req/j) | 8 instances | **4 instances** | **-50%** |
| RAM totale | 1.2 GB | **0.3 GB** | **-75%** |
| Coût mensuel AWS | $240 | **$120** | **$120/mois** |
| Latence utilisateur | 165 ms | **95 ms** | **-42%** |

### Prochaines Étapes

1. ✅ Valider les résultats en environnement staging
2. ✅ Former l'équipe sur Go (2-3 semaines)
3. ✅ Migrer endpoints critiques en priorité
4. ✅ Monitorer en production avec métriques temps réel
5. ✅ Optimiser base de données (souvent le vrai bottleneck)

---

## 📚 Ressources

### Documentation

- [Go Fiber](https://gofiber.io/) - Framework web rapide
- [Go Gin](https://gin-gonic.com/) - Framework web léger
- [k6 Load Testing](https://k6.io/) - Outil de test de charge
- [Docker Performance](https://docs.docker.com/config/containers/resource_constraints/)

### Benchmarks Communautaires

- [TechEmpower Benchmarks](https://www.techempower.com/benchmarks/)
- [Web Framework Benchmarks](https://web-frameworks-benchmark.netlify.app/)

---

**Généré le** : [Date à insérer]  
**Auteur** : Équipe StageOps  
**Version** : 1.0  
**Contact** : benchmark@stageops.com

---

> 💡 **Note** : Ce rapport est un template. Vos résultats réels seront générés après l'exécution du script `./run_benchmark.sh`.
