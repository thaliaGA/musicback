// src/pushServer.ts

import webpush from 'web-push';
import keys from './Keys.json';

// Define la interfaz para pushSubscription
interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

webpush.setVapidDetails(
  'mailto:alondra.garcia.21s@utzmg.edu.mx',
  keys.publicKey,
  keys.privateKey
);

// Función para enviar notificaciones push
export function sendPush(pushSubscription: PushSubscription, message: string) {
  const payload = JSON.stringify({
    title: 'Datos enviados:p',
    body: message,
  });

  return webpush.sendNotification(pushSubscription, payload);
}
