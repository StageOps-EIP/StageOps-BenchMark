# 🎭 StageOps Backend Benchmark

Benchmark comparatif des performances backend entre **Node.js**, **Go** et **Rust** pour une architecture API scalable multi-théâtres.

## 🎯 Objectif

Évaluer le meilleur framework pour gérer des pics de charge importants (ex : ouverture de spectacle avec 1000+ utilisateurs simultanés) en mesurant :
- **RPS** (Requests Per Second)
- **Latence** (P50, P95, P99)
- **Consommation RAM** sous charge
- **Stabilité** lors de pics de connexions

## 🏗 Architecture

```
services/
├── nodejs-express/    → Express.js API
├── nodejs-fastify/    → Fastify API
├── go-fiber/          → Go Fiber API
├── go-gin/            → Go Gin API
├── rust-actix/        → Rust Actix-web API
└── rust-axum/         → Rust Axum API

k6-tests/              → Scripts de test de charge k6
results/               → Résultats bruts et graphiques
analysis/              → Scripts Python pour visualisation
```

## 🚀 Quick Start

### Prérequis

- **Docker** & **Docker Compose** (ou Docker Desktop)
- **k6** - [Installation](https://k6.io/docs/get-started/installation/)
- **Python 3.8+** avec pip

### Installation k6

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**macOS:**
```bash
brew install k6
```

**Windows:**
```powershell
choco install k6
```

### Exécution Automatique

```bash
# Rendre le script exécutable
chmod +x run_benchmark.sh

# Lancer le benchmark complet
./run_benchmark.sh
```

Ce script va automatiquement :
1. ✅ Construire toutes les images Docker
2. ✅ Démarrer les 6 services
3. ✅ Exécuter les tests k6 sur chaque service
4. ✅ Collecter les métriques Docker
5. ✅ Générer les graphiques comparatifs
6. ✅ Arrêter tous les services

**Durée estimée** : ~1h30 (dépend de votre machine)

## 📊 Résultats

Après l'exécution, vous trouverez dans le dossier `results/` :

### Fichiers JSON
- `nodejs-express_summary.json` - Métriques brutes Express
- `nodejs-fastify_summary.json` - Métriques brutes Fastify
- `go-fiber_summary.json` - Métriques brutes Fiber
- `go-gin_summary.json` - Métriques brutes Gin
- `rust-actix_summary.json` - Métriques brutes Actix
- `rust-axum_summary.json` - Métriques brutes Axum
- `docker_stats.txt` - Stats CPU/RAM des containers

### Graphiques PNG
- `latency_comparison.png` - Comparaison des latences
- `throughput_comparison.png` - Comparaison du débit (RPS)
- `performance_matrix.png` - Matrice de performance
- `failure_rate.png` - Taux d'échec
- `comprehensive_comparison.png` - Vue d'ensemble complète

### Données CSV
- `benchmark_metrics.csv` - Toutes les métriques au format tableur

## 📈 Analyse

Consultez le rapport complet dans [`benchmark_report.md`](./benchmark_report.md) pour :
- Tableaux récapitulatifs des métriques
- Analyse des compromis (performance vs productivité)
- Recommandation finale justifiée
- Conseils d'implémentation

## 🛠 Commandes Utiles

### Tests Manuels

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f

# Tester un service manuellement
curl http://localhost:3001/health  # Express
curl http://localhost:3002/health  # Fastify
curl http://localhost:3003/health  # Fiber
curl http://localhost:3004/health  # Gin
curl http://localhost:3005/health  # Actix
curl http://localhost:3006/health  # Axum

# Lancer k6 sur un service spécifique
k6 run --env BASE_URL="http://localhost:3001" --env SERVICE_NAME="nodejs-express" k6-tests/load-test.js

# Arrêter tous les services
docker-compose down
```

### Rebuild des Images

```bash
# Rebuild toutes les images
docker-compose build --no-cache

# Rebuild un service spécifique
docker-compose build --no-cache nodejs-express
```

### Analyser les Résultats

```bash
# Générer uniquement les graphiques (après avoir les résultats)
cd analysis
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 generate_charts.py
```

## 🔧 Configuration

### Modifier les Limites de Ressources

Éditez `docker-compose.yml` :

```yaml
deploy:
  resources:
    limits:
      cpus: '2'      # Modifier le nombre de CPUs
      memory: 512M   # Modifier la RAM
```

### Modifier les Scénarios de Test

Éditez `k6-tests/load-test.js` :

```javascript
export const options = {
  scenarios: {
    load: {
      stages: [
        { duration: '1m', target: 100 },   // Adapter les valeurs
        { duration: '2m', target: 500 },
        { duration: '3m', target: 1000 },  // Pic
      ],
    },
  },
};
```

## 📋 Services Endpoints

Tous les services exposent les mêmes endpoints :

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Status du service |
| GET | `/users` | Liste des utilisateurs |
| GET | `/users/:id` | Détail d'un utilisateur |
| POST | `/users` | Créer un utilisateur |
| GET | `/events` | Liste des événements |
| GET | `/events/:id` | Détail d'un événement |
| POST | `/events` | Créer un événement |

### Exemples de Requêtes

```bash
# Health check
curl http://localhost:3001/health

# Liste des utilisateurs
curl http://localhost:3001/users

# Créer un utilisateur
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"David","email":"david@theatre.com"}'

# Détail d'un événement
curl http://localhost:3001/events/1
```

## 🧪 Tests Disponibles

### 1. Load Test (Principal)
- **Fichier** : `k6-tests/load-test.js`
- **Durée** : 11 minutes
- **Pic** : 1000 utilisateurs simultanés
- **Objectif** : Mesurer les performances sous charge réaliste

### 2. Spike Test
- **Fichier** : `k6-tests/spike-test.js`
- **Durée** : 3 minutes
- **Pic** : 1000 req/s instantané
- **Objectif** : Tester la résilience face à un pic soudain

### 3. Stress Test
- **Fichier** : `k6-tests/stress-test.js`
- **Durée** : 10 minutes
- **Charge** : 100 utilisateurs constants
- **Objectif** : Tester la stabilité long terme

## 🐛 Troubleshooting

### Erreur "Cannot connect to Docker"
```bash
# Vérifier que Docker est démarré
sudo systemctl start docker  # Linux
# ou ouvrir Docker Desktop (macOS/Windows)
```

### k6 non trouvé
```bash
# Vérifier l'installation
k6 version

# Réinstaller si nécessaire (voir section Installation)
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows

# Arrêter le processus ou changer le port dans docker-compose.yml
```

### Services ne démarrent pas
```bash
# Voir les logs d'erreur
docker-compose logs

# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Python : Module non trouvé
```bash
# Réinstaller les dépendances
cd analysis
pip install -r requirements.txt
```

## 📦 Structure des Fichiers

```
StageOps-BenchMark/
├── services/
│   ├── nodejs-express/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── nodejs-fastify/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── go-fiber/
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── main.go
│   ├── go-gin/
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── main.go
│   ├── rust-actix/
│   │   ├── Dockerfile
│   │   ├── Cargo.toml
│   │   └── src/main.rs
│   └── rust-axum/
│       ├── Dockerfile
│       ├── Cargo.toml
│       └── src/main.rs
├── k6-tests/
│   ├── load-test.js
│   ├── spike-test.js
│   └── stress-test.js
├── analysis/
│   ├── generate_charts.py
│   └── requirements.txt
├── results/               (généré après tests)
├── docker-compose.yml
├── run_benchmark.sh
├── benchmark_report.md
└── README.md
```

## 🤝 Contribution

Pour améliorer ce benchmark :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/improvement`)
3. Commit les changements (`git commit -m 'Add improvement'`)
4. Push la branche (`git push origin feature/improvement`)
5. Ouvrir une Pull Request

## 📝 License

MIT License - Libre d'utilisation pour vos projets

## 📧 Contact

**Projet** : StageOps Backend Benchmark  
**Objectif** : Architecture API Multi-Théâtres  
**Contexte** : Évaluation technique pour scalabilité

---

## 🎓 Apprentissages Clés

Ce benchmark vous permet de comprendre :

✅ **Performance** : Impact réel des choix technologiques  
✅ **Scalabilité** : Comportement sous charge extrême  
✅ **Trade-offs** : Compromis performance/productivité  
✅ **Docker** : Isolation et limitation des ressources  
✅ **k6** : Tests de charge professionnels  
✅ **DevOps** : Automatisation et monitoring  

---

**Bon benchmark ! 🚀**
