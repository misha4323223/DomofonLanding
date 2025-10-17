declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

export interface OneSignalConfig {
  appId: string;
}

export class OneSignalService {
  private static instance: OneSignalService;

  private constructor() {}

  static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  private async getOneSignal(): Promise<any> {
    // Если OneSignal уже загружен - используем его напрямую
    if (window.OneSignal) {
      return window.OneSignal;
    }

    // Если нет - ждём через Deferred
    return new Promise((resolve, reject) => {
      if (!window.OneSignalDeferred) {
        reject(new Error('OneSignal SDK не загружен. Возможно, он заблокирован браузером.'));
        return;
      }

      window.OneSignalDeferred.push((OneSignal: any) => {
        resolve(OneSignal);
      });
    });
  }

  async requestPermission(): Promise<void> {
    try {
      const OneSignal = await this.getOneSignal();
      await OneSignal.Slidedown.promptPush();
    } catch (error) {
      throw error;
    }
  }

  async setExternalUserId(userId: string): Promise<void> {
    const OneSignal = await this.getOneSignal();
    await OneSignal.login(userId);
  }

  async addTag(key: string, value: string): Promise<void> {
    const OneSignal = await this.getOneSignal();
    await OneSignal.User.addTag(key, value);
  }

  async isPushSupported(): Promise<boolean> {
    try {
      const OneSignal = await this.getOneSignal();
      return await OneSignal.Notifications.isPushSupported();
    } catch {
      return false;
    }
  }

  async getPermissionState(): Promise<string> {
    try {
      const OneSignal = await this.getOneSignal();
      return await OneSignal.Notifications.permissionNative;
    } catch {
      return 'default';
    }
  }

  async getSubscriptionId(): Promise<string | null> {
    try {
      const OneSignal = await this.getOneSignal();
      
      // В OneSignal SDK v16 правильный способ получения Push Subscription ID:
      const subscriptionId = await OneSignal.User.PushSubscription.id;
      
      console.log('🆔 OneSignal Subscription ID получен:', subscriptionId);
      
      return subscriptionId || null;
    } catch (error) {
      console.error('❌ Ошибка получения OneSignal Subscription ID:', error);
      return null;
    }
  }
}

export const oneSignalService = OneSignalService.getInstance();
