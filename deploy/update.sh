#!/usr/bin/env bash
set -euo pipefail

cd ~/linkspace
git pull --ff-only
.venv/bin/python -m pip install -r requirements.txt

cd frontend
npm ci
NEXT_PUBLIC_API_URL=/api npm run build

sudo systemctl restart linkspace-api linkspace-web
systemctl --no-pager status linkspace-api linkspace-web | grep -E "●|Active:"
