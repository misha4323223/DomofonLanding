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
      
      // Проверяем текущее состояние подписки
      let subscriptionId = OneSignal.User.PushSubscription.id;
      
      console.log('🔍 Первая попытка получить Subscription ID:', subscriptionId);
      
      // Если ID еще нет - ждем событие изменения подписки
      if (!subscriptionId) {
        console.log('⏳ ID не найден, ждем события subscriptionChange...');
        
        subscriptionId = await new Promise<string | null>((resolve) => {
          let attempts = 0;
          const maxAttempts = 10;
          
          const checkId = () => {
            attempts++;
            const currentId = OneSignal.User.PushSubscription.id;
            
            console.log(`🔄 Попытка ${attempts}/${maxAttempts}, ID:`, currentId);
            
            if (currentId) {
              resolve(currentId);
            } else if (attempts >= maxAttempts) {
              console.warn('⚠️ Превышено максимальное количество попыток');
              resolve(null);
            } else {
              setTimeout(checkId, 500); // Проверяем каждые 500мс
            }
          };
          
          // Подписываемся на событие изменения подписки
          OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
            console.log('📢 Событие subscriptionChange:', event);
            if (event.current?.id) {
              resolve(event.current.id);
            }
          });
          
          // Начинаем периодическую проверку
          setTimeout(checkId, 500);
        });
      }
      
      console.log('✅ OneSignal Subscription ID получен:', subscriptionId);
      return subscriptionId || null;
      
    } catch (error) {
      console.error('❌ Ошибка получения OneSignal Subscription ID:', error);
      return null;
    }
  }
}

export const oneSignalService = OneSignalService.getInstance();
