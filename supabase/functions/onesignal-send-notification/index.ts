import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Redeploy to reload ONESIGNAL_REST_API_KEY: 2025-10-19
const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!

interface NotificationRequest {
  subscriberId: string
  message: string
  heading: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 ONESIGNAL_APP_ID:', ONESIGNAL_APP_ID)
    console.log('🔍 ONESIGNAL_APP_ID тип:', typeof ONESIGNAL_APP_ID)
    console.log('🔍 ONESIGNAL_APP_ID длина:', ONESIGNAL_APP_ID?.length)
    console.log('🔍 ONESIGNAL_REST_API_KEY длина:', ONESIGNAL_REST_API_KEY?.length)
    
    const { subscriberId, message, heading }: NotificationRequest = await req.json()

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [subscriberId],
      headings: {
        en: heading,
        ru: heading
      },
      contents: {
        en: message,
        ru: message
      },
    }

    console.log('📤 Отправка уведомления через Edge Function:', payload)
    console.log('📤 JSON payload:', JSON.stringify(payload, null, 2))

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ OneSignal API ошибка:', error)
      throw new Error(`OneSignal API error: ${JSON.stringify(error)}`)
    }

    const result = await response.json()
    console.log("✅ Уведомление отправлено успешно:", result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
