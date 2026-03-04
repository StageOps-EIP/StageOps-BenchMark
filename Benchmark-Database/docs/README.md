# Documentation du Benchmark StageOps

## Vue d'ensemble

Ce dossier contient la documentation complète du benchmark de synchronisation offline-first réalisé dans le cadre du projet EIP **StageOps**.

## Table des matières

| Document | Description |
|----------|-------------|
| [Méthodologie de benchmark](methodologie-benchmark.md) | Protocole de test, métriques mesurées, conditions expérimentales |
| [Cycle de synchronisation](cycle-synchronisation.md) | Diagrammes Mermaid du cycle de sync, flux de données, résolution de conflits |
| [Tests en mode dégradé](tests-mode-degrade.md) | Simulation du mode offline, mutations locales, fenêtre de déconnexion |
| [Interprétation des résultats](interpretation-resultats.md) | Analyse des métriques, limites du benchmark, recommandations |
| **[Justification du choix technologique](justification-choix-technologique.md)** | **Argumentation détaillée du choix PouchDB + CouchDB pour StageOps** |

## Choix technologique retenu

À l'issue du benchmark, la technologie retenue pour StageOps est **CouchDB** (base serveur, accès direct depuis l'app web) + **PouchDB** (réplique locale sur mobile pour le mode offline). Voir la [justification complète](justification-choix-technologique.md).

## Technologies comparées

1. **PouchDB + CouchDB** — Base de données JavaScript offline-first avec réplication bidirectionnelle native ✅ **Retenu**
2. **WatermelonDB** — Base de données réactive optimisée pour React Native (simulée en Node.js)
3. **Ditto** — Base de données peer-to-peer basée sur les CRDT (simulée avec documentation du comportement)

## Contexte du projet

StageOps est une plateforme de gestion opérationnelle de chantier. L'application mobile doit fonctionner en mode déconnecté sur le terrain, puis synchroniser les données lorsque la connectivité est rétablie. L'application web accède directement à la base CouchDB. Ce benchmark évalue les technologies candidates pour la synchronisation offline mobile.

## Comment contribuer à la documentation

- Toute la documentation est rédigée en **français**
- Le code source et les commentaires sont en **anglais**
- Les diagrammes utilisent la syntaxe **Mermaid**
- Les métriques sont exprimées en millisecondes (ms) et mégaoctets (Mo)
