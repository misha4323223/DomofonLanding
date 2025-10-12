#!/bin/bash

echo "🚀 Начинаем деплой на GitHub Pages..."
echo ""

git add .

current_time=$(date +'%Y-%m-%d %H:%M:%S')
git commit -m "Deploy: $current_time" || {
    echo "⚠️  Нет изменений для коммита"
    git push origin main
    exit 0
}

echo "✅ Изменения закоммичены"
echo "📤 Отправляем на GitHub..."

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Успешно отправлено на GitHub!"
    echo "🌐 GitHub Actions автоматически задеплоит сайт"
    echo "📊 Проверить статус: https://github.com/Misha4323223/DomofonLanding/actions"
    echo "🌍 Ваш сайт: https://www.obzor71.ru"
    echo ""
    echo "⏱️  Деплой займёт примерно 2-3 минуты"
else
    echo "❌ Ошибка при отправке на GitHub"
    exit 1
fi
