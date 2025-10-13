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
  private initialized = false;

  private constructor() {}

  static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  async initialize(config: OneSignalConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    return new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: config.appId,
          allowLocalhostAsSecureOrigin: true,
        });
        this.initialized = true;
        resolve();
      });
    });
  }

  async requestPermission(): Promise<void> {
    if (!this.initialized) {
      throw new Error('OneSignal not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!window.OneSignalDeferred) {
        reject(new Error('OneSignal SDK not loaded'));
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
    if (!this.initialized) {
      throw new Error('OneSignal not initialized');
    }

    return new Promise((resolve) => {
      window.OneSignalDeferred?.push(async (OneSignal: any) => {
        await OneSignal.login(userId);
        resolve();
      });
    });
  }

  async addTag(key: string, value: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('OneSignal not initialized');
    }

    return new Promise((resolve) => {
      window.OneSignalDeferred?.push(async (OneSignal: any) => {
        await OneSignal.User.addTag(key, value);
        resolve();
      });
    });
  }

  async isPushSupported(): Promise<boolean> {
    if (!this.initialized) {
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
    if (!this.initialized) {
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
