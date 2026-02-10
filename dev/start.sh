#!/bin/bash
set -e
cd "$(dirname "$0")/.."

export VITE_PORT=${VITE_PORT:-5173}
export API_PORT=${API_PORT:-5172}

kill_port() { lsof -ti :"$1" 2>/dev/null | xargs -r kill 2>/dev/null || true; }

kill_port $VITE_PORT
kill_port $API_PORT

echo "Starting Headless CRM dev (Vite :${VITE_PORT} + API :${API_PORT})"
> dev/dev.log

npx concurrently -n vite,api -c cyan,green \
  "npx vite --port ${VITE_PORT} --host" \
  "PORT=${API_PORT} npx tsx watch server/index.ts" \
  2>&1 | tee dev/dev.log
