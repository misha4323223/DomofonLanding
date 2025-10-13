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
}

export const oneSignalService = OneSignalService.getInstance();
