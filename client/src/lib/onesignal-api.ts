import type { OneSignalSubscriber, NotificationRequest } from "@shared/schema";

const ONESIGNAL_APP_ID = "3a40bd59-5a8b-40a1-ba68-59676525befb";
const ONESIGNAL_REST_API_KEY = "gka4scvfduuj5eux4soq64p2b";

export class OneSignalAPI {
  private appId: string;
  private apiKey: string;

  constructor() {
    this.appId = ONESIGNAL_APP_ID;
    this.apiKey = ONESIGNAL_REST_API_KEY;
  }

  async getSubscribers(): Promise<OneSignalSubscriber[]> {
    try {
      const response = await fetch(
        `https://onesignal.com/api/v1/players?app_id=${this.appId}&limit=300`,
        {
          method: "GET",
          headers: {
            "Authorization": `Basic ${this.apiKey}`,
            "Content-Type": "application/json",
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
      const payload = {
        app_id: this.appId,
        include_player_ids: [request.subscriberId],
        headings: { 
          en: request.heading,  // OneSignal требует английский язык
          ru: request.heading 
        },
        contents: { 
          en: request.message,  // OneSignal требует английский язык
          ru: request.message 
        },
      };

      console.log('📤 Отправка уведомления:', payload);

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ OneSignal API ошибка:', error);
        throw new Error(`OneSignal API error: ${JSON.stringify(error)}`);
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
