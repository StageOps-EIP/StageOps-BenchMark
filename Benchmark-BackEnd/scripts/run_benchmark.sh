#!/bin/bash

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVICES=("nodejs-express" "nodejs-fastify" "go-fiber" "go-gin" "rust-actix" "rust-axum")
PORTS=(3001 3002 3003 3004 3005 3006)
RESULTS_DIR="./results"
K6_TESTS_DIR="./k6-tests"
ANALYSIS_DIR="./analysis"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  BENCHMARK MULTI-THÉÂTRES${NC}"
echo -e "${CYAN}  Node.js vs Go vs Rust${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Vérifier les dépendances
echo -e "${BLUE}[1/7]${NC} Vérification des dépendances..."

command -v docker &> /dev/null || { echo -e "${RED}❌ Docker non installé${NC}"; exit 1; }
command -v docker-compose &> /dev/null || command -v docker &> /dev/null || { echo -e "${RED}❌ Docker Compose non installé${NC}"; exit 1; }
command -v k6 &> /dev/null || { echo -e "${RED}❌ k6 non installé. Installez-le depuis https://k6.io${NC}"; exit 1; }
command -v python3 &> /dev/null || { echo -e "${RED}❌ Python 3 non installé${NC}"; exit 1; }

echo -e "${GREEN}✓${NC} Toutes les dépendances sont présentes"
echo ""

# Créer le dossier des résultats
mkdir -p "$RESULTS_DIR"

# Construire les images Docker
echo -e "${BLUE}[2/7]${NC} Construction des images Docker..."
docker-compose build --parallel
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la construction des images${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Images construites avec succès"
echo ""

# Démarrer tous les services
echo -e "${BLUE}[3/7]${NC} Démarrage des services..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du démarrage des services${NC}"
    exit 1
fi

# Attendre que tous les services soient prêts
echo -e "${YELLOW}⏳${NC} Attente du démarrage des services (30 secondes)..."
sleep 30

# Vérifier que tous les services répondent
echo -e "${YELLOW}🔍${NC} Vérification de la disponibilité des services..."
ALL_READY=true
for i in "${!SERVICES[@]}"; do
    SERVICE="${SERVICES[$i]}"
    PORT="${PORTS[$i]}"
    
    echo -n "   Vérification de $SERVICE (port $PORT)... "
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)
    
    if [ "$RESPONSE" == "200" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ (HTTP $RESPONSE)${NC}"
        ALL_READY=false
    fi
done

if [ "$ALL_READY" = false ]; then
    echo -e "${RED}❌ Certains services ne sont pas prêts${NC}"
    echo "Vérifiez les logs avec: docker-compose logs"
    exit 1
fi

echo -e "${GREEN}✓${NC} Tous les services sont opérationnels"
echo ""

# Lancer les tests k6 pour chaque service
echo -e "${BLUE}[4/7]${NC} Exécution des tests de charge k6..."
echo ""

for i in "${!SERVICES[@]}"; do
    SERVICE="${SERVICES[$i]}"
    PORT="${PORTS[$i]}"
    
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}  Test: $SERVICE (port $PORT)${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Test de charge principal
    echo -e "${YELLOW}→${NC} Test de charge en cours..."
    k6 run --quiet \
        --env BASE_URL="http://localhost:$PORT" \
        --env SERVICE_NAME="$SERVICE" \
        --env RESULTS_DIR="$RESULTS_DIR" \
        "$K6_TESTS_DIR/load-test.js"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Test terminé: $SERVICE"
    else
        echo -e "${RED}✗${NC} Échec du test: $SERVICE"
    fi
    
    echo ""
    
    # Pause entre les tests
    if [ $i -lt $((${#SERVICES[@]} - 1)) ]; then
        echo -e "${YELLOW}⏸${NC}  Pause de 10 secondes avant le test suivant..."
        sleep 10
        echo ""
    fi
done

echo -e "${GREEN}✓${NC} Tous les tests k6 sont terminés"
echo ""

# Collecter les métriques de ressources
echo -e "${BLUE}[5/7]${NC} Collection des métriques Docker..."

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" \
    | grep "benchmark-" > "$RESULTS_DIR/docker_stats.txt"

echo -e "${GREEN}✓${NC} Métriques Docker collectées"
echo ""

# Arrêter les services
echo -e "${BLUE}[6/7]${NC} Arrêt des services..."
docker-compose down
echo -e "${GREEN}✓${NC} Services arrêtés"
echo ""

# Générer les graphiques
echo -e "${BLUE}[7/7]${NC} Génération des graphiques..."
echo ""

# Installer les dépendances Python si nécessaire
if [ ! -d "$ANALYSIS_DIR/venv" ]; then
    echo -e "${YELLOW}→${NC} Création de l'environnement virtuel Python..."
    python3 -m venv "$ANALYSIS_DIR/venv"
    source "$ANALYSIS_DIR/venv/bin/activate"
    pip install -q -r "$ANALYSIS_DIR/requirements.txt"
else
    source "$ANALYSIS_DIR/venv/bin/activate"
fi

# Générer les graphiques
cd "$ANALYSIS_DIR"
python3 generate_charts.py
cd ..

deactivate

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✅ BENCHMARK TERMINÉ AVEC SUCCÈS!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${CYAN}📊 Résultats disponibles dans:${NC}"
echo -e "   ${YELLOW}→${NC} $RESULTS_DIR/"
echo ""
echo -e "${CYAN}📈 Graphiques générés:${NC}"
echo -e "   ${YELLOW}→${NC} latency_comparison.png"
echo -e "   ${YELLOW}→${NC} throughput_comparison.png"
echo -e "   ${YELLOW}→${NC} performance_matrix.png"
echo -e "   ${YELLOW}→${NC} failure_rate.png"
echo -e "   ${YELLOW}→${NC} comprehensive_comparison.png"
echo ""
echo -e "${CYAN}📄 Pour générer le rapport:${NC}"
echo -e "   ${YELLOW}→${NC} Consultez benchmark_report.md"
echo ""
