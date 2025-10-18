import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Redeploy to reload TELEGRAM_SECRET_TOKEN: 2025-10-18
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const TELEGRAM_SECRET_TOKEN = Deno.env.get('TELEGRAM_SECRET_TOKEN')!
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface TelegramUpdate {
  callback_query?: {
    id: string
    from: {
      id: number
      first_name: string
    }
    message?: {
      message_id: number
      chat: {
        id: number
      }
    }
    data: string
  }
}

interface Request {
  id: string
  created_at: string
  name: string
  phone: string
  city: string
  address: string
  apartment: string | null
  message: string | null
  onesignal_id: string | null
}

serve(async (req) => {
  try {
    console.log('🔔 ===== WEBHOOK ЗАПРОС ПОЛУЧЕН =====')
    console.log('📅 Время:', new Date().toISOString())
    console.log('🌐 Метод:', req.method)
    console.log('🔗 URL:', req.url)
    
    // Логируем все заголовки
    console.log('📋 Заголовки запроса:')
    req.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
    
    // Проверяем секретный токен от Telegram
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    console.log('🔑 Токен из заголовка:', secretToken ? `${secretToken.substring(0, 10)}...` : 'ОТСУТСТВУЕТ')
    console.log('🔐 Ожидаемый токен:', TELEGRAM_SECRET_TOKEN ? `${TELEGRAM_SECRET_TOKEN.substring(0, 10)}...` : 'НЕ УСТАНОВЛЕН')
    
    if (secretToken !== TELEGRAM_SECRET_TOKEN) {
      console.error('❌ ОШИБКА: Токен не совпадает!')
      console.error('Получен:', secretToken)
      console.error('Ожидался:', TELEGRAM_SECRET_TOKEN)
      return new Response('Unauthorized', { status: 401 })
    }
    
    console.log('✅ Токен проверен успешно')

    const update: TelegramUpdate = await req.json()
    console.log('📦 Данные update:', JSON.stringify(update, null, 2))
    
    // Проверяем, что это callback query
    if (!update.callback_query) {
      console.log('⚠️ Это не callback query, пропускаем')
      return new Response('OK', { status: 200 })
    }

    console.log('✅ Получен callback query')
    
    // Проверяем, что callback пришел из правильного чата
    const chatId = update.callback_query.message?.chat.id
    console.log('🏠 Chat ID из сообщения:', chatId)
    console.log('🏠 Ожидаемый Chat ID:', TELEGRAM_CHAT_ID)
    
    if (chatId && chatId.toString() !== TELEGRAM_CHAT_ID) {
      console.error('❌ Неверный chat_id:', chatId, 'ожидался:', TELEGRAM_CHAT_ID)
      return new Response('OK', { status: 200 })
    }

    const { callback_query } = update
    const callbackData = callback_query.data
    console.log('📱 Callback data:', callbackData)

    // Парсим callback_data: формат "notify:request_id:status"
    if (!callbackData.startsWith('notify:')) {
      console.log('⚠️ Callback data не начинается с "notify:", пропускаем')
      return new Response('OK', { status: 200 })
    }

    const parts = callbackData.split(':')
    if (parts.length !== 3) {
      console.error('❌ Неверный формат callback_data:', callbackData)
      return new Response('OK', { status: 200 })
    }

    const [, requestId, status] = parts
    console.log('🆔 Request ID:', requestId)
    console.log('📊 Статус:', status)

    // Создаем клиент Supabase с service role ключом для обхода RLS
    console.log('🗄️ Подключаемся к Supabase...')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Получаем данные заявки из базы
    console.log('🔍 Ищем заявку с ID:', requestId)
    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single<Request>()

    if (error || !request) {
      console.error('❌ Ошибка получения заявки:', error)
      await answerCallbackQuery(callback_query.id, '❌ Заявка не найдена')
      return new Response('OK', { status: 200 })
    }

    console.log('✅ Заявка найдена:', request.name)
    console.log('📱 OneSignal ID:', request.onesignal_id)

    // Проверяем, есть ли у клиента OneSignal ID
    if (!request.onesignal_id) {
      console.log('⚠️ У клиента нет OneSignal ID:', requestId)
      await answerCallbackQuery(callback_query.id, '⚠️ Клиент не подписан на уведомления')
      return new Response('OK', { status: 200 })
    }

    // Формируем заголовок и текст уведомления
    let heading = ""
    let message = ""
    const name = request.name || "Клиент"
    const address = request.address || "указанный адрес"

    switch (status) {
      case "processing":
        heading = "Заявка в обработке"
        message = `${name}, ваша заявка принята в работу. Мы свяжемся с вами в ближайшее время.`
        break
      case "departed":
        heading = "Мастер выехал"
        message = `${name}, мастер выехал к вам по адресу: ${address}`
        break
      case "solved":
        heading = "Проблема решена"
        message = `${name}, работа завершена. Спасибо за обращение! Как вам наше обслуживание?`
        break
      default:
        await answerCallbackQuery(callback_query.id, '❌ Неизвестный статус')
        return new Response('OK', { status: 200 })
    }

    console.log('📤 Подготовка к отправке уведомления:')
    console.log('  🆔 Request ID:', requestId)
    console.log('  📊 Статус:', status)
    console.log('  📝 Заголовок:', heading)
    console.log('  💬 Сообщение:', message)
    console.log('  🔔 OneSignal ID:', request.onesignal_id)

    // Отправляем push уведомление через нашу Edge Function
    console.log('🚀 Вызываем Edge Function onesignal-send-notification...')
    const notificationResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/onesignal-send-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          subscriberId: request.onesignal_id,
          heading: heading,
          message: message,
        }),
      }
    )

    console.log('📡 Статус ответа от Edge Function:', notificationResponse.status)
    
    if (!notificationResponse.ok) {
      const errorData = await notificationResponse.json()
      console.error('❌ Ошибка Edge Function:', JSON.stringify(errorData, null, 2))
      await answerCallbackQuery(callback_query.id, '❌ Ошибка отправки уведомления')
      return new Response('OK', { status: 200 })
    }

    const result = await notificationResponse.json()
    console.log('✅ Push уведомление успешно отправлено!')
    console.log('📋 Результат:', JSON.stringify(result, null, 2))

    // Отвечаем на callback query
    console.log('💬 Отправляем ответ на callback query...')
    await answerCallbackQuery(callback_query.id, `✅ Уведомление "${heading}" отправлено ${name}`)

    console.log('🎉 ===== WEBHOOK ОБРАБОТАН УСПЕШНО =====')
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('💥 ===== КРИТИЧЕСКАЯ ОШИБКА =====')
    console.error('❌ Тип ошибки:', error.constructor.name)
    console.error('❌ Сообщение:', error.message)
    console.error('❌ Стек:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false,
      }),
    })
  } catch (error) {
    console.error('Error answering callback query:', error)
  }
}
