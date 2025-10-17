# 🚀 Инструкция по настройке уведомлений в Telegram

Я уже создал всё необходимое! Осталось только задеплоить функцию в Supabase.

---

## ✅ ЧТО УЖЕ ГОТОВО:

В проекте созданы:
- `supabase/functions/telegram-notify/index.ts` - код функции для отправки в Telegram
- `supabase/config.toml` - конфигурация Supabase

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ ВАМ:

### **Шаг 1: Установите Supabase CLI (один раз)**

Выберите способ установки:

**Windows:**
```bash
npm install -g supabase
```

**MacOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
npm install -g supabase
```

---

### **Шаг 2: Войдите в Supabase**

```bash
supabase login
```

Откроется браузер - разрешите доступ.

---

### **Шаг 3: Свяжите проект**

В папке проекта выполните:

```bash
supabase link --project-ref whhlmtatsnxzovzbcnbp
```

Если попросит пароль от БД - найдите его в Supabase Dashboard → Settings → Database.

---

### **Шаг 4: Добавьте секреты**

Замените на ВАШИ данные:

```bash
# Токен вашего Telegram бота
supabase secrets set TELEGRAM_BOT_TOKEN=ваш_токен_бота_здесь

# ID вашей Telegram группы (обычно начинается с минуса, например: -1001234567890)
supabase secrets set TELEGRAM_CHAT_ID=ваш_chat_id_здесь
```

**Как узнать Chat ID группы:**
1. Добавьте бота в группу
2. Отправьте любое сообщение в группу
3. Откройте в браузере: `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates`
4. Найдите `"chat":{"id":-1001234567890` - это и есть Chat ID

---

### **Шаг 5: Задеплойте функцию**

```bash
supabase functions deploy telegram-notify
```

Вы увидите URL функции, например:
`https://whhlmtatsnxzovzbcnbp.supabase.co/functions/v1/telegram-notify`

---

### **Шаг 6: Настройте Webhook в Supabase Dashboard**

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

Все эти файлы уже добавлены в GitHub, так что после коммита они будут синхронизированы.
Но сам deploy функции в Supabase нужно делать через CLI (это безопасность Supabase).
