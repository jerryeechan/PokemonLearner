import { notificationCharacters } from '../data/notificationCharacters';
import { useNotificationStore } from '../stores/notificationStore';
import { useProgressStore } from '../stores/progressStore';

const BASE = '/PokemonLearner/';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(`${BASE}sw.js`);
  } catch {
    console.warn('Service Worker registration failed');
    return null;
  }
}

export function scheduleNextNotification(registration: ServiceWorkerRegistration) {
  const { preferredHour, enabled } = useNotificationStore.getState();
  if (!enabled) return;

  const { unlockedChapters, streak, lastSessionDate } = useProgressStore.getState();

  // Pick a character
  const eligible = notificationCharacters.filter(
    (c) => c.unlockedByChapter <= Math.max(...unlockedChapters)
  );
  const character = eligible[Math.floor(Math.random() * eligible.length)] || notificationCharacters[0];

  // Determine message category
  let category: 'streakAtRisk' | 'comeBack' | 'longStreak' = 'streakAtRisk';
  if (streak >= 7) category = 'longStreak';
  const today = new Date().toISOString().split('T')[0];
  if (lastSessionDate !== today) category = 'streakAtRisk';

  const messages = character.messages[category];
  const message = messages[Math.floor(Math.random() * messages.length)];

  // Calculate delay
  const now = new Date();
  const target = new Date();
  target.setHours(preferredHour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delayMs = target.getTime() - now.getTime();

  registration.active?.postMessage({
    type: 'SCHEDULE_NOTIFICATION',
    title: `${character.emoji} ${character.nameJa} (${character.nameZh})`,
    body: message,
    delayMs,
    tag: 'pokemon-learner-daily',
  });
}

export function cancelScheduledNotification(registration: ServiceWorkerRegistration) {
  registration.active?.postMessage({ type: 'CANCEL_NOTIFICATION' });
}

export async function initNotifications() {
  const { enabled, permissionGranted } = useNotificationStore.getState();
  if (!enabled || !permissionGranted) return;

  const registration = await registerServiceWorker();
  if (registration) {
    // Wait for SW to be active
    if (!registration.active) {
      await new Promise<void>((resolve) => {
        registration.addEventListener('statechange', () => {
          if (registration.active) resolve();
        });
        // Also check installing/waiting worker
        const worker = registration.installing || registration.waiting;
        if (worker) {
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') resolve();
          });
        }
      });
    }
    scheduleNextNotification(registration);
  }
}
