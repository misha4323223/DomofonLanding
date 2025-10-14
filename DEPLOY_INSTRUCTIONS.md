# 🚀 Инструкция по деплою на GitHub Pages

## ⚠️ ВАЖНО: Настройка package.json

Для автоматического копирования критичных файлов после билда нужно обновить `package.json`.

### Добавь в секцию "scripts":

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "postbuild": "bash post-build.sh",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

**Что изменилось:**
- Добавлена строка `"postbuild": "bash post-build.sh"`
- Эта команда автоматически запустится после `npm run build`

**⚠️ Обработка ошибок:**
- Скрипт `post-build.sh` использует `set -euo pipefail` - он остановится при любой ошибке
- Если файлы не скопировались - билд упадет с понятной ошибкой
- Это гарантирует что вы не задеплоите сломанную версию

**🔒 КРИТИЧНО - Executable права для скрипта:**
- Убедись что `post-build.sh` имеет права на выполнение:
  ```bash
  chmod +x post-build.sh
  git add post-build.sh
  git update-index --chmod=+x post-build.sh
  git commit -m "Make post-build.sh executable"
  ```
- Это гарантирует что скрипт будет работать в CI/CD и на других машинах

---

## 📦 Процесс деплоя

### 1. Собрать проект:
```bash
npm run build
```

Это автоматически:
- ✅ Соберет приложение в `dist/public/`
- ✅ Запустит `post-build.sh` который скопирует:
  - `404.html` в корень (для SPA роутинга `/admin`)
  - `OneSignalSDKWorker.js` в корень (для push-уведомлений)

### 2. Задеплоить на GitHub Pages:
```bash
# Если используешь скрипт деплоя
bash deploy-github.sh

# Или вручную через gh-pages
npx gh-pages -d dist/public
```

---

## ✅ Проверка после деплоя

### 1. Проверь что админка открывается:
- Перейди на `https://www.obzor71.ru/admin`
- Должна открыться страница входа (не 404!)

### 2. Проверь что OneSignal работает:
- Открой консоль браузера (F12)
- Проверь что нет ошибок CSP
- Должно быть: `✅ OneSignal инициализирован`

### 3. Проверь Service Worker:
- Открой DevTools → Application → Service Workers
- Должен быть зарегистрирован `OneSignalSDKWorker`

---

## 🐛 Если что-то не работает

### Проблема: `/admin` выдает 404
**Решение:** Убедись что `dist/public/404.html` существует (запусти `post-build.sh` вручную)

### Проблема: OneSignal не загружается
**Решение:** 
1. Проверь что `dist/public/OneSignalSDKWorker.js` существует
2. Проверь CSP в index.html - должны быть разрешены домены `*.onesignal.com`

### Проблема: CSP блокирует ресурсы
**Решение:** Пересобери проект - новая CSP политика уже добавлена в код

---

## 📋 Чек-лист перед деплоем

- [ ] Добавил `"postbuild": "bash post-build.sh"` в package.json
- [ ] Запустил `npm run build`
- [ ] Проверил что `dist/public/404.html` существует
- [ ] Проверил что `dist/public/OneSignalSDKWorker.js` существует
- [ ] Задеплоил через `gh-pages` или свой скрипт
- [ ] Открыл `www.obzor71.ru/admin` - работает ✅
- [ ] Проверил консоль - нет ошибок ✅

---

## 🎯 Что исправлено в этом обновлении

1. **CSP политика обновлена:**
   - Разрешены все домены OneSignal: `https://onesignal.com`, `https://*.onesignal.com`
   - Разрешены iframe для OneSignal промптов
   - Разрешены изображения из внешних источников

2. **404.html для SPA роутинга:**
   - GitHub Pages теперь правильно обрабатывает `/admin` маршрут
   - Путь сохраняется и восстанавливается через sessionStorage

3. **OneSignal Service Worker в корне:**
   - `OneSignalSDKWorker.js` копируется в корень dist/public
   - Это критично для работы push-уведомлений

4. **Автоматизация:**
   - `post-build.sh` копирует все нужные файлы автоматически
   - Достаточно добавить одну строку в package.json

---

**Готово! 🎉 Теперь админка будет работать на GitHub Pages.**
