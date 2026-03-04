# Méthodologie de Benchmark

## Objectif

Ce benchmark a pour objectif d'évaluer et de comparer les performances de trois technologies de base de données offline-first dans le contexte du projet StageOps. L'évaluation porte sur leur capacité à :

1. **Insérer massivement des données** — Performance d'écriture en lot
2. **Réconcilier après une période offline** — Temps de synchronisation et fiabilité
3. **Résoudre les conflits** — Déterminisme et convergence des données

## Technologies évaluées

### PouchDB + CouchDB

- **Type** : Base de données document JSON
- **Synchronisation** : Réplication bidirectionnelle native (protocole CouchDB)
- **Résolution de conflits** : Arbre de révisions (_rev), conflit détecté automatiquement
- **Environnement** : PouchDB en mémoire (Node.js) + CouchDB via Docker

### WatermelonDB

- **Type** : Base de données réactive (SQLite en natif)
- **Synchronisation** : Protocole pull/push basé sur des timestamps
- **Résolution de conflits** : Last-write-wins (dernier écrit gagne) basé sur `updatedAt`
- **Note** : Simulé en Node.js car WatermelonDB nécessite React Native / SQLite natif

### Ditto (CRDT)

- **Type** : Base de données peer-to-peer
- **Synchronisation** : Synchronisation par delta basée sur des vecteurs de version
- **Résolution de conflits** : LWW-Register CRDT (registre à dernier écrit gagne) avec tie-break déterministe
- **Note** : Simulé car Ditto nécessite une licence commerciale

## Protocole de test

### Environnement d'exécution

| Paramètre | Valeur |
|-----------|--------|
| Runtime | Node.js + TypeScript |
| Mode PouchDB | Adaptateur mémoire (`pouchdb-adapter-memory`) |
| CouchDB | Docker, version 3.3 |
| Nombre d'enregistrements | 10 000 |
| Taille approximative par enregistrement | ~1 Ko |

### Scénario 1 : Insertion massive (Bulk Insert)

**Procédure :**
1. Générer 10 000 enregistrements avec le générateur partagé
2. Insérer tous les enregistrements en une seule opération bulk
3. Mesurer le temps d'exécution total
4. Échantillonner 100 lectures individuelles pour les statistiques de latence

**Métriques collectées :**
- Temps total d'insertion (ms)
- Temps moyen par enregistrement (ms)
- Utilisation mémoire (Mo)
- Latence de lecture : moyenne, médiane, P95

### Scénario 2 : Réconciliation après période offline

**Procédure :**
1. Synchronisation initiale : insertion de 10 000 enregistrements
2. Passage en mode offline
3. Application de mutations locales :
   - 500 mises à jour
   - 200 insertions
   - 100 suppressions
4. Simulation d'une fenêtre offline de 30 minutes (accélérée)
5. Reconnexion et mesure du temps de synchronisation complète
6. Vérification de la cohérence des données

**Métriques collectées :**
- Temps de synchronisation (ms)
- Nombre de deltas traités
- Cohérence finale (booléen)
- Temps d'application des mutations (ms)
- Vérification par échantillonnage des modifications/insertions/suppressions

### Scénario 3 : Résolution de conflits

**Procédure :**
1. Générer 1 000 enregistrements partagés
2. Créer deux clients (A et B) avec le même jeu de données
3. Les deux clients passent offline
4. Client A modifie 200 enregistrements (marqueur "clientA")
5. Client B modifie les mêmes 200 enregistrements (marqueur "clientB", légèrement plus tard)
6. Les deux clients se reconnectent et synchronisent
7. Vérifier que les données convergent de manière déterministe

**Métriques collectées :**
- Nombre d'enregistrements convergés vs divergés
- Taux de convergence (%)
- Déterminisme de la résolution (booléen)
- Identification du "gagnant" (quel client a gagné)
- Temps de synchronisation par client

## Schéma des enregistrements

```typescript
interface BenchmarkRecord {
  id: string;            // Identifiant unique (UUID v4)
  projectId: string;     // Identifiant du projet
  type: "incident" | "equipment" | "log";  // Type d'enregistrement
  payload: object;       // Données utiles (~1 Ko)
  updatedAt: number;     // Timestamp de dernière modification
  version: number;       // Numéro de version
}
```

## Générateur de données

Le générateur crée des enregistrements réalistes avec :

- **20 projets distincts** répartis uniformément
- **3 types** d'enregistrements en rotation
- **Payload structuré** : titre, description, statut, priorité, géolocalisation, tags, métadonnées
- **Remplissage** : chaînes aléatoires pour atteindre ~1 Ko par enregistrement

## Conditions de reproductibilité

- Les IDs sont générés avec UUID v4 (non déterministe par conception)
- Les timestamps utilisent `Date.now()` au moment de la génération
- Pour obtenir des résultats comparables : exécuter les benchmarks sur la même machine, dans les mêmes conditions
- Exécuter plusieurs itérations et prendre la médiane pour réduire la variance

## Limites méthodologiques

1. **WatermelonDB simulé** : Le benchmark ne capture pas les performances réelles de SQLite natif ni du lazy loading React Native
2. **Ditto simulé** : La simulation CRDT n'utilise pas le réseau mesh réel de Ditto ni son moteur de stockage propriétaire
3. **PouchDB en mémoire** : L'adaptateur mémoire est plus rapide que LevelDB ou IndexedDB
4. **Réseau local** : CouchDB tourne en local (Docker), pas de latence réseau réelle
5. **Mono-thread** : Node.js exécute tout en mono-thread, ce qui ne reflète pas les performances multi-thread natives
