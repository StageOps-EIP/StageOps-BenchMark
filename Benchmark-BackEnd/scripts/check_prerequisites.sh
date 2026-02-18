#!/bin/bash

# Script de vérification des prérequis

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VÉRIFICATION DES PRÉREQUIS${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

ALL_OK=true

# Vérifier Docker
echo -n "Vérification de Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | tr -d ',')
    echo -e "${GREEN}✓ Installé (${DOCKER_VERSION})${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    echo -e "  ${YELLOW}→ Installer depuis: https://docs.docker.com/get-docker/${NC}"
    ALL_OK=false
fi

# Vérifier Docker Compose
echo -n "Vérification de Docker Compose... "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | tr -d ',')
    echo -e "${GREEN}✓ Installé (${COMPOSE_VERSION})${NC}"
elif docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    echo -e "${GREEN}✓ Installé (${COMPOSE_VERSION})${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    echo -e "  ${YELLOW}→ Inclus avec Docker Desktop ou installer séparément${NC}"
    ALL_OK=false
fi

# Vérifier k6
echo -n "Vérification de k6... "
if command -v k6 &> /dev/null; then
    K6_VERSION=$(k6 version | cut -d ' ' -f2)
    echo -e "${GREEN}✓ Installé (${K6_VERSION})${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    echo -e "  ${YELLOW}→ Installer depuis: https://k6.io/docs/get-started/installation/${NC}"
    ALL_OK=false
fi

# Vérifier Python
echo -n "Vérification de Python 3... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d ' ' -f2)
    echo -e "${GREEN}✓ Installé (${PYTHON_VERSION})${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    echo -e "  ${YELLOW}→ Installer depuis: https://www.python.org/downloads/${NC}"
    ALL_OK=false
fi

# Vérifier pip
echo -n "Vérification de pip... "
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version | cut -d ' ' -f2)
    echo -e "${GREEN}✓ Installé (${PIP_VERSION})${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    echo -e "  ${YELLOW}→ Installer: python3 -m ensurepip --upgrade${NC}"
    ALL_OK=false
fi

# Vérifier curl
echo -n "Vérification de curl... "
if command -v curl &> /dev/null; then
    echo -e "${GREEN}✓ Installé${NC}"
else
    echo -e "${YELLOW}⚠ Non installé (optionnel)${NC}"
fi

# Vérifier jq (optionnel)
echo -n "Vérification de jq... "
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✓ Installé (optionnel)${NC}"
else
    echo -e "${YELLOW}⚠ Non installé (optionnel, pour pretty-print JSON)${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ TOUS LES PRÉREQUIS SONT SATISFAITS!${NC}"
    echo ""
    echo -e "${BLUE}Vous pouvez maintenant lancer:${NC}"
    echo -e "  ${GREEN}./run_benchmark.sh${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CERTAINS PRÉREQUIS MANQUENT${NC}"
    echo ""
    echo -e "${YELLOW}Veuillez installer les outils manquants avant de continuer.${NC}"
    echo ""
    exit 1
fi
