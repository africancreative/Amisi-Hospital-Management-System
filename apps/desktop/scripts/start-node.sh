#!/usr/bin/env bash
# AmisiMedOS Local Node — Linux/macOS Startup Script
# Runs the web server headlessly on a hospital server (no GUI required).
# Recommended: Register as a systemd service (see docs/systemd.service)

set -e

WEB_PORT=${NODE_LAN_PORT:-3000}
API_PORT=${PORT:-8080}
ENV_FILE="${1:-.env}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AmisiMedOS Local Node — Starting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load .env file
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "✅ Environment loaded from $ENV_FILE"
else
    echo "⚠️  No .env file found. Copy .env.local.template to .env first."
    exit 1
fi

# Detect LAN IP
LAN_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo "127.0.0.1")
echo "🌐 LAN IP: $LAN_IP"

# Start API sidecar (Express on :8080)
echo "🚀 Starting API server on port $API_PORT..."
PORT=$API_PORT node dist/index.js &
API_PID=$!

# Start Next.js standalone web server (LAN-accessible on 0.0.0.0)
echo "🚀 Starting Web UI on port $WEB_PORT..."
PORT=$WEB_PORT HOSTNAME=0.0.0.0 node .next/standalone/server.js &
WEB_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ AmisiMedOS Local Node is running!"
echo "  📡 Web UI    → http://$LAN_IP:$WEB_PORT"
echo "  🔌 Local API → http://$LAN_IP:$API_PORT/api/health"
echo "  Press Ctrl+C to stop."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Graceful shutdown on SIGINT/SIGTERM
cleanup() {
    echo ""
    echo "Shutting down AmisiMedOS Local Node..."
    kill $API_PID $WEB_PID 2>/dev/null
    exit 0
}
trap cleanup INT TERM

wait $WEB_PID
