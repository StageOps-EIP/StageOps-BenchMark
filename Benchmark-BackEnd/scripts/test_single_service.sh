#!/bin/bash

# Script de test d'un seul service pour diagnostic

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SERVICE=${1:-nodejs-express}
PORT=${2:-3001}

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  TEST SERVICE: ${SERVICE}${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Créer le dossier results
mkdir -p results

# Arrêter services existants
echo -e "${BLUE}[1/5]${NC} Nettoyage..."
docker-compose down > /dev/null 2>&1

# Construire l'image
echo -e "${BLUE}[2/5]${NC} Construction de l'image..."
docker-compose build $SERVICE

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur de build${NC}"
    exit 1
fi

# Démarrer le service
echo -e "${BLUE}[3/5]${NC} Démarrage du service..."
docker-compose up -d $SERVICE

# Attendre
echo -e "${YELLOW}⏳${NC} Attente de 10 secondes..."
sleep 10

# Tester
echo -e "${BLUE}[4/5]${NC} Test du service..."
echo -n "   Health check... "

RESPONSE=$(curl -s http://localhost:$PORT/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}✗${NC}"
    echo "Logs du service:"
    docker-compose logs $SERVICE
    exit 1
fi

# Test k6 rapide
echo ""
echo -e "${BLUE}[5/5]${NC} Test k6 (30 secondes)..."

k6 run --duration 30s --vus 10 \
    --env BASE_URL="http://localhost:$PORT" \
    --env SERVICE_NAME="${SERVICE}_test" \
    --env RESULTS_DIR="./results" \
    k6-tests/load-test.js

# Arrêter
echo ""
echo -e "${BLUE}Arrêt du service...${NC}"
docker-compose down

echo ""
echo -e "${GREEN}✅ TEST TERMINÉ${NC}"
echo ""
echo -e "Résultats: ${YELLOW}results/${SERVICE}_test_summary.json${NC}"
