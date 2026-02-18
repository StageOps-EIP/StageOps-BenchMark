# 🚀 Guide de Démarrage Rapide

## En 3 étapes simples

### 1️⃣ Vérifier les prérequis
```bash
./check_prerequisites.sh
```

### 2️⃣ Test rapide (5 min)
```bash
./quick_test.sh
```

### 3️⃣ Benchmark complet (1h30)
```bash
./run_benchmark.sh
```

---

## 📦 Installation des Prérequis

### Docker
- **Linux**: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`
- **macOS/Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

### k6
- **Linux**: 
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```
- **macOS**: `brew install k6`
- **Windows**: `choco install k6`

### Python (généralement déjà installé)
- **Linux**: `sudo apt install python3 python3-pip`
- **macOS**: `brew install python3`
- **Windows**: [python.org/downloads](https://www.python.org/downloads/)

---

## 🎯 Commandes Essentielles

```bash
# Vérifier les prérequis
./check_prerequisites.sh

# Test rapide (5 minutes, 3 services)
./quick_test.sh

# Benchmark complet (1h30, tous les services)
./run_benchmark.sh

# Avec Make (si disponible)
make install    # Installer dépendances Python
make build      # Construire images Docker
make start      # Démarrer services
make test       # Lancer benchmark
make graphs     # Générer graphiques uniquement
make clean      # Nettoyer
```

---

## 📊 Résultats Attendus

Après le benchmark, vous aurez :

```
results/
├── nodejs-express_summary.json
├── nodejs-fastify_summary.json
├── go-fiber_summary.json
├── go-gin_summary.json
├── rust-actix_summary.json
├── rust-axum_summary.json
├── docker_stats.txt
├── benchmark_metrics.csv
├── latency_comparison.png
├── throughput_comparison.png
├── performance_matrix.png
├── failure_rate.png
└── comprehensive_comparison.png
```

---

## 🐛 Problèmes Courants

### "Docker not running"
```bash
# Linux
sudo systemctl start docker

# macOS/Windows
Ouvrir Docker Desktop
```

### "Port already in use"
```bash
# Trouver et tuer le processus
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows
```

### "k6 not found"
```bash
# Vérifier l'installation
k6 version

# Si absent, voir section Installation
```

---

## 📈 Interpréter les Résultats

### Bonnes Performances
- ✅ RPS > 5000
- ✅ Latence moyenne < 150ms
- ✅ P99 < 500ms
- ✅ Taux d'échec < 1%

### Métriques Clés à Regarder
1. **Throughput (RPS)** : Plus c'est élevé, mieux c'est
2. **Latence P99** : 99% des requêtes doivent être rapides
3. **Consommation RAM** : Plus c'est bas, mieux c'est
4. **Stabilité** : Taux d'échec doit rester < 1%

---

## 🎓 Prochaines Étapes

1. ✅ Exécuter le benchmark complet
2. ✅ Consulter [`benchmark_report.md`](./benchmark_report.md)
3. ✅ Analyser les graphiques dans `results/`
4. ✅ Choisir votre framework basé sur les résultats
5. ✅ Implémenter en production avec monitoring

---

## 📚 Documentation Complète

- [README_BENCHMARK.md](./README_BENCHMARK.md) - Documentation complète
- [benchmark_report.md](./benchmark_report.md) - Rapport d'analyse détaillé

---

**Questions ?** Consultez la section Troubleshooting dans le README principal.

**Bon benchmark ! 🚀**
