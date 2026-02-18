# 🎭 StageOps Backend Benchmark

> Comparaison exhaustive de frameworks backend : **Node.js vs Go vs Rust**

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](./results)
[![Benchmark](https://img.shields.io/badge/benchmark-completed-blue)](./RESULTS_SUMMARY.md)

---

## 📊 Résultats Clés

### 🏆 Gagnant : **Go Fiber**

| Framework | RPS | Latence Moy. | P95 | Consommation RAM | Verdict |
|-----------|-----|--------------|-----|------------------|---------|
| **🥇 Go Fiber** | **1,173** | **0.28 ms** | **0.52 ms** | 204.77 MB | ⭐⭐⭐⭐⭐ |
| 🥈 Rust Actix | 1,153 | 0.27 ms | 0.53 ms | 207.33 MB | ⭐⭐⭐⭐⭐ |
| 🥉 Rust Axum | 1,153 | 0.29 ms | 0.52 ms | 207.44 MB | ⭐⭐⭐⭐⭐ |
| Node.js Fastify | 1,169 | 0.32 ms | 0.55 ms | 258.42 MB | ⭐⭐⭐⭐ |
| Go Gin | 1,162 | 0.35 ms | 0.70 ms | 216.75 MB | ⭐⭐⭐⭐ |
| Node.js Express | 1,181 | 0.41 ms | 0.81 ms | 311.34 MB | ⭐⭐⭐ |

📖 **[Voir le récapitulatif complet des résultats →](./RESULTS_SUMMARY.md)**

---

## 🎯 Recommandation

### Pour Production : **Go Fiber** 🏆

**Pourquoi ?**
- ✅ Meilleur équilibre performance/simplicité
- ✅ Latence ultra-faible (0.28 ms moyenne)
- ✅ Consommation mémoire optimale (-34% vs Express)
- ✅ Courbe d'apprentissage douce
- ✅ 0% d'échecs sous charge

**ROI Estimé** (1M requêtes/jour)
- 💰 Économie : **$120/mois** sur infrastructure
- 🚀 Performance : **36% plus rapide** qu'Express
- 📉 Serveurs nécessaires : **-33%**

---

## 🚀 Quick Start

### Prérequis

- Docker & Docker Compose
- k6 (outil de load testing)
- Make (optionnel)

### 1️⃣ Cloner et construire

```bash
git clone <repo-url>
cd StageOps-BenchMark

# Construire tous les services
make build
# ou: docker-compose build
```

### 2️⃣ Lancer un test rapide

```bash
make quick-test
# ou: bash scripts/quick_test.sh
```

### 3️⃣ Benchmark complet

```bash
make test
# ou: bash scripts/run_benchmark.sh
```

### 4️⃣ Générer les graphiques

```bash
make graphs
# ou: cd analysis && python3 generate_charts.py
```

---

## 📁 Structure du Projet

```
StageOps-BenchMark/
├── 📄 README.md                    # Ce fichier
├── 📊 RESULTS_SUMMARY.md           # ⭐ Récapitulatif des résultats
├── 🐳 docker-compose.yml           # Configuration Docker
├── 📝 Makefile                     # Commandes simplifiées
│
├── 📂 services/                    # Implémentations des frameworks
│   ├── nodejs-express/
│   ├── nodejs-fastify/
│   ├── go-fiber/
│   ├── go-gin/
│   ├── rust-actix/
│   └── rust-axum/
│
├── 📂 k6-tests/                    # Scripts de test k6
│   ├── load-test.js
│   ├── stress-test.js
│   └── spike-test.js
│
├── 📂 scripts/                     # Scripts d'exécution
│   ├── run_benchmark.sh
│   ├── quick_test.sh
│   ├── test_single_service.sh
│   └── check_prerequisites.sh
│
├── 📂 results/                     # Résultats des benchmarks
│   ├── benchmark_metrics.csv
│   ├── *_summary.json
│   └── *.png (graphiques)
│
├── 📂 analysis/                    # Analyse et graphiques
│   ├── generate_charts.py
│   └── requirements.txt
│
└── 📂 docs/                        # Documentation détaillée
    ├── QUICK_START.md
    ├── benchmark_report.md
    ├── TECHNOLOGIES.md
    └── ...
```

---

## 🛠️ Commandes Utiles

```bash
# Vérifier les prérequis
make check

# Construire les images
make build

# Démarrer tous les services
make start

# Vérifier le statut
make status

# Test rapide (5 min)
make quick-test

# Benchmark complet (11 min par service)
make test

# Tester un service spécifique
make test-single SERVICE=express PORT=3001

# Générer les graphiques
make graphs

# Voir les logs
make logs

# Arrêter tout
make stop

# Nettoyer
make clean
```

---

## 📈 Métriques Mesurées

- **RPS** : Requêtes par seconde
- **Latence moyenne** : Temps de réponse moyen
- **P95/P99** : 95ème et 99ème percentiles
- **Taux d'échec** : Pourcentage de requêtes échouées
- **Consommation RAM** : Mémoire utilisée
- **Consommation CPU** : Utilisation processeur

---

## 🎭 Endpoints Testés

Chaque service implémente les mêmes endpoints :

```
GET  /health         - Health check
GET  /users          - Liste des utilisateurs
GET  /users/:id      - Détail utilisateur
POST /users          - Créer un utilisateur
GET  /events         - Liste des événements
GET  /events/:id     - Détail événement
POST /events         - Créer un événement
```

---

## 📚 Documentation

- 📊 **[Résultats complets](./RESULTS_SUMMARY.md)** - Analyse détaillée et recommandations
- 🚀 **[Quick Start](./docs/QUICK_START.md)** - Guide de démarrage rapide
- 📖 **[Rapport complet](./docs/benchmark_report.md)** - Benchmark détaillé
- 🔧 **[Technologies](./docs/TECHNOLOGIES.md)** - Détails techniques
- ✅ **[Checklist](./docs/CHECKLIST.md)** - Liste de vérification

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT.

---

## 📞 Contact

Pour toute question ou suggestion :
- 📧 Email: benchmark@stageops.com
- 🐛 Issues: [GitHub Issues](../../issues)

---

**Dernière mise à jour** : 18 Février 2026  
**Version** : 1.0.0
