# StageOps Benchmark — Base de Données Offline-First

## Présentation

Ce dépôt contient une suite complète de benchmarks pour évaluer les technologies de synchronisation de bases de données offline-first dans le cadre du projet EIP **StageOps**.

StageOps est une plateforme de gestion opérationnelle de chantier. Les opérateurs doivent pouvoir travailler sans connexion réseau et synchroniser leurs données une fois la connectivité rétablie. Ce benchmark compare trois technologies candidates.

## Choix technologique retenu

> **PouchDB + CouchDB** a été retenu comme solution de base de données pour StageOps.
>
> **CouchDB** sert de base de données centrale — l'application web y accède directement via l'API REST. **PouchDB** assure la réplication locale sur l'application mobile (SQLite) pour le fonctionnement offline sur le terrain.
>
> 📄 [Lire la justification complète →](docs/justification-choix-technologique.md)

## Technologies comparées

| Technologie | Type | Résolution de conflits | Statut |
|-------------|------|----------------------|--------|
| **PouchDB + CouchDB** | Document store + réplication | Arbre de révisions (_rev) | ✅ **Retenu** |
| **WatermelonDB** | Réactif (SQLite) + pull/push | Last-Write-Wins (updatedAt) | ⚠️ Simulé (nécessite React Native) |
| **Ditto** | Peer-to-peer CRDT | LWW-Register + vecteurs de version | ⚠️ Simulé (licence commerciale requise) |

## Installation

### Prérequis

- **Node.js** >= 18
- **npm** >= 9
- **Docker** et **Docker Compose** (pour CouchDB)

### Installation des dépendances

```bash
cd Benchmark-Database
npm install
```

### Démarrage de CouchDB (Docker)

```bash
npm run docker:up
```

Cela démarre CouchDB sur `http://localhost:5984` avec les identifiants :
- **Utilisateur** : `admin`
- **Mot de passe** : `password`

Pour arrêter CouchDB :

```bash
npm run docker:down
```

## Comment lancer les tests

### Exécuter un benchmark spécifique

```bash
# Syntaxe
npm run bench -- --tech <pouch|watermelon|ditto> --scenario <bulkInsert|reconcile|conflict>

# Exemples
npm run bench -- --tech pouch --scenario bulkInsert
npm run bench -- --tech watermelon --scenario reconcile
npm run bench -- --tech ditto --scenario conflict
```

### Exécuter tous les benchmarks

```bash
npm run bench -- --all
```

### Options supplémentaires

```bash
npm run bench -- --tech pouch --scenario bulkInsert --verbose  # Logs détaillés
npm run bench -- --all --quiet                                  # Logs minimaux
```

## Structure du projet

```
Benchmark-Database/
├── package.json                    # Dépendances et scripts
├── tsconfig.json                   # Configuration TypeScript (strict)
├── .eslintrc.json                  # Configuration ESLint
├── .prettierrc                     # Configuration Prettier
├── docker-compose.yml              # CouchDB pour PouchDB
│
├── src/
│   ├── index.ts                    # Point d'entrée CLI
│   ├── types/
│   │   ├── index.ts                # Types partagés et BenchmarkResult
│   │   └── record.ts               # Schéma BenchmarkRecord
│   ├── generator/
│   │   └── dataset.ts              # Générateur de 10 000 enregistrements
│   ├── adapters/
│   │   ├── base.ts                 # Interface IBenchmarkAdapter
│   │   ├── pouch/
│   │   │   └── index.ts            # Adaptateur PouchDB + CouchDB
│   │   ├── watermelon/
│   │   │   └── index.ts            # Adaptateur WatermelonDB (simulé)
│   │   └── ditto/
│   │       └── index.ts            # Adaptateur Ditto CRDT (simulé)
│   ├── scenarios/
│   │   ├── bulk-insert.ts          # Scénario : insertion massive
│   │   ├── reconcile.ts            # Scénario : réconciliation offline
│   │   └── conflict.ts             # Scénario : résolution de conflits
│   ├── reporter/
│   │   └── index.ts                # Export JSON + CSV
│   └── utils/
│       ├── metrics.ts              # Mesure de performance et statistiques
│       └── logger.ts               # Logger coloré
│
├── results/                        # Résultats des benchmarks (JSON + CSV)
│   └── .gitkeep
│
└── docs/                           # Documentation (en français)
    ├── README.md                   # Index de la documentation
    ├── methodologie-benchmark.md   # Protocole et méthodologie de test
    ├── cycle-synchronisation.md    # Diagrammes Mermaid du cycle de sync
    ├── tests-mode-degrade.md       # Tests en mode offline
    └── interpretation-resultats.md # Guide d'interprétation des métriques
```

## Description des scénarios

### 1. Insertion massive (`bulkInsert`)

Insère **10 000 enregistrements** (~1 Ko chacun) en une seule opération et mesure :
- Temps total d'insertion
- Temps moyen par enregistrement
- Latence de lecture (échantillon de 100 records)
- Utilisation mémoire

### 2. Réconciliation après période offline (`reconcile`)

Simule un client déconnecté pendant **30 minutes** avec :
- 500 mises à jour locales
- 200 insertions locales
- 100 suppressions locales

Puis mesure après reconnexion :
- Temps de synchronisation complète
- Nombre de deltas traités
- Vérification de cohérence des données

### 3. Résolution de conflits (`conflict`)

Deux clients modifient les **mêmes 200 enregistrements** pendant qu'ils sont déconnectés :
- Client A applique ses modifications
- Client B applique des modifications différentes sur les mêmes records

Après reconnexion, vérifie :
- Taux de convergence (les deux clients ont les mêmes données ?)
- Déterminisme (le même « gagnant » est toujours choisi ?)
- Identification de la stratégie de résolution

## Résultats

Les résultats sont générés dans le dossier `/results` :

| Format | Contenu |
|--------|---------|
| **JSON** | Résultat complet avec détails par scénario |
| **CSV** | Résumé tabulaire pour import dans Excel/Sheets |
| **Console** | Tableau récapitulatif affiché en fin d'exécution |

### Métriques mesurées

- **Temps d'exécution** (ms)
- **Utilisation mémoire** (Mo)
- **Latence** : moyenne, médiane, P95, min, max
- **Deltas traités** (pour les scénarios de synchronisation)
- **Cohérence finale** (booléen)

## Limitations techniques

1. **WatermelonDB simulé** — WatermelonDB nécessite React Native et SQLite natif. L'adaptateur simule le protocole de synchronisation pull/push avec une Map en mémoire.

2. **Ditto simulé** — Ditto nécessite une licence commerciale. L'adaptateur implémente une simulation fidèle des CRDT (LWW-Register + vecteurs de version) avec une documentation complète du comportement de résolution de conflits.

3. **PouchDB en mémoire** — L'adaptateur utilise `pouchdb-adapter-memory` pour le benchmark. Les performances réelles avec IndexedDB ou LevelDB seront différentes.

4. **Réseau local** — CouchDB tourne en local via Docker. La latence réseau réelle n'est pas prise en compte.

5. **Mono-thread** — Node.js est mono-thread. Les performances multi-thread des SDK natifs ne sont pas reflétées.

## Documentation

La documentation détaillée est disponible dans le dossier [`docs/`](docs/README.md) :

- [Méthodologie de benchmark](docs/methodologie-benchmark.md)
- [Cycle de synchronisation](docs/cycle-synchronisation.md) (avec diagrammes Mermaid)
- [Tests en mode dégradé](docs/tests-mode-degrade.md)
- [Interprétation des résultats](docs/interpretation-resultats.md)
- **[Justification du choix technologique](docs/justification-choix-technologique.md)** — Argumentation PouchDB + CouchDB

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run bench` | Lancer un benchmark |
| `npm run build` | Compiler TypeScript |
| `npm run lint` | Vérifier le code avec ESLint |
| `npm run format` | Formater le code avec Prettier |
| `npm run docker:up` | Démarrer CouchDB |
| `npm run docker:down` | Arrêter CouchDB |

## Licence

Projet interne — EIP StageOps, EPITECH
