# 🧭 Guide de Navigation - StageOps Benchmark

## 📚 Pour Lire les Résultats

### 🏆 Je veux voir les résultats rapidement
👉 Commence par **[RESULTS_SUMMARY.md](./RESULTS_SUMMARY.md)**
- Classement des frameworks
- Recommandation claire (Go Fiber)
- ROI calculé
- Prochaines étapes

### 📊 Je veux tous les détails
👉 Consulte **[docs/benchmark_report.md](./docs/benchmark_report.md)**
- Méthodologie complète
- Graphiques détaillés
- Analyse approfondie

---

## 🚀 Pour Lancer les Tests

### ⚡ Test Rapide (5 minutes)
```bash
make build
make quick-test
```

### 🔬 Benchmark Complet (1-2 heures)
```bash
make build
make test
```

### 🎯 Tester un seul service
```bash
make start
make test-single SERVICE=express PORT=3001
```

👉 Guide détaillé: **[docs/QUICK_START.md](./docs/QUICK_START.md)**

---

## 🛠️ Pour Contribuer

### Je veux ajouter un nouveau framework
1. Crée un dossier dans `services/mon-framework/`
2. Implémente les mêmes endpoints (voir README)
3. Ajoute le service dans `docker-compose.yml`
4. Lance `make test`

### Je veux améliorer les scripts
👉 Regarde dans **[scripts/](./scripts/)**
- `run_benchmark.sh` - Script principal
- `quick_test.sh` - Test rapide
- `test_single_service.sh` - Test unitaire
- `check_prerequisites.sh` - Vérification prérequis

### Je veux modifier les graphiques
👉 Édite **[analysis/generate_charts.py](./analysis/generate_charts.py)**

---

## 📖 Documentation par Thème

### Performance & Résultats
- [RESULTS_SUMMARY.md](./RESULTS_SUMMARY.md) - **⭐ Résultats complets**
- [results/benchmark_metrics.csv](./results/benchmark_metrics.csv) - Données brutes
- [docs/benchmark_report.md](./docs/benchmark_report.md) - Rapport détaillé

### Configuration & Setup
- [README.md](./README.md) - Vue d'ensemble
- [docs/QUICK_START.md](./docs/QUICK_START.md) - Démarrage rapide
- [docker-compose.yml](./docker-compose.yml) - Config Docker
- [Makefile](./Makefile) - Commandes simplifiées

### Détails Techniques
- [docs/TECHNOLOGIES.md](./docs/TECHNOLOGIES.md) - Stack technique
- [docs/PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md) - Architecture
- [docs/RESULTS_FORMAT.md](./docs/RESULTS_FORMAT.md) - Format des données

### Planification
- [docs/CHECKLIST.md](./docs/CHECKLIST.md) - Liste de vérification
- [docs/INDEX.md](./docs/INDEX.md) - Index complet
- [CHANGELOG.md](./CHANGELOG.md) - Historique des changements

---

## 🎯 Cas d'Usage

### "Je suis chef de projet, quel framework choisir ?"
👉 **[RESULTS_SUMMARY.md](./RESULTS_SUMMARY.md)** section "Recommandations"
- **Go Fiber** pour production générale
- **Rust Actix** pour performance extrême
- **Node.js Fastify** pour équipes JavaScript

### "Je suis développeur, comment démarrer ?"
```bash
# 1. Clone
git clone <repo>
cd StageOps-BenchMark

# 2. Construis
make build

# 3. Test rapide
make quick-test

# 4. Explore
cat RESULTS_SUMMARY.md
```

### "Je veux comprendre la méthodologie"
👉 **[docs/benchmark_report.md](./docs/benchmark_report.md)**
- Environnement de test
- Scénarios de charge
- Métriques mesurées

### "Je veux voir le code source"
👉 **[services/](./services/)**
- `services/go-fiber/` - Implementation Go Fiber
- `services/rust-actix/` - Implementation Rust Actix
- `services/nodejs-express/` - Implementation Express
- etc.

---

## 🔍 Commandes Utiles

```bash
# Voir la structure
tree -L 2

# Vérifier prérequis
make check

# Construire
make build

# Démarrer services
make start

# Statut
make status

# Test rapide
make quick-test

# Benchmark complet
make test

# Graphiques
make graphs

# Logs
make logs

# Arrêter
make stop

# Nettoyer
make clean
```

---

## 📞 Besoin d'Aide ?

1. 📖 Lis le [README.md](./README.md)
2. ⚡ Suis le [QUICK_START.md](./docs/QUICK_START.md)
3. 📊 Consulte [RESULTS_SUMMARY.md](./RESULTS_SUMMARY.md)
4. ✅ Vérifie la [CHECKLIST.md](./docs/CHECKLIST.md)
5. 🐛 Ouvre une [Issue GitHub](../../issues)

---

## 🎓 Flux de Travail Recommandé

```
1. Lire README.md (5 min)
   ↓
2. Lire RESULTS_SUMMARY.md (10 min)
   ↓
3. make build (5 min)
   ↓
4. make quick-test (5 min)
   ↓
5. Analyser les résultats
   ↓
6. [Optionnel] make test (1-2h)
   ↓
7. Décider du framework à utiliser
```

---

**Version**: 1.0  
**Dernière mise à jour**: 18 Février 2026
