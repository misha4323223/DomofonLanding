import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')!

interface RequestData {
  type: 'INSERT'
  table: string
  record: {
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
}

serve(async (req) => {
  try {
    const payload: RequestData = await req.json()
    
    // Проверяем, что это новая заявка
    if (payload.type !== 'INSERT' || payload.table !== 'requests') {
      return new Response('OK', { status: 200 })
    }

    const { record } = payload
    
    // Форматируем сообщение для Telegram
    const message = `
🔔 <b>Новая заявка!</b>

👤 <b>Имя:</b> ${record.name}
📱 <b>Телефон:</b> ${record.phone}
🏙 <b>Город:</b> ${record.city}
📍 <b>Адрес:</b> ${record.address}${record.apartment ? `\n🏠 <b>Квартира:</b> ${record.apartment}` : ''}${record.message ? `\n\n💬 <b>Комментарий:</b>\n${record.message}` : ''}

🕐 <b>Время:</b> ${new Date(record.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
🆔 <b>ID:</b> ${record.id}
    `.trim()

    // Формируем inline клавиатуру (только если есть onesignal_id)
    const keyboard = record.onesignal_id ? {
      inline_keyboard: [
        [
          {
            text: '🔵 В обработке',
            callback_data: `notify:${record.id}:processing`
          },
          {
            text: '🚗 Мастер выехал',
            callback_data: `notify:${record.id}:departed`
          },
          {
            text: '✅ Решена',
            callback_data: `notify:${record.id}:solved`
          }
        ]
      ]
    } : undefined

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Telegram API error:', error)
      throw new Error(`Telegram API error: ${error}`)
    }

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
