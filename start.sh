#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

URL="http://localhost:8000"

open_browser() {
  sleep 1
  if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then open "$URL" >/dev/null 2>&1 || true
  fi
}

open_browser &

if command -v php >/dev/null 2>&1; then
  echo "Iniciando com PHP em $URL"
  echo "Painel: $URL/admin"
  php -S localhost:8000 -t .
elif command -v python3 >/dev/null 2>&1; then
  echo "Iniciando com Python em $URL"
  echo "(Para usar o painel /admin, instale PHP 8.1+.)"
  python3 -m http.server 8000
elif command -v python >/dev/null 2>&1; then
  echo "Iniciando com Python em $URL"
  echo "(Para usar o painel /admin, instale PHP 8.1+.)"
  python -m http.server 8000
else
  echo "Instale PHP 8.1+ ou Python para rodar o site."
  exit 1
fi
