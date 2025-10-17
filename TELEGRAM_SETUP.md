# 🚀 Инструкция по настройке уведомлений в Telegram

Я уже создал всё необходимое! Осталось только настроить автоматический деплой через GitHub Actions.

---

## ✅ ЧТО УЖЕ ГОТОВО:

В проекте созданы:
- `supabase/functions/telegram-notify/index.ts` - код функции для отправки в Telegram
- `supabase/config.toml` - конфигурация Supabase
- `.github/workflows/deploy-supabase-functions.yml` - автоматический деплой через GitHub Actions

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ ВАМ (3 простых шага):

### **Шаг 1: Получите Supabase Access Token**

1. Откройте: https://supabase.com/dashboard/account/tokens
2. Нажмите **Generate New Token**
3. Дайте имя: `GitHub Actions`
4. Скопируйте токен (он показывается только один раз!)

---

### **Шаг 2: Добавьте секреты в Supabase**

Эти команды нужно выполнить **ОДИН РАЗ** на вашем ПК:

```bash
# 1. Установите Supabase CLI
npm install -g supabase

# 2. Войдите в Supabase
supabase login

# 3. Свяжите проект
supabase link --project-ref whhlmtatsnxzovzbcnbp

# 4. Добавьте секреты Telegram (ЗАМЕНИТЕ на ваши данные!)
supabase secrets set TELEGRAM_BOT_TOKEN=ваш_токен_бота_здесь
supabase secrets set TELEGRAM_CHAT_ID=ваш_chat_id_здесь
```

**Как узнать Chat ID группы:**
1. Добавьте бота в группу
2. Отправьте любое сообщение в группу
3. Откройте в браузере: `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates`
4. Найдите `"chat":{"id":-1001234567890` - это и есть Chat ID

---

### **Шаг 3: Добавьте секреты в GitHub**

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** и добавьте:

   **Секрет 1:**
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: ваш токен из Шага 1

   **Секрет 2:**
   - Name: `SUPABASE_PROJECT_REF`
   - Value: `whhlmtatsnxzovzbcnbp`

---

### **Шаг 4: Запуште код в GitHub**

Теперь когда вы запушите код в GitHub - функция автоматически задеплоится! 🎉

```bash
git add .
git commit -m "Add Telegram notifications"
git push
```

Проверьте вкладку **Actions** в вашем GitHub репозитории - там увидите процесс деплоя.

---

### **Шаг 5: Настройте Webhook в Supabase Dashboard**

1. Откройте: https://supabase.com/dashboard/project/whhlmtatsnxzovzbcnbp/database/hooks
2. Нажмите **Create a new hook**
3. Заполните:

   - **Name:** `telegram_notify_on_new_request`
   - **Table:** `requests`
   - **Events:** ✅ только `Insert`
   - **Type:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** `https://whhlmtatsnxzovzbcnbp.supabase.co/functions/v1/telegram-notify`
   - **HTTP Headers:**
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaGxtdGF0c254em92emJjbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3OTAsImV4cCI6MjA3NjEyNjc5MH0.2BF2fOtw2_Qc8QyiApgZ_-NMVyGO8mAjDrOT9oXeYH8
     ```

4. Нажмите **Create webhook**

---

## ✅ ГОТОВО!

Теперь при каждой новой заявке автоматически будет приходить сообщение в Telegram группу!

---

## 🧪 Как проверить:

1. Зайдите на сайт: https://www.obzor71.ru
2. Заполните форму заявки
3. Через пару секунд сообщение придёт в Telegram группу

---

## 🔍 Если что-то не работает:

**Проверьте логи функции:**
```bash
supabase functions logs telegram-notify
```

**Проверьте webhook в Supabase Dashboard:**
Database → Webhooks → кликните на ваш webhook → посмотрите Logs

---

## 📝 Примечание:

После настройки GitHub Actions:
- При каждом изменении файлов в `supabase/functions/` → автоматический деплой
- Можете также запустить деплой вручную: GitHub → Actions → Deploy Supabase Functions → Run workflow

## 🎯 Важно:

Секреты Telegram (`TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`) нужно добавить **ОДИН РАЗ** через CLI на вашем ПК (Шаг 2).
После этого они будут храниться в Supabase и функция будет их использовать автоматически.
