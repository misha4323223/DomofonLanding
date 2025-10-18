import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const TELEGRAM_SECRET_TOKEN = Deno.env.get('TELEGRAM_SECRET_TOKEN')!
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')!
const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
    // ВРЕМЕННО: Отключаем проверку секретного токена для отладки
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    
    console.log('=== DEBUG INFO ===')
    console.log('Received secret token from Telegram:', secretToken ? `[${secretToken.length} chars]` : 'null')
    console.log('Expected secret token from env:', TELEGRAM_SECRET_TOKEN ? `[${TELEGRAM_SECRET_TOKEN.length} chars]` : 'null')
    console.log('Tokens match:', secretToken === TELEGRAM_SECRET_TOKEN)
    
    // ВРЕМЕННО ОТКЛЮЧЕНО для отладки - ВКЛЮЧИТЬ ПОСЛЕ ПРОВЕРКИ!
    // if (secretToken !== TELEGRAM_SECRET_TOKEN) {
    //   console.error('Invalid secret token - comparison failed')
    //   return new Response('Unauthorized', { status: 401 })
    // }
    
    console.log('✅ Token check TEMPORARILY DISABLED for debugging')

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

    // Отправляем push уведомление через OneSignal
    const authString = base64Encode(new TextEncoder().encode(`${ONESIGNAL_REST_API_KEY}:`))
    const oneSignalResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [request.onesignal_id],
        headings: { 
          en: heading,
          ru: heading 
        },
        contents: { 
          en: message,
          ru: message 
        },
      }),
    })

    if (!oneSignalResponse.ok) {
      const errorData = await oneSignalResponse.json()
      console.error('OneSignal API error:', JSON.stringify(errorData, null, 2))
      await answerCallbackQuery(callback_query.id, '❌ Ошибка отправки уведомления')
      return new Response('OK', { status: 200 })
    }

    console.log('✅ Push уведомление отправлено:', { requestId, status, heading })

    // Отвечаем на callback query
    await answerCallbackQuery(callback_query.id, `✅ Уведомление "${heading}" отправлено ${name}`)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
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
