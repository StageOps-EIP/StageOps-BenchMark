# Makefile pour simplifier les commandes

.PHONY: help build start stop restart test clean install

help: ## Affiche cette aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Installer les dépendances
	@echo "Installation des dépendances Python..."
	cd analysis && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "✓ Installation terminée"

build: ## Construire toutes les images Docker
	@echo "Construction des images Docker..."
	docker-compose build --parallel
	@echo "✓ Images construites"

start: ## Démarrer tous les services
	@echo "Démarrage des services..."
	docker-compose up -d
	@echo "⏳ Attente de 30s pour le démarrage complet..."
	sleep 30
	@echo "✓ Services démarrés"

stop: ## Arrêter tous les services
	@echo "Arrêt des services..."
	docker-compose down
	@echo "✓ Services arrêtés"

restart: stop start ## Redémarrer tous les services

logs: ## Afficher les logs
	docker-compose logs -f

status: ## Vérifier le statut des services
	docker-compose ps
	@echo ""
	@echo "Tests de santé:"
	@curl -s http://localhost:3001/health | jq '.' || echo "Express: ✗"
	@curl -s http://localhost:3002/health | jq '.' || echo "Fastify: ✗"
	@curl -s http://localhost:3003/health | jq '.' || echo "Fiber: ✗"
	@curl -s http://localhost:3004/health | jq '.' || echo "Gin: ✗"
	@curl -s http://localhost:3005/health | jq '.' || echo "Actix: ✗"
	@curl -s http://localhost:3006/health | jq '.' || echo "Axum: ✗"

test: ## Lancer le benchmark complet
	@echo "Lancement du benchmark..."
	./scripts/run_benchmark.sh

test-single: ## Tester un service spécifique (usage: make test-single SERVICE=express PORT=3001)
	@echo "Test du service $(SERVICE) sur le port $(PORT)..."
	k6 run --env BASE_URL="http://localhost:$(PORT)" --env SERVICE_NAME="$(SERVICE)" k6-tests/load-test.js

graphs: ## Générer uniquement les graphiques
	@echo "Génération des graphiques..."
	cd analysis && source venv/bin/activate && python3 generate_charts.py

clean: ## Nettoyer les résultats et containers
	@echo "Nettoyage..."
	docker-compose down -v
	rm -rf results/*.json results/*.png results/*.csv results/*.txt
	rm -rf analysis/venv
	@echo "✓ Nettoyage terminé"

rebuild: clean build ## Rebuild complet (clean + build)

stats: ## Afficher les stats Docker en temps réel
	docker stats

quick-test: ## Test rapide (5 min au lieu de 11 min)
	@echo "Test rapide sur Express..."
	k6 run --duration 5m --vus 100 --env BASE_URL="http://localhost:3001" k6-tests/load-test.js

# Raccourcis
b: build
s: start
t: test
c: clean
