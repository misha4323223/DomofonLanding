@echo off
REM Скрипт для деплоя на GitHub Pages (Windows)
REM Использование: deploy-github.bat [название-репозитория]

if "%1"=="" (
  echo ❌ Ошибка: Укажите название репозитория!
  echo Использование: deploy-github.bat [название-репозитория]
  echo Пример: deploy-github.bat my-awesome-site
  exit /b 1
)

set REPO_NAME=%1
echo 📦 Начинаю сборку сайта для репозитория: %REPO_NAME%

REM Собираем только фронтенд для GitHub Pages
echo 🔨 Сборка фронтенда...
call vite build --base=/%REPO_NAME%/

if errorlevel 1 (
  echo ❌ Ошибка при сборке!
  exit /b 1
)

echo ✅ Сборка завершена!

REM Публикуем на GitHub Pages
echo 🚀 Публикация на GitHub Pages...
call npx gh-pages -d dist/public

if errorlevel 1 (
  echo ❌ Ошибка при публикации!
  exit /b 1
)

echo ✅ Деплой завершен!
echo 🌐 Ваш сайт будет доступен по адресу:
echo    https://ваш-username.github.io/%REPO_NAME%/
echo.
echo 📝 Не забудьте:
echo    1. Включить GitHub Pages в настройках репозитория
echo    2. Выбрать ветку gh-pages как источник
