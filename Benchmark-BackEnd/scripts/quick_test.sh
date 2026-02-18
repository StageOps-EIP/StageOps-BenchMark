#!/bin/bash

# Script de test rapide (5 minutes au lieu de 1h30)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  TEST RAPIDE (5 minutes)${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Vérifier k6
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 non installé${NC}"
    exit 1
fi

# Créer le répertoire results
mkdir -p results

# Démarrer les services
echo -e "${BLUE}[1/4]${NC} Démarrage des services..."
docker-compose up -d

echo -e "${YELLOW}⏳${NC} Attente de 60 secondes (démarrage des services)..."
sleep 60

# Vérifier que les services répondent
echo -e "${BLUE}[2/4]${NC} Vérification des services..."
for i in "${!SERVICES[@]}"; do
    PORT="${PORTS[$i]}"
    SERVICE="${SERVICES[$i]}"
    
    if curl -s http://localhost:$PORT/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $SERVICE (port $PORT)"
    else
        echo -e "  ${RED}✗${NC} $SERVICE (port $PORT) - Service non disponible"
    fi
done
echo ""

# Test rapide sur 2 services représentatifs
SERVICES=("nodejs-express" "go-fiber" "rust-actix")
PORTS=(3001 3003 3005)

echo -e "${BLUE}[3/4]${NC} Tests rapides..."
echo ""

for i in "${!SERVICES[@]}"; do
    SERVICE="${SERVICES[$i]}"
    PORT="${PORTS[$i]}"
    
    echo -e "${YELLOW}→${NC} Test de $SERVICE (2 minutes)..."
    
    k6 run --quiet \
        --duration 2m \
        --vus 100 \
        --env BASE_URL="http://localhost:$PORT" \
        --env SERVICE_NAME="${SERVICE}_quick" \
        --env RESULTS_DIR="$PWD/results" \
        k6-tests/load-test.js
    
    echo ""
done

# Collecter stats
echo -e "${BLUE}[4/4]${NC} Collection des métriques..."
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep "benchmark-"

# Arrêter
echo ""
echo -e "${BLUE}[5/5]${NC} Arrêt des services..."
docker-compose down

echo ""
echo -e "${GREEN}✅ TEST RAPIDE TERMINÉ${NC}"
echo ""
echo -e "${CYAN}Pour un benchmark complet:${NC}"
echo -e "  ${YELLOW}./run_benchmark.sh${NC}"
echo ""
