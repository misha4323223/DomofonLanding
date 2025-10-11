#!/bin/bash

# Скрипт для деплоя на GitHub Pages
# Использование: ./deploy-github.sh [название-репозитория]

# Проверяем, передано ли название репозитория
if [ -z "$1" ]; then
  echo "❌ Ошибка: Укажите название репозитория!"
  echo "Использование: ./deploy-github.sh [название-репозитория]"
  echo "Пример: ./deploy-github.sh my-awesome-site"
  exit 1
fi

REPO_NAME=$1
echo "📦 Начинаю сборку сайта для репозитория: $REPO_NAME"

# Собираем только фронтенд для GitHub Pages
echo "🔨 Сборка фронтенда..."
npx vite build --base=/$REPO_NAME/

# Проверяем успешность сборки
if [ $? -ne 0 ]; then
  echo "❌ Ошибка при сборке!"
  exit 1
fi

echo "✅ Сборка завершена!"

# Публикуем на GitHub Pages
echo "🚀 Публикация на GitHub Pages..."
npx gh-pages -d dist/public

# Проверяем успешность публикации
if [ $? -eq 0 ]; then
  echo "✅ Деплой завершен!"
  echo "🌐 Ваш сайт будет доступен по адресу:"
  echo "   https://ваш-username.github.io/$REPO_NAME/"
  echo ""
  echo "📝 Не забудьте:"
  echo "   1. Включить GitHub Pages в настройках репозитория"
  echo "   2. Выбрать ветку gh-pages как источник"
else
  echo "❌ Ошибка при публикации!"
  exit 1
fi
