# 📚 Index de la Documentation

Guide complet pour naviguer dans le projet de benchmark.

---

## 🚀 Démarrage Rapide

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| [QUICK_START.md](./QUICK_START.md) | Guide en 3 étapes | **Commencer ici** |
| [check_prerequisites.sh](./check_prerequisites.sh) | Vérifier l'environnement | Avant de commencer |
| [quick_test.sh](./quick_test.sh) | Test rapide (5 min) | Pour valider rapidement |
| [run_benchmark.sh](./run_benchmark.sh) | Benchmark complet (1h30) | Pour résultats finaux |

---

## 📖 Documentation Principale

### Documentation Technique

| Fichier | Contenu | Public |
|---------|---------|--------|
| [README_BENCHMARK.md](./README_BENCHMARK.md) | Documentation complète | Développeurs |
| [benchmark_report.md](./benchmark_report.md) | Analyse détaillée | Tous |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Vue d'ensemble | Managers |

### Documentation Spécialisée

| Fichier | Contenu | Public |
|---------|---------|--------|
| [TECHNOLOGIES.md](./TECHNOLOGIES.md) | Stack technique | DevOps |
| [RESULTS_FORMAT.md](./RESULTS_FORMAT.md) | Format des résultats | Data analysts |
| [INDEX.md](./INDEX.md) | Ce fichier | Tous |

---

## 🏗 Code Source

### Services Backend

| Dossier | Framework | Langage | Fichiers |
|---------|-----------|---------|----------|
| [services/nodejs-express/](./services/nodejs-express/) | Express.js | JavaScript | `server.js`, `package.json`, `Dockerfile` |
| [services/nodejs-fastify/](./services/nodejs-fastify/) | Fastify | JavaScript | `server.js`, `package.json`, `Dockerfile` |
| [services/go-fiber/](./services/go-fiber/) | Fiber | Go | `main.go`, `go.mod`, `Dockerfile` |
| [services/go-gin/](./services/go-gin/) | Gin | Go | `main.go`, `go.mod`, `Dockerfile` |
| [services/rust-actix/](./services/rust-actix/) | Actix-web | Rust | `src/main.rs`, `Cargo.toml`, `Dockerfile` |
| [services/rust-axum/](./services/rust-axum/) | Axum | Rust | `src/main.rs`, `Cargo.toml`, `Dockerfile` |

### Tests de Charge

| Fichier | Type | Durée | Description |
|---------|------|-------|-------------|
| [k6-tests/load-test.js](./k6-tests/load-test.js) | Load test | 11 min | Test principal avec montée en charge |
| [k6-tests/spike-test.js](./k6-tests/spike-test.js) | Spike test | 3 min | Test de pic soudain |
| [k6-tests/stress-test.js](./k6-tests/stress-test.js) | Stress test | 10 min | Test de charge constante |

### Analyse & Visualisation

| Fichier | Langage | Description |
|---------|---------|-------------|
| [analysis/generate_charts.py](./analysis/generate_charts.py) | Python | Génération des graphiques |
| [analysis/requirements.txt](./analysis/requirements.txt) | - | Dépendances Python |

---

## 🔧 Configuration

| Fichier | Description | Modifier pour |
|---------|-------------|---------------|
| [docker-compose.yml](./docker-compose.yml) | Orchestration Docker | Limites CPU/RAM, ports |
| [Makefile](./Makefile) | Commandes simplifiées | Ajouter commandes |
| [.gitignore](./.gitignore) | Fichiers ignorés | Exclure fichiers |

---

## 📊 Résultats (Générés)

Après exécution de `./run_benchmark.sh` :

### Données Brutes

| Fichier | Format | Contenu |
|---------|--------|---------|
| `results/*_summary.json` | JSON | Métriques k6 détaillées |
| `results/benchmark_metrics.csv` | CSV | Tableau comparatif |
| `results/docker_stats.txt` | TXT | Stats CPU/RAM containers |

### Graphiques

| Fichier | Type | Visualisation |
|---------|------|---------------|
| `results/latency_comparison.png` | PNG | Comparaison latences |
| `results/throughput_comparison.png` | PNG | Comparaison RPS |
| `results/performance_matrix.png` | PNG | Heatmap performance |
| `results/failure_rate.png` | PNG | Taux d'échec |
| `results/comprehensive_comparison.png` | PNG | Vue d'ensemble 2×2 |

---

## 🎯 Par Cas d'Usage

### Je veux démarrer rapidement
1. Lire [QUICK_START.md](./QUICK_START.md)
2. Exécuter `./check_prerequisites.sh`
3. Lancer `./quick_test.sh`

### Je veux comprendre le projet
1. Lire [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Consulter [README_BENCHMARK.md](./README_BENCHMARK.md)
3. Explorer [TECHNOLOGIES.md](./TECHNOLOGIES.md)

### Je veux lancer le benchmark complet
1. Vérifier `./check_prerequisites.sh`
2. Lancer `./run_benchmark.sh`
3. Consulter `results/`

### Je veux analyser les résultats
1. Ouvrir `results/benchmark_metrics.csv`
2. Visualiser `results/*.png`
3. Lire [benchmark_report.md](./benchmark_report.md)

### Je veux modifier les tests
1. Éditer `k6-tests/load-test.js` (scénarios)
2. Éditer `docker-compose.yml` (ressources)
3. Relancer `./run_benchmark.sh`

### Je veux ajouter un framework
1. Créer `services/nouveau-framework/`
2. Ajouter dans `docker-compose.yml`
3. Modifier `run_benchmark.sh`
4. Mettre à jour `analysis/generate_charts.py`

---

## 📱 Par Rôle

### Développeur Backend
- [README_BENCHMARK.md](./README_BENCHMARK.md) - Commandes & config
- [services/](./services/) - Code source des APIs
- [k6-tests/](./k6-tests/) - Scripts de test

### DevOps / SRE
- [docker-compose.yml](./docker-compose.yml) - Configuration containers
- [Makefile](./Makefile) - Automatisation
- [TECHNOLOGIES.md](./TECHNOLOGIES.md) - Stack technique

### Data Analyst
- [RESULTS_FORMAT.md](./RESULTS_FORMAT.md) - Format données
- `results/benchmark_metrics.csv` - Données tabulaires
- [analysis/generate_charts.py](./analysis/generate_charts.py) - Scripts analyse

### Manager / Product Owner
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Vue d'ensemble
- [benchmark_report.md](./benchmark_report.md) - Analyse & recommandations
- `results/*.png` - Graphiques

### Architecte Technique
- [benchmark_report.md](./benchmark_report.md) - Analyse compromis
- [TECHNOLOGIES.md](./TECHNOLOGIES.md) - Détails techniques
- `results/benchmark_metrics.csv` - Métriques comparatives

---

## 🔍 Par Technologie

### Node.js
```
services/nodejs-express/
  ├── Dockerfile          # Image Docker
  ├── package.json        # Dépendances
  └── server.js           # Code API

services/nodejs-fastify/
  ├── Dockerfile
  ├── package.json
  └── server.js
```

### Go
```
services/go-fiber/
  ├── Dockerfile          # Multi-stage build
  ├── go.mod              # Dépendances
  └── main.go             # Code API

services/go-gin/
  ├── Dockerfile
  ├── go.mod
  └── main.go
```

### Rust
```
services/rust-actix/
  ├── Dockerfile          # Cargo build
  ├── Cargo.toml          # Dépendances
  └── src/
      └── main.rs         # Code API

services/rust-axum/
  ├── Dockerfile
  ├── Cargo.toml
  └── src/
      └── main.rs
```

---

## 🛠 Commandes Utiles

### Scripts Bash

```bash
# Vérifier environnement
./check_prerequisites.sh

# Test rapide (5 min)
./quick_test.sh

# Benchmark complet (1h30)
./run_benchmark.sh
```

### Make (si disponible)

```bash
make install    # Installer dépendances
make build      # Construire images
make start      # Démarrer services
make test       # Lancer benchmark
make graphs     # Générer graphiques
make clean      # Nettoyer
```

### Docker

```bash
# Construire
docker-compose build

# Démarrer
docker-compose up -d

# Logs
docker-compose logs -f

# Stats
docker stats

# Arrêter
docker-compose down
```

### k6

```bash
# Test simple
k6 run k6-tests/load-test.js

# Test avec variables
k6 run --env BASE_URL=http://localhost:3001 \
       --env SERVICE_NAME=nodejs-express \
       k6-tests/load-test.js
```

---

## 📚 Ordre de Lecture Recommandé

### Pour Débutants

1. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Comprendre le projet
2. [QUICK_START.md](./QUICK_START.md) - Premiers pas
3. [README_BENCHMARK.md](./README_BENCHMARK.md) - Documentation complète
4. [benchmark_report.md](./benchmark_report.md) - Résultats & analyse

### Pour Experts

1. [TECHNOLOGIES.md](./TECHNOLOGIES.md) - Stack technique
2. [RESULTS_FORMAT.md](./RESULTS_FORMAT.md) - Format données
3. Code source dans `services/`
4. Scripts dans `k6-tests/` et `analysis/`

---

## 🔗 Liens Externes Utiles

### Installation Outils

- [Docker](https://docs.docker.com/get-docker/)
- [k6](https://k6.io/docs/get-started/installation/)
- [Python](https://www.python.org/downloads/)

### Documentation Frameworks

- [Express.js](https://expressjs.com/)
- [Fastify](https://www.fastify.io/)
- [Go Fiber](https://gofiber.io/)
- [Go Gin](https://gin-gonic.com/)
- [Rust Actix](https://actix.rs/)
- [Rust Axum](https://docs.rs/axum/)

### Benchmarks Références

- [TechEmpower](https://www.techempower.com/benchmarks/)
- [Web Frameworks Benchmark](https://web-frameworks-benchmark.netlify.app/)

---

## 🆘 Besoin d'Aide ?

### Problèmes Courants

Voir section **Troubleshooting** dans :
- [README_BENCHMARK.md](./README_BENCHMARK.md)
- [QUICK_START.md](./QUICK_START.md)

### Erreurs Fréquentes

1. **Docker not running** → Démarrer Docker Desktop
2. **k6 not found** → Installer k6
3. **Port in use** → Changer port dans docker-compose.yml
4. **Python module missing** → `pip install -r analysis/requirements.txt`

---

## 📞 Contact

**Projet** : StageOps Backend Benchmark  
**Objectif** : Évaluation technique pour architecture multi-théâtres  
**Technologies** : Node.js, Go, Rust, Docker, k6  

---

## 🗺 Structure Visuelle

```
StageOps-BenchMark/
│
├── 📄 Documentation
│   ├── README_BENCHMARK.md      ← Documentation principale
│   ├── QUICK_START.md           ← Démarrage rapide
│   ├── PROJECT_SUMMARY.md       ← Vue d'ensemble
│   ├── TECHNOLOGIES.md          ← Stack technique
│   ├── RESULTS_FORMAT.md        ← Format résultats
│   ├── INDEX.md                 ← Ce fichier
│   └── benchmark_report.md      ← Analyse finale
│
├── 🚀 Scripts Automatisation
│   ├── run_benchmark.sh         ← Benchmark complet
│   ├── quick_test.sh            ← Test rapide
│   └── check_prerequisites.sh   ← Vérification
│
├── 🐳 Configuration
│   ├── docker-compose.yml       ← Orchestration
│   ├── Makefile                 ← Commandes
│   └── .gitignore               ← Git
│
├── 💻 Services (6 microservices)
│   ├── nodejs-express/
│   ├── nodejs-fastify/
│   ├── go-fiber/
│   ├── go-gin/
│   ├── rust-actix/
│   └── rust-axum/
│
├── 🧪 Tests
│   └── k6-tests/
│       ├── load-test.js
│       ├── spike-test.js
│       └── stress-test.js
│
├── 📊 Analyse
│   └── analysis/
│       ├── generate_charts.py
│       └── requirements.txt
│
└── 📈 Résultats (généré)
    └── results/
        ├── *.json
        ├── *.csv
        ├── *.txt
        └── *.png
```

---

**Bon benchmark ! 🚀🎭**
