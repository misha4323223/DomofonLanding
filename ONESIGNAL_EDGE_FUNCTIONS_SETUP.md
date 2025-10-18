# 🚀 Настройка OneSignal через Supabase Edge Functions

## Проблема
При прямом вызове OneSignal API из браузера возникают CORS ошибки, так как OneSignal не разрешает запросы напрямую из frontend.

## Решение
Используем **Supabase Edge Functions** в качестве безопасного прокси для OneSignal API.

---

## 📋 Шаг 1: Добавить секреты в Supabase

1. Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в **Settings** → **Edge Functions** → **Environment Variables**
3. Добавьте следующие переменные:

   - **ONESIGNAL_APP_ID**: `3a40bd59-5a8b-40a1-ba68-59676525befb`
   - **ONESIGNAL_REST_API_KEY**: `gka4scvfduuj5eux4soq64p2b`

---

## 📤 Шаг 2: Деплой Edge Functions

### Вариант A: Через Supabase CLI (рекомендуется)

```bash
# 1. Установите Supabase CLI (если еще не установлен)
npm install -g supabase

# 2. Войдите в Supabase
supabase login

# 3. Привяжите проект (используйте ваш project ID)
supabase link --project-ref whhlmtatsnxzovzbcnbp

# 4. Задеплойте функции
supabase functions deploy onesignal-send-notification
supabase functions deploy onesignal-get-subscribers
```

### Вариант B: Через GitHub Actions (автоматический деплой)

Добавьте в ваш `.github/workflows/deploy.yml`:

```yaml
- name: Deploy Supabase Functions
  run: |
    npm install -g supabase
    supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    supabase functions deploy onesignal-send-notification
    supabase functions deploy onesignal-get-subscribers
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

И добавьте в GitHub Secrets:
- `SUPABASE_PROJECT_REF`: `whhlmtatsnxzovzbcnbp`
- `SUPABASE_ACCESS_TOKEN`: (создайте в Supabase Dashboard → Settings → API → Access Tokens)

---

## ✅ Шаг 3: Проверка

После деплоя функции будут доступны по адресам:

- **Отправка уведомлений**:  
  `https://whhlmtatsnxzovzbcnbp.supabase.co/functions/v1/onesignal-send-notification`

- **Получение подписчиков**:  
  `https://whhlmtatsnxzovzbcnbp.supabase.co/functions/v1/onesignal-get-subscribers`

### Тестирование отправки уведомления:

```bash
curl -X POST https://whhlmtatsnxzovzbcnbp.supabase.co/functions/v1/onesignal-send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "subscriberId": "YOUR_PLAYER_ID",
    "heading": "Тестовое уведомление",
    "message": "Это тестовое сообщение"
  }'
```

---

## 🔧 Что изменилось в коде

### До (прямой вызов OneSignal API - НЕ РАБОТАЕТ):
```typescript
// ❌ CORS ошибка!
const response = await fetch("https://onesignal.com/api/v1/notifications", {
  method: "POST",
  headers: {
    "Authorization": `Basic ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
```

### После (через Supabase Edge Function - РАБОТАЕТ):
```typescript
// ✅ Работает без CORS ошибок!
const response = await fetch(
  "https://whhlmtatsnxzovzbcnbp.supabase.co/functions/v1/onesignal-send-notification",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscriberId: "player_id",
      heading: "Заголовок",
      message: "Сообщение"
    }),
  }
);
```

---

## 📁 Структура файлов

```
supabase/
└── functions/
    ├── onesignal-send-notification/
    │   └── index.ts          # Отправка уведомлений
    ├── onesignal-get-subscribers/
    │   └── index.ts          # Получение подписчиков
    └── telegram-notify/
        └── index.ts          # Уведомления в Telegram
```

---

## 🔐 Безопасность

✅ **REST API ключи хранятся на сервере** (в Supabase Environment Variables)  
✅ **Ключи не попадают в frontend код**  
✅ **CORS настроен правильно**  
✅ **Работает для статических сайтов на GitHub Pages**

---

## 🐛 Устранение проблем

### Ошибка: "Function not found"
- Убедитесь, что функции задеплоены: `supabase functions list`

### Ошибка: "Missing environment variable"
- Проверьте, что добавили ONESIGNAL_APP_ID и ONESIGNAL_REST_API_KEY в Supabase Dashboard

### CORS ошибка все еще есть
- Проверьте, что обновили `client/src/lib/onesignal-api.ts`
- Убедитесь, что вызываете Edge Function, а не OneSignal API напрямую

---

## 📚 Полезные ссылки

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [OneSignal REST API Documentation](https://documentation.onesignal.com/reference/create-notification)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
