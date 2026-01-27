#!/bin/bash
set -e
cd "$(dirname "$0")/.."
PORT=${PORT:-3001}
echo "🚀 Vite dev on port ${PORT}"
unbuffer npx vite --port ${PORT} --host 2>&1 | tee dev/dev.log
