# StageOps Benchmark

Suite de tests destinée à mesurer la performance et la stabilité des composants StageOps.

## Objectif

Valider la capacité du système à fonctionner dans des conditions réelles :

- charge utilisateur
- volume matériel
- latence réseau
- stabilité API

## Types de tests

- tests de charge API
- tests de réponse incidents
- tests d’endpoints critiques
- mesure latence

## Structure

tests/
scenarios/
reports/

## Utilisation

### Prérequis
- API StageOps en fonctionnement

### Lancement

npm install
npm run benchmark

## Métriques observées

- temps de réponse
- throughput
- taux d’erreur
- stabilité service

## Usage académique

Permet de démontrer la robustesse de l’architecture.
