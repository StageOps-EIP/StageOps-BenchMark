# Cycle de Synchronisation

## Vue d'ensemble

Ce document décrit le cycle de synchronisation implémenté par chaque technologie benchmarkée. Des diagrammes Mermaid illustrent le flux de données, les états possibles et les mécanismes de résolution de conflits.

---

## Diagramme global du cycle de synchronisation

```mermaid
sequenceDiagram
    participant Client as 📱 Client (Local DB)
    participant Queue as 📋 File de mutations
    participant Sync as 🔄 Moteur de sync
    participant Server as ☁️ Serveur (Remote DB)

    Note over Client,Server: Phase 1 — Mode connecté
    Client->>Server: Synchronisation initiale (pull)
    Server-->>Client: Données complètes

    Note over Client,Server: Phase 2 — Passage offline
    Client->>Client: Détection perte de connexion
    Client->>Queue: Les mutations sont mises en file d'attente

    Note over Client,Server: Phase 3 — Mode offline
    loop Mutations locales
        Client->>Client: INSERT / UPDATE / DELETE
        Client->>Queue: Enregistrement de chaque mutation
    end

    Note over Client,Server: Phase 4 — Reconnexion
    Client->>Client: Détection retour de connexion
    Queue->>Sync: Envoi des mutations en attente
    Sync->>Server: Push des changements locaux
    Server-->>Sync: Pull des changements distants
    Sync->>Sync: Résolution des conflits
    Sync-->>Client: État final convergé

    Note over Client,Server: Phase 5 — Vérification
    Client->>Server: Vérification de cohérence
    Server-->>Client: ✅ Données identiques
```

---

## Diagramme d'état de la synchronisation

```mermaid
stateDiagram-v2
    [*] --> Initialisation
    Initialisation --> Connecté : init() réussi

    Connecté --> SyncEnCours : Déclenchement sync
    SyncEnCours --> Connecté : Sync terminée
    SyncEnCours --> Erreur : Échec sync

    Connecté --> Offline : Perte de connexion
    Offline --> MutationsLocales : Opération CRUD
    MutationsLocales --> Offline : Mutation enregistrée

    Offline --> Reconnexion : Retour connexion
    Reconnexion --> Réconciliation : Push + Pull
    Réconciliation --> RésolutionConflits : Conflits détectés
    RésolutionConflits --> Convergé : Conflits résolus
    Réconciliation --> Convergé : Pas de conflits
    Convergé --> Connecté : Vérification OK

    Erreur --> Connecté : Retry réussi
    Erreur --> Offline : Toujours déconnecté

    Connecté --> [*] : destroy()
```

---

## Cycle par technologie

### PouchDB + CouchDB

```mermaid
flowchart TD
    A[Base locale PouchDB] -->|Réplication live| B[CouchDB distant]
    B -->|Réplication live| A

    subgraph "Mode offline"
        C[Mutations locales] --> D[Stockage dans PouchDB]
        D --> E[File d'attente interne]
    end

    subgraph "Reconnexion"
        E --> F[Réplication push]
        F --> G{Conflits ?}
        G -->|Non| H[Sync terminée]
        G -->|Oui| I[Arbre de révisions]
        I --> J[Sélection du gagnant par _rev]
        J --> H
    end

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style I fill:#FF9800,color:#fff
```

**Mécanisme de résolution de conflits PouchDB :**
- PouchDB maintient un **arbre de révisions** (_rev) pour chaque document
- En cas de conflit, les deux versions sont stockées comme branches
- Le "gagnant" est déterminé par un algorithme déterministe basé sur le hash de la révision
- Les conflits non résolus restent accessibles via `doc._conflicts`

### WatermelonDB

```mermaid
flowchart TD
    A[SQLite local] -->|Pull| B[Serveur de sync]
    B -->|Push| A

    subgraph "Protocole Pull/Push"
        C[pullChanges depuis lastPulledAt] --> D[Appliquer les changements distants]
        D --> E[pushChanges des mutations locales]
        E --> F[Mise à jour lastPulledAt]
    end

    subgraph "Résolution de conflits"
        G{Même enregistrement modifié ?}
        G -->|Oui| H[Comparer updatedAt]
        H --> I[Le plus récent gagne]
        G -->|Non| J[Pas de conflit]
    end

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style H fill:#FF9800,color:#fff
```

**Mécanisme de résolution de conflits WatermelonDB :**
- Stratégie **Last-Write-Wins** (le dernier écrit gagne)
- Basé sur le champ `updatedAt` (timestamp)
- Simple mais peut entraîner une perte de données silencieuse
- Pas de détection de conflit côté client

### Ditto (CRDT)

```mermaid
flowchart TD
    A[Réplica local] <-->|Sync peer-to-peer| B[Réplica distant]

    subgraph "LWW-Register CRDT"
        C[Valeur + Timestamp + ReplicaId] --> D{Conflit ?}
        D -->|Non| E[Accepter la valeur]
        D -->|Oui| F[Comparer timestamps]
        F -->|Différents| G[Le plus récent gagne]
        F -->|Égaux| H[Comparer ReplicaId]
        H --> I[Le plus grand lexicographiquement gagne]
    end

    subgraph "Vecteur de version"
        J[ReplicaA: seq 5] --> K[Fusion des vecteurs]
        L[ReplicaB: seq 3] --> K
        K --> M[Max par entrée]
    end

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style D fill:#FF9800,color:#fff
```

**Mécanisme de résolution de conflits Ditto (simulé) :**
- **LWW-Register** : chaque champ a un timestamp et un identifiant de réplica
- En cas de conflit : le timestamp le plus élevé gagne
- En cas d'égalité : le `replicaId` le plus grand (lexicographique) gagne
- **Vecteurs de version** : permettent la synchronisation par delta (seules les modifications non vues sont échangées)
- **Tombstones** : les suppressions sont marquées (pas de suppression physique), garantissant la convergence
- **Propriétés CRDT** :
  - ✅ Commutativité (l'ordre des opérations n'importe pas)
  - ✅ Associativité (les groupements n'importent pas)
  - ✅ Idempotence (appliquer deux fois la même opération donne le même résultat)

---

## Comparaison des stratégies de résolution

| Critère | PouchDB | WatermelonDB | Ditto (CRDT) |
|---------|---------|-------------|-------------|
| **Stratégie** | Arbre de révisions | Last-Write-Wins | LWW-Register CRDT |
| **Déterminisme** | ✅ Oui (hash _rev) | ✅ Oui (timestamp) | ✅ Oui (timestamp + replicaId) |
| **Perte de données** | Non (conflits conservés) | Possible (écrasement) | Non (convergence garantie) |
| **Complexité** | Moyenne | Faible | Élevée |
| **Résolution manuelle** | Possible (`_conflicts`) | Non | Non nécessaire |
| **Convergence garantie** | Oui | Oui (si horloges sync) | Oui (mathématiquement prouvé) |

---

## Flux de données pendant le benchmark

```mermaid
flowchart LR
    subgraph "Génération"
        A[Générateur de dataset] -->|10 000 records| B[Dataset partagé]
    end

    subgraph "Exécution"
        B --> C[Adaptateur Tech X]
        C --> D[Scénario de benchmark]
        D --> E[Métriques brutes]
    end

    subgraph "Rapport"
        E --> F[Calcul statistiques]
        F --> G[JSON]
        F --> H[CSV]
        F --> I[Console]
    end

    style A fill:#9C27B0,color:#fff
    style D fill:#FF5722,color:#fff
    style G fill:#4CAF50,color:#fff
    style H fill:#4CAF50,color:#fff
```
