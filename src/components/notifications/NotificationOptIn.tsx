import { useState } from 'react';
import { notificationCharacters } from '../../data/notificationCharacters';
import { isNotificationSupported, requestNotificationPermission } from '../../services/notificationPermission';
import { registerServiceWorker, scheduleNextNotification } from '../../services/notificationScheduler';
import { useNotificationStore } from '../../stores/notificationStore';
import { useProgressStore } from '../../stores/progressStore';

export function NotificationOptIn() {
  const { dismissCount, lastDismissDate, permissionGranted } = useNotificationStore();
  const { setPermissionGranted, dismissOptIn, markAsked } = useNotificationStore();
  const { xp, unlockedChapters } = useProgressStore();
  const [visible, setVisible] = useState(true);

  // Don't show if already granted, not supported, or no XP yet
  if (permissionGranted || !isNotificationSupported() || xp === 0) return null;

  // Don't show if dismissed 3+ times
  if (dismissCount >= 3) return null;

  // Don't show if dismissed recently (within 3 days)
  if (lastDismissDate) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastDismissDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince < 3) return null;
  }

  // Browser already denied
  if ('Notification' in window && Notification.permission === 'denied') return null;

  if (!visible) return null;

  // Pick a character for the prompt
  const eligible = notificationCharacters.filter(
    (c) => c.unlockedByChapter <= Math.max(...unlockedChapters)
  );
  const character = eligible[eligible.length - 1] || notificationCharacters[0];
  const message = character.messages.firstTime[0];

  const handleAccept = async () => {
    markAsked();
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      const reg = await registerServiceWorker();
      if (reg) {
        // Wait for activation
        await new Promise<void>((resolve) => {
          if (reg.active) { resolve(); return; }
          const w = reg.installing || reg.waiting;
          if (w) {
            w.addEventListener('statechange', () => {
              if (w.state === 'activated') resolve();
            });
          } else {
            resolve();
          }
        });
        scheduleNextNotification(reg);
      }
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    dismissOptIn();
    markAsked();
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className={`${character.themeColor} rounded-3xl p-6 max-w-sm w-full shadow-xl border-2`}>
        <div className="text-center mb-4">
          <span className="text-5xl">{character.emoji}</span>
        </div>

        <p className="text-center font-bold text-lg mb-2">
          {character.nameJa}
          <span className="text-gray-500 text-sm ml-1">({character.nameZh})</span>
        </p>

        <p className="text-center text-sm leading-relaxed mb-2">{message}</p>

        <p className="text-center text-gray-500 text-xs mb-6">
          開啟通知，讓道館館主每天提醒你練習日語！
        </p>

        <div className="space-y-2">
          <button
            onClick={handleAccept}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all shadow-[0_3px_0_0_rgba(22,163,74,1)]"
          >
            好，開啟通知！🔔
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-gray-400 font-bold py-2 text.sm hover:text-gray-600 transition-colors"
          >
            之後再說
          </button>
        </div>
      </div>
    </div>
  );
}
