import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  // Permission
  permissionGranted: boolean;
  hasBeenAsked: boolean;
  dismissCount: number;
  lastDismissDate: string;

  // Preferences
  enabled: boolean;
  preferredHour: number; // 0-23

  // Banner tracking
  lastBannerDismissed: string; // ISO date

  // Actions
  setPermissionGranted: (granted: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  setPreferredHour: (hour: number) => void;
  dismissBanner: () => void;
  dismissOptIn: () => void;
  markAsked: () => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      permissionGranted: false,
      hasBeenAsked: false,
      dismissCount: 0,
      lastDismissDate: '',
      enabled: false,
      preferredHour: 20,
      lastBannerDismissed: '',

      setPermissionGranted: (granted) => set({ permissionGranted: granted, enabled: granted }),
      setEnabled: (enabled) => set({ enabled }),
      setPreferredHour: (hour) => set({ preferredHour: hour }),
      dismissBanner: () => set({ lastBannerDismissed: getTodayDateString() }),
      dismissOptIn: () => set((state) => ({
        dismissCount: state.dismissCount + 1,
        lastDismissDate: getTodayDateString(),
      })),
      markAsked: () => set({ hasBeenAsked: true }),
    }),
    { name: 'pokemon-learner-notifications' }
  )
);
