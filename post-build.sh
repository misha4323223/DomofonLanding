#!/bin/bash
set -euo pipefail  # Останавливаем скрипт при ошибке

# Скрипт для копирования критичных файлов в корень dist/public после билда
# Это нужно для GitHub Pages чтобы работали:
# - client-side роутинг (404.html)
# - OneSignal push notifications (OneSignalSDKWorker.js)

echo "📦 Копирование файлов в корень dist/public..."

# Проверяем что директория билда существует
if [ ! -d "dist/public" ]; then
  echo "❌ ОШИБКА: dist/public не найден. Сначала запустите 'npm run build'"
  exit 1
fi

# Копируем 404.html для SPA роутинга
if [ -f "dist/public/client/404.html" ]; then
  cp dist/public/client/404.html dist/public/404.html
  echo "  ✓ 404.html скопирован (SPA роутинг)"
else
  echo "❌ ОШИБКА: dist/public/client/404.html не найден!"
  echo "   Убедитесь что файл 404.html есть в client/public/"
  exit 1
fi

# Копируем OneSignal Service Worker в корень (критично!)
if [ -f "dist/public/client/OneSignalSDKWorker.js" ]; then
  cp dist/public/client/OneSignalSDKWorker.js dist/public/OneSignalSDKWorker.js
  echo "  ✓ OneSignalSDKWorker.js скопирован (push notifications)"
else
  echo "❌ ОШИБКА: dist/public/client/OneSignalSDKWorker.js не найден!"
  echo "   Убедитесь что файл OneSignalSDKWorker.js есть в client/public/"
  exit 1
fi

echo ""
echo "✅ Готово! Теперь можно деплоить на GitHub Pages"
echo ""
echo "Важные файлы:"
echo "  ✓ dist/public/404.html - для SPA роутинга (/admin будет работать)"
echo "  ✓ dist/public/OneSignalSDKWorker.js - OneSignal worker (обязательно в корне!)"
echo "  ✓ dist/public/client/CNAME - кастомный домен"  
echo "  ✓ dist/public/client/robots.txt - для поисковиков"
