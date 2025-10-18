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
    // Проверяем секретный токен от Telegram
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (secretToken !== TELEGRAM_SECRET_TOKEN) {
      console.error('Invalid secret token')
      return new Response('Unauthorized', { status: 401 })
    }

    const update: TelegramUpdate = await req.json()
    
    // Проверяем, что это callback query
    if (!update.callback_query) {
      return new Response('OK', { status: 200 })
    }

    // Проверяем, что callback пришел из правильного чата
    const chatId = update.callback_query.message?.chat.id
    if (chatId && chatId.toString() !== TELEGRAM_CHAT_ID) {
      console.error('Invalid chat_id:', chatId)
      return new Response('OK', { status: 200 })
    }

    const { callback_query } = update
    const callbackData = callback_query.data

    // Парсим callback_data: формат "notify:request_id:status"
    if (!callbackData.startsWith('notify:')) {
      return new Response('OK', { status: 200 })
    }

    const parts = callbackData.split(':')
    if (parts.length !== 3) {
      console.error('Invalid callback_data format:', callbackData)
      return new Response('OK', { status: 200 })
    }

    const [, requestId, status] = parts

    // Создаем клиент Supabase с service role ключом для обхода RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Получаем данные заявки из базы
    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single<Request>()

    if (error || !request) {
      console.error('Error fetching request:', error)
      await answerCallbackQuery(callback_query.id, '❌ Заявка не найдена')
      return new Response('OK', { status: 200 })
    }

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

    console.log('📤 Отправка уведомления клиенту:', {
      requestId,
      status,
      heading,
      oneSignalId: request.onesignal_id
    })

    // Отправляем push уведомление через нашу Edge Function
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

    if (!notificationResponse.ok) {
      const errorData = await notificationResponse.json()
      console.error('❌ Ошибка Edge Function:', JSON.stringify(errorData, null, 2))
      await answerCallbackQuery(callback_query.id, '❌ Ошибка отправки уведомления')
      return new Response('OK', { status: 200 })
    }

    const result = await notificationResponse.json()
    console.log('✅ Push уведомление отправлено:', { requestId, status, heading, result })

    // Отвечаем на callback query
    await answerCallbackQuery(callback_query.id, `✅ Уведомление "${heading}" отправлено ${name}`)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error:', error)
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
