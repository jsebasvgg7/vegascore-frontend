// public/sw.js - Service Worker para Push Notifications

self.addEventListener('push', function(event) {
  console.log('Push notification received');
  
  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Error parsing push data:', e);
    data = {
      title: 'Nueva notificación',
      body: 'Tienes una nueva actualización'
    };
  }
  
  const options = {
    body: data.body || 'Nuevo contenido disponible',
    icon: 'GlobalSCore - Imgur.png',
    badge: 'GlobalSCore - Imgur.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      matchId: data.matchId,
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: '👀 Ver partido',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: '✖️ Cerrar',
        icon: '/icons/close.png'
      }
    ],
    tag: data.tag || `notification-${Date.now()}`,
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '⚽ GlobalScore', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Abrir la URL del partido
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
    return;
  } else {
    // Click en la notificación (no en un botón)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});