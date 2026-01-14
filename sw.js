self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png', // Tu logo
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      matchId: data.matchId
    },
    actions: [
      {
        action: 'view',
        title: 'Ver partido'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ],
    tag: data.tag || 'default',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});