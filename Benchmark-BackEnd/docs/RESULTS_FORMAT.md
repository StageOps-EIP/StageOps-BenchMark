# 📊 Structure des Résultats

Ce document explique la structure et le contenu des fichiers générés après l'exécution du benchmark.

---

## 📁 Dossier `results/`

Après exécution de `./run_benchmark.sh`, le dossier `results/` contiendra :

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

## 📄 Fichiers JSON

### Format : `{service}_summary.json`

Contient les métriques brutes k6 pour chaque service.

#### Structure Principale

```json
{
  "metrics": {
    "http_req_duration": { ... },
    "http_reqs": { ... },
    "http_req_failed": { ... },
    "data_received": { ... },
    "data_sent": { ... }
  },
  "root_group": { ... },
  "state": { ... }
}
```

#### Métriques Détaillées

##### http_req_duration (Latence)
```json
{
  "type": "trend",
  "values": {
    "avg": 125.45,      // Latence moyenne (ms)
    "min": 23.12,       // Latence minimale (ms)
    "max": 987.65,      // Latence maximale (ms)
    "med": 98.34,       // Médiane (ms)
    "p(90)": 234.56,    // 90e percentile (ms)
    "p(95)": 345.67,    // 95e percentile (ms)
    "p(99)": 678.90     // 99e percentile (ms)
  }
}
```

##### http_reqs (Requêtes)
```json
{
  "type": "counter",
  "count": 45678,       // Nombre total de requêtes
  "rate": 7613.2        // Requêtes par seconde (RPS)
}
```

##### http_req_failed (Échecs)
```json
{
  "type": "rate",
  "rate": 0.0012,       // Taux d'échec (0.12%)
  "passes": 45623,      // Requêtes réussies
  "fails": 55           // Requêtes échouées
}
```

##### data_received / data_sent
```json
{
  "type": "counter",
  "count": 12345678,    // Octets transférés
  "rate": 2057613.5     // Octets par seconde
}
```

---

## 📊 Fichier CSV

### Format : `benchmark_metrics.csv`

Tableau comparatif prêt pour Excel/Google Sheets.

#### Colonnes

| Colonne | Type | Description |
|---------|------|-------------|
| service | string | Nom du service |
| avg_latency | float | Latence moyenne (ms) |
| p95_latency | float | 95e percentile (ms) |
| p99_latency | float | 99e percentile (ms) |
| min_latency | float | Latence min (ms) |
| max_latency | float | Latence max (ms) |
| median_latency | float | Médiane (ms) |
| total_requests | int | Nombre total requêtes |
| rps | float | Requêtes/seconde |
| failed_rate | float | Taux échec (%) |
| data_received_mb | float | Données reçues (MB) |
| data_sent_mb | float | Données envoyées (MB) |

#### Exemple

```csv
service,avg_latency,p95_latency,p99_latency,rps,failed_rate
rust-actix,78.23,145.67,210.45,12450.5,0.01
rust-axum,82.11,152.34,225.89,11890.3,0.02
go-fiber,95.45,178.12,265.34,10230.8,0.05
go-gin,98.67,185.23,280.45,9850.2,0.08
nodejs-fastify,132.34,245.67,385.23,7340.5,0.15
nodejs-express,165.78,312.45,485.67,5920.3,0.28
```

---

## 📈 Graphiques PNG

### 1. `latency_comparison.png`

**Graphique** : Barres groupées (Moyenne, P95, P99)  
**Axe X** : Services  
**Axe Y** : Latence (ms)  
**Objectif** : Comparer les latences sous charge

**Interprétation** :
- Plus bas = meilleur
- P99 important pour SLA
- Écart P95-P99 indique stabilité

---

### 2. `throughput_comparison.png`

**Graphique** : Barres horizontales  
**Axe X** : RPS (Requêtes/seconde)  
**Axe Y** : Services  
**Objectif** : Comparer le débit maximal

**Interprétation** :
- Plus haut = meilleur
- Indicateur de scalabilité
- Capacité à gérer pics

---

### 3. `performance_matrix.png`

**Graphique** : Heatmap (matrice de chaleur)  
**Lignes** : Métriques (Latence, Débit, Échecs)  
**Colonnes** : Services  
**Objectif** : Vue d'ensemble normalisée

**Interprétation** :
- Vert = bon
- Rouge = mauvais
- Vue holistique des performances

---

### 4. `failure_rate.png`

**Graphique** : Barres avec seuil  
**Axe X** : Services  
**Axe Y** : Taux d'échec (%)  
**Seuil** : Ligne rouge à 1%  
**Objectif** : Vérifier la fiabilité

**Interprétation** :
- En dessous du seuil = bon
- Au-dessus = problème de stabilité

---

### 5. `comprehensive_comparison.png`

**Graphique** : Grille 2×2  
**Quadrants** :
- Haut gauche : Latence (Moy + P99)
- Haut droite : Débit (RPS)
- Bas gauche : Volume total
- Bas droite : Fiabilité (%)

**Objectif** : Vue complète en un coup d'œil

---

## 📝 Fichier Docker Stats

### Format : `docker_stats.txt`

Stats CPU/RAM des containers pendant les tests.

#### Structure

```
NAME                CPU %     MEM USAGE / LIMIT     MEM %
benchmark-express   185.3%    142.5MiB / 512MiB    27.83%
benchmark-fastify   180.7%    125.3MiB / 512MiB    24.47%
benchmark-fiber     175.2%    68.4MiB / 512MiB     13.36%
benchmark-gin       178.9%    72.1MiB / 512MiB     14.08%
benchmark-actix     165.4%    45.2MiB / 512MiB     8.83%
benchmark-axum      162.8%    48.7MiB / 512MiB     9.51%
```

#### Colonnes

- **NAME** : Nom du container
- **CPU %** : Utilisation CPU (max 200% pour 2 cores)
- **MEM USAGE** : RAM utilisée / limite
- **MEM %** : Pourcentage de la limite

---

## 🔍 Comment Analyser les Résultats

### 1. Vérifier les Fichiers JSON

```bash
# Voir latence P99 pour chaque service
jq '.metrics.http_req_duration.values["p(99)"]' results/*_summary.json
```

### 2. Ouvrir le CSV

```bash
# Dans un tableur
libreoffice results/benchmark_metrics.csv
# ou
open results/benchmark_metrics.csv
```

### 3. Visualiser les Graphiques

```bash
# Ouvrir tous les graphiques
xdg-open results/*.png  # Linux
open results/*.png      # macOS
start results/*.png     # Windows
```

### 4. Comparer les Stats Docker

```bash
# Trier par utilisation RAM
sort -k5 -n results/docker_stats.txt
```

---

## 📊 Métriques Clés à Regarder

### Performance Pure

1. **RPS (Throughput)** - Plus élevé = meilleur
   - Rust : 11,000-12,500
   - Go : 9,500-10,500
   - Node.js : 5,500-7,500

2. **Latence P99** - Plus bas = meilleur
   - Rust : 200-250ms
   - Go : 260-290ms
   - Node.js : 380-500ms

### Efficacité Ressources

3. **RAM sous charge** - Plus bas = meilleur
   - Rust : 45-50 MB
   - Go : 65-75 MB
   - Node.js : 120-145 MB

4. **CPU %** - Plus bas = meilleur (à RPS égal)
   - Rust : 160-165%
   - Go : 175-180%
   - Node.js : 180-185%

### Fiabilité

5. **Taux d'échec** - Doit rester < 1%
   - Tous : < 0.3%

---

## 🎯 Seuils de Performance

### Excellent
- ✅ RPS > 10,000
- ✅ P99 < 250ms
- ✅ RAM < 75 MB
- ✅ Échecs < 0.1%

### Bon
- ✅ RPS > 7,000
- ✅ P99 < 400ms
- ✅ RAM < 125 MB
- ✅ Échecs < 0.5%

### Acceptable
- ⚠️ RPS > 5,000
- ⚠️ P99 < 500ms
- ⚠️ RAM < 150 MB
- ⚠️ Échecs < 1%

### Problématique
- ❌ RPS < 5,000
- ❌ P99 > 500ms
- ❌ RAM > 150 MB
- ❌ Échecs > 1%

---

## 📤 Export & Partage

### Créer un Rapport PDF

```bash
# Avec Pandoc (si installé)
pandoc benchmark_report.md -o benchmark_report.pdf

# Ou copier dans Google Docs / Word
```

### Créer une Archive

```bash
# Archiver tous les résultats
tar -czf benchmark_results_$(date +%Y%m%d).tar.gz results/

# Ou ZIP
zip -r benchmark_results_$(date +%Y%m%d).zip results/
```

### Partager sur GitHub

```bash
git add results/*.png results/*.csv benchmark_report.md
git commit -m "Add benchmark results $(date +%Y-%m-%d)"
git push
```

---

## 🔄 Comparaison Temporelle

Pour comparer plusieurs exécutions :

```bash
# Renommer les résultats avec date
mv results results_$(date +%Y%m%d_%H%M)

# Exécuter à nouveau
./run_benchmark.sh

# Comparer
diff results_*/benchmark_metrics.csv
```

---

## 📧 Format pour Présentation

### Résumé Exécutif (Email)

```
Benchmark Backend Multi-Théâtres - Résultats

🥇 Rust Actix : 12,450 RPS | 78ms moy | 45 MB RAM
🥈 Go Fiber   : 10,230 RPS | 95ms moy | 68 MB RAM  ← Recommandé
🥉 Node Fastify: 7,340 RPS | 132ms moy | 125 MB RAM

Recommandation : Go (Fiber)
- Performance : 2x meilleure que Node.js
- Coûts : 50% d'économie sur infra
- Maintenabilité : Code simple et lisible

Voir rapport complet : benchmark_report.md
Graphiques : results/*.png
```

---

**Documentation complète** : Voir [README_BENCHMARK.md](./README_BENCHMARK.md)
