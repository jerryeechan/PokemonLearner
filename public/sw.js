/* eslint-disable no-restricted-globals */
// PokemonLearner Service Worker - Notification scheduling only (no caching)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

let scheduledTimeout = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delayMs, tag } = event.data;

    if (scheduledTimeout) clearTimeout(scheduledTimeout);

    scheduledTimeout = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/PokemonLearner/vite.svg',
        badge: '/PokemonLearner/vite.svg',
        tag: tag || 'pokemon-learner-reminder',
        data: { url: '/PokemonLearner/' },
        requireInteraction: true,
      });
    }, delayMs);
  }

  if (event.data.type === 'CANCEL_NOTIFICATION') {
    if (scheduledTimeout) {
      clearTimeout(scheduledTimeout);
      scheduledTimeout = null;
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('PokemonLearner') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(event.notification.data?.url || '/PokemonLearner/');
    })
  );
});
