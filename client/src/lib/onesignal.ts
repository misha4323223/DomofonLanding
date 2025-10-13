declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
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

  async requestPermission(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.OneSignalDeferred) {
        reject(new Error('OneSignal SDK не загружен. Возможно, он заблокирован браузером.'));
        return;
      }
      
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.Slidedown.promptPush();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async setExternalUserId(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.OneSignalDeferred) {
        reject(new Error('OneSignal SDK не загружен'));
        return;
      }
      
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.login(userId);
        resolve();
      });
    });
  }

  async addTag(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.OneSignalDeferred) {
        reject(new Error('OneSignal SDK не загружен'));
        return;
      }
      
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.User.addTag(key, value);
        resolve();
      });
    });
  }

  async isPushSupported(): Promise<boolean> {
    if (!window.OneSignalDeferred) {
      return false;
    }

    return new Promise((resolve) => {
      window.OneSignalDeferred?.push(async (OneSignal: any) => {
        const supported = await OneSignal.Notifications.isPushSupported();
        resolve(supported);
      });
    });
  }

  async getPermissionState(): Promise<string> {
    if (!window.OneSignalDeferred) {
      return 'default';
    }

    return new Promise((resolve) => {
      window.OneSignalDeferred?.push(async (OneSignal: any) => {
        const permission = await OneSignal.Notifications.permissionNative;
        resolve(permission);
      });
    });
  }
}

export const oneSignalService = OneSignalService.getInstance();
