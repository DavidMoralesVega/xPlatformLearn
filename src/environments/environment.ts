/**
 * Configuración del proyecto de Firebase.
 *
 * ESTO NO ES UN SECRETO. La `apiKey` de Firebase Web **identifica** al proyecto;
 * no **autoriza** nada. Viaja en el paquete que se descarga el navegador y
 * cualquiera puede leerla con Ver código fuente.
 *
 * Lo que protege los datos son las reglas de seguridad de Firestore, que corren
 * en los servidores de Google.
 */
import type { FirebaseOptions } from 'firebase/app';

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDZTLwTz8nMrSgWUvcGnoKdgpZBDkLdIO4',
    authDomain: 'learn-unior.firebaseapp.com',
    projectId: 'learn-unior',
    storageBucket: 'learn-unior.firebasestorage.app',
    messagingSenderId: '1065088421211',
    appId: '1:1065088421211:web:292671205bc6168a699e7e',
    measurementId: 'G-3Z165PTM2S',
  } satisfies FirebaseOptions,
} as const;
