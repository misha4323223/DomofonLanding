import { useEffect } from 'react';
import { oneSignalService } from '@/lib/onesignal';

const ONESIGNAL_APP_ID = '3a40bd59-5a8b-40a1-ba68-59676525befb';

export function OneSignalInit() {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await oneSignalService.initialize({ appId: ONESIGNAL_APP_ID });
        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('Failed to initialize OneSignal:', error);
      }
    };

    initOneSignal();
  }, []);

  return null;
}
