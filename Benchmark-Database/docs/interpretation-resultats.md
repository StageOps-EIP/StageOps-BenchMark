# Interprétation des Résultats

## Introduction

Ce document fournit un guide d'interprétation des résultats produits par le benchmark StageOps. Il explique comment lire les métriques, compare les technologies et présente les limites à prendre en compte.

---

## Format des résultats

Les résultats sont stockés dans le dossier `/results` en deux formats :

### JSON (détaillé)

```json
{
  "technology": "pouch",
  "scenario": "bulkInsert",
  "timestamp": "2026-03-04T10:30:00.000Z",
  "executionTimeMs": 245.67,
  "memoryUsageMB": 42.15,
  "latency": {
    "average": 0.0234,
    "median": 0.0189,
    "p95": 0.0567,
    "min": 0.0045,
    "max": 0.1234
  },
  "recordCount": 10000,
  "details": { ... }
}
```

### CSV (synthétique)

```
technology,scenario,timestamp,executionTimeMs,memoryUsageMB,recordCount,latencyAvg,latencyMedian,latencyP95,latencyMin,latencyMax
pouch,bulkInsert,2026-03-04T10:30:00.000Z,245.67,42.15,10000,0.0234,0.0189,0.0567,0.0045,0.1234
```

---

## Métriques clés

### 1. Temps d'exécution (`executionTimeMs`)

Le temps total pour compléter le scénario, en millisecondes.

**Comment interpréter :**
- Plus cette valeur est basse, meilleure est la performance
- Comparer entre technologies pour le même scénario
- Les résultats peuvent varier entre les exécutions ; prendre la médiane de plusieurs runs

### 2. Utilisation mémoire (`memoryUsageMB`)

La différence de mémoire heap entre le début et la fin du scénario.

**Comment interpréter :**
- Indique la consommation mémoire additionnelle de la technologie
- Important pour les appareils mobiles à mémoire limitée
- ⚠️ La mesure Node.js (`process.memoryUsage()`) peut inclure du bruit du garbage collector

### 3. Statistiques de latence

| Métrique | Description | Usage |
|----------|-------------|-------|
| **average** | Moyenne arithmétique | Vue d'ensemble |
| **median** | Valeur au 50e percentile | Résistante aux valeurs extrêmes |
| **p95** | Valeur au 95e percentile | Performance dans le pire cas raisonnable |
| **min** | Valeur minimale | Meilleur cas |
| **max** | Valeur maximale | Pire cas absolu |

**Comment interpréter :**
- La **médiane** est plus fiable que la moyenne (insensible aux outliers)
- Le **P95** indique la performance « dans la vraie vie » (5% des opérations sont plus lentes)
- Un grand écart entre médiane et P95 indique une **haute variance**

### 4. Nombre de deltas (`deltasProcessed`)

Le nombre de changements échangés pendant la synchronisation.

**Comment interpréter :**
- Plus ce nombre est faible, plus la synchronisation est efficace (moins de données transférées)
- Un nombre élevé peut indiquer que la technologie envoie des deltas granulaires
- Corrélé au temps de synchronisation

### 5. Cohérence (`isConsistent`)

Booléen indiquant si les stores local et distant sont identiques après synchronisation.

**Comment interpréter :**
- `true` = la synchronisation a réussi complètement
- `false` = des incohérences subsistent (problème potentiel)
- ⚠️ Pour PouchDB, `false` peut signifier que CouchDB n'est pas accessible

---

## Interprétation par scénario

### Scénario 1 : Insertion massive

**Questions clés :**
- Quelle technologie insère 10 000 enregistrements le plus rapidement ?
- La performance est-elle linéaire par rapport au nombre d'enregistrements ?
- L'utilisation mémoire est-elle raisonnable ?

**Critères de comparaison :**

| Critère | Excellent | Bon | Acceptable | Mauvais |
|---------|-----------|-----|------------|---------|
| Temps total (10k records) | < 100ms | < 500ms | < 2000ms | > 2000ms |
| Mémoire | < 50 Mo | < 100 Mo | < 200 Mo | > 200 Mo |
| Temps par record | < 0.01ms | < 0.05ms | < 0.2ms | > 0.2ms |

### Scénario 2 : Réconciliation offline

**Questions clés :**
- Combien de temps prend la réconciliation après 800 mutations ?
- Toutes les mutations sont-elles correctement synchronisées ?
- Le nombre de deltas est-il optimal ?

**Critères de comparaison :**

| Critère | Excellent | Bon | Acceptable | Mauvais |
|---------|-----------|-----|------------|---------|
| Temps de sync | < 200ms | < 1000ms | < 5000ms | > 5000ms |
| Deltas traités | = mutations | ~ mutations | > 2x mutations | >> mutations |
| Cohérence | ✅ 100% | ✅ 100% | ⚠️ > 99% | ❌ < 99% |

### Scénario 3 : Résolution de conflits

**Questions clés :**
- Les conflits sont-ils résolus de manière déterministe ?
- Les deux clients convergent-ils vers le même état ?
- Quel « gagnant » est choisi et est-ce le comportement attendu ?

**Critères de comparaison :**

| Critère | Excellent | Acceptable | Problématique |
|---------|-----------|------------|--------------|
| Taux de convergence | 100% | > 95% | < 95% |
| Déterminisme | ✅ Toujours | ✅ Toujours | ❌ Aléatoire |
| Perte de données | Aucune | Minimale (LWW) | Significative |

---

## Comparaison attendue des technologies

### Performances d'insertion

```
PouchDB         ████████████████████░░░░░ Rapide (opérations bulk natives)
WatermelonDB    █████████████████████████ Très rapide (Map en mémoire)
Ditto           ██████████████████░░░░░░░ Moyen (overhead CRDT)
```

**Explication :**
- **WatermelonDB** (simulé) utilise une `Map` JavaScript, donc très rapide en benchmarks
- **PouchDB** a des opérations bulk optimisées (`bulkDocs`)
- **Ditto** a un overhead pour créer les métadonnées CRDT (vecteurs de version, timestamps)

### Réconciliation

```
PouchDB         ████████████████░░░░░░░░░ Bon (protocole CouchDB optimisé)
WatermelonDB    █████████████████████████ Rapide (push/pull simple)
Ditto           ██████████████████████░░░ Bon (sync par delta via vecteurs)
```

### Fiabilité des conflits

```
PouchDB         █████████████████████████ Excellent (conflits préservés)
WatermelonDB    █████████████████░░░░░░░░ Acceptable (LWW, perte possible)
Ditto           ████████████████████████░ Très bon (CRDT, convergence prouvée)
```

---

## Limites du benchmark

### 1. Simulations vs. réalité

| Aspect | Benchmark | Production |
|--------|-----------|------------|
| WatermelonDB | Map en mémoire | SQLite natif + React Native |
| Ditto | Simulation CRDT | SDK Ditto propriétaire + réseau mesh |
| Réseau | Localhost Docker | 4G/WiFi variable |
| Stockage | Mémoire | Disque (IndexedDB, SQLite) |
| Contexte | Node.js mono-thread | Multi-thread natif |

### 2. Biais potentiels

- **Biais de mémoire** : l'adaptateur mémoire PouchDB est plus rapide que les adaptateurs persistants
- **Biais de simulation** : WatermelonDB et Ditto ne sont pas leurs implémentations réelles
- **Biais de réseau** : CouchDB en local élimine la latence réseau
- **Biais de charge** : un seul client, pas de charge concurrente sur le serveur
- **Biais temporel** : les timestamps JavaScript ont une résolution de ~1ms

### 3. Ce que le benchmark ne mesure PAS

- Performance d'interface utilisateur (React Native rendering)
- Consommation batterie sur appareil mobile
- Taille de stockage sur disque
- Comportement sous contrainte mémoire (appareils < 2 Go RAM)
- Performance avec des millions d'enregistrements
- Latence réseau réelle (3G, 4G, WiFi intermittent)

---

## Recommandations

### Choix retenu : PouchDB + CouchDB

À l'issue de ce benchmark et de l'analyse des besoins StageOps, la technologie retenue est **PouchDB + CouchDB**. Ce choix est motivé par :

1. **Protocole de réplication natif** — Pas de couche de synchronisation custom à développer. PouchDB et CouchDB partagent le même protocole de réplication incrémentale.

2. **Architecture cohérente web + mobile** — L'app web accède directement à CouchDB via son API REST (pas de mode offline nécessaire). L'app mobile utilise PouchDB (SQLite) pour le stockage local et la réplication offline. CouchDB sert de base de données centrale unique pour les deux plateformes.

3. **Gestion des conflits avec préservation des données** — Contrairement au LWW (WatermelonDB, Ditto) qui écrase silencieusement les données, CouchDB détecte les conflits et préserve les révisions concurrentes. Une logique métier custom peut ensuite fusionner les modifications.

4. **Open source et maturité** — Apache CouchDB (2005) et PouchDB (2012) sont open source, sans licence commerciale. Large communauté et support production disponible (IBM Cloudant).

5. **Coût d'intégration minimal** — Pas de SDK propriétaire, API REST standard, déploiement Docker simple.

> 📄 Voir la [justification complète du choix technologique](justification-choix-technologique.md) pour l'argumentation détaillée, l'architecture cible et les limites identifiées.

### Pourquoi pas les alternatives ?

| Technologie | Raison de non-sélection |
|---|---|
| **WatermelonDB** | Pas de support navigateur natif, nécessite un backend de sync custom, résolution de conflits LWW uniquement |
| **Ditto** | Licence commerciale obligatoire, SDK propriétaire, pas d'auto-hébergement possible |

### Prochaines étapes

1. Exécuter le benchmark PouchDB + CouchDB avec Docker (`npm run docker:up && npm run bench -- --tech pouch --all`)
2. Prototyper l'intégration PouchDB dans l'application mobile StageOps
3. Configurer la réplication filtrée (sync par projet/utilisateur)
4. Implémenter la logique de résolution de conflits métier
5. Tester sur le hardware cible (tablettes de chantier) avec latence réseau réelle

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **CRDT** | Conflict-free Replicated Data Type — structure de données convergente sans coordination |
| **LWW** | Last-Write-Wins — stratégie où le dernier écrit remplace les précédents |
| **Delta** | Changement incrémental entre deux états |
| **Tombstone** | Marqueur de suppression (le document reste mais est considéré comme supprimé) |
| **Vecteur de version** | Structure qui associe à chaque réplica son numéro de séquence le plus récent |
| **P95** | 95e percentile — 95% des valeurs sont inférieures à cette mesure |
| **Réplication** | Processus de copie des données entre bases de données |
| **Convergence** | État où toutes les répliques contiennent les mêmes données |
