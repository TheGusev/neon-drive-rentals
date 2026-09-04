#!/usr/bin/env bash
# Обновление боевого NSK-RENT на VPS. Запуск: bash deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/nsk-rent}"
APP_NAME="${APP_NAME:-nsk-rent}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-3000}"

cd "$APP_DIR"

echo "==> Обновляем код (${BRANCH})"
git fetch origin "$BRANCH"
git reset --hard "origin/${BRANCH}"

echo "==> Зависимости"
if command -v bun >/dev/null 2>&1; then
  bun install --frozen-lockfile
else
  npm ci
fi

echo "==> Сборка"
if command -v bun >/dev/null 2>&1; then bun run build; else npm run build; fi

echo "==> Перезапуск приложения"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start .output/server/index.mjs --name "$APP_NAME" --update-env
fi
pm2 save

echo "==> Health-проверка (миграции применяются при старте)"
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/api/public/health" >/dev/null; then
    curl -s "http://127.0.0.1:${PORT}/api/public/health"; echo
    echo "==> Готово"
    exit 0
  fi
  sleep 2
done

echo "!! Приложение не ответило на health за 60 секунд — смотрите: pm2 logs ${APP_NAME}" >&2
exit 1
