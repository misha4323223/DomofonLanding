import type { OneSignalSubscriber, NotificationRequest } from "@shared/schema";

const ONESIGNAL_APP_ID = "3a40bd59-5a8b-40a1-ba68-59676525befb";
const ONESIGNAL_REST_API_KEY = "os_v2_app_hjal2wk2rnakdotilftwkjn67pgka4scvfduuj5eux4soq64p2bmbdntafwflpkxt65ar7wlllxfxju6q32qctsyevcndynwb27wahi";

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
        headings: { en: request.heading },
        contents: { en: request.message },
        ...(request.tags && { filters: this.createTagFilters(request.tags) }),
      };

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
        throw new Error(`Failed to send notification: ${JSON.stringify(error)}`);
      }

      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  }

  private createTagFilters(tags: Record<string, string>) {
    return Object.entries(tags).map(([key, value], index) => ({
      field: "tag",
      key,
      relation: "=",
      value,
      ...(index > 0 && { operator: "AND" }),
    }));
  }
}

export const oneSignalAPI = new OneSignalAPI();
