import type { OneSignalSubscriber, NotificationRequest } from "@shared/schema";

const SUPABASE_URL = 'https://whhlmtatsnxzovzbcnbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaGxtdGF0c254em92emJjbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3OTAsImV4cCI6MjA3NjEyNjc5MH0.2BF2fOtw2_Qc8QyiApgZ_-NMVyGO8mAjDrOT9oXeYH8';

export class OneSignalAPI {
  private functionsUrl: string;

  constructor() {
    this.functionsUrl = `${SUPABASE_URL}/functions/v1`;
  }

  async getSubscribers(): Promise<OneSignalSubscriber[]> {
    try {
      const response = await fetch(
        `${this.functionsUrl}/onesignal-get-subscribers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status}`);
      }

      const data = await response.json();
      return data.players || [];
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      throw error;
    }
  }

  async sendNotification(request: NotificationRequest): Promise<void> {
    try {
      console.log('📤 Отправка уведомления через Supabase Edge Function:', request);

      const response = await fetch(
        `${this.functionsUrl}/onesignal-send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Edge Function ошибка:', error);
        throw new Error(`Edge Function error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      console.log("✅ Уведомление отправлено успешно:", result);
    } catch (error) {
      console.error("❌ Ошибка отправки уведомления:", error);
      throw error;
    }
  }
}

export const oneSignalAPI = new OneSignalAPI();
