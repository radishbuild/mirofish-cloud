#!/bin/bash
set -e

echo "Starting MiroFish Private Cloud..."

# --- Neo4j ---
# Configure to match docker-compose: APOC plugin, 512MB/2GB heap
NEO4J_USER=${NEO4J_USER:-neo4j}
NEO4J_PASS=${NEO4J_PASSWORD:-mirofish}

# Set Neo4j config
neo4j-admin dbms set-initial-password "$NEO4J_PASS" 2>/dev/null || true
sed -i 's/#server.memory.heap.initial_size=.*/server.memory.heap.initial_size=512m/' /etc/neo4j/neo4j.conf
sed -i 's/#server.memory.heap.max_size=.*/server.memory.heap.max_size=2g/' /etc/neo4j/neo4j.conf

# Enable APOC plugin
export NEO4J_PLUGINS='["apoc"]'
if [ -d /var/lib/neo4j/labs ]; then
  cp /var/lib/neo4j/labs/apoc-*-core.jar /var/lib/neo4j/plugins/ 2>/dev/null || true
fi

# Start Neo4j
neo4j start
echo "Waiting for Neo4j..."
until wget -q --spider http://localhost:7474 2>/dev/null; do
  sleep 2
done
echo "Neo4j ready."

# --- Ollama ---
ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama..."
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
  sleep 1
done
echo "Ollama ready."

# Pull models
MODEL=${OLLAMA_MODEL:-"qwen2.5:14b"}
echo "Pulling model $MODEL..."
ollama pull "$MODEL"

EMBED_MODEL=${OLLAMA_EMBED_MODEL:-"nomic-embed-text"}
echo "Pulling embedding model $EMBED_MODEL..."
ollama pull "$EMBED_MODEL"

echo "Models ready."

# Warm the model — load it into GPU memory so the first user request is fast
echo "Warming model $MODEL (loading into GPU memory)..."
curl -s http://localhost:11434/api/chat -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"stream\":false}" > /dev/null 2>&1 || true
echo "Model warmed."

# --- Flask backend ---
cd /app && python backend/run.py &
FLASK_PID=$!
sleep 2

# --- Nginx ---
nginx -g 'daemon off;' &
NGINX_PID=$!

trap "neo4j stop; kill $FLASK_PID $NGINX_PID $OLLAMA_PID 2>/dev/null; exit 0" SIGTERM SIGINT

echo "MiroFish ready at http://localhost:3000"

wait -n $FLASK_PID $NGINX_PID $OLLAMA_PID
EXIT_CODE=$?
neo4j stop
kill $FLASK_PID $NGINX_PID $OLLAMA_PID 2>/dev/null
exit $EXIT_CODE
