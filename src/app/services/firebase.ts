/**
 * La conexión con Firebase.
 *
 * **No se usa `@angular/fire`.** Esa librería exige `@angular/core ^20` y acá
 * estamos en Angular 22: instalarla a la fuerza deja el `package-lock.json`
 * inconsistente. Se usa el SDK oficial de Firebase con tokens de inyección, que
 * es lo que `@angular/fire` hace por dentro y son treinta líneas.
 *
 * Se llama una vez, en `app.config.ts`:
 *
 *     provideFirebase(environment.firebase)
 *
 * y a partir de ahí los servicios piden `inject(FIRESTORE)` o `inject(AUTH)`.
 */
import {
  EnvironmentProviders,
  InjectionToken,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseStorage, getStorage } from 'firebase/storage';

const FIREBASE_APP = new InjectionToken<FirebaseApp>('FirebaseApp');

export const FIRESTORE = new InjectionToken<Firestore>('Firestore');

/**
 * El almacenamiento de archivos.
 *
 * Firestore guarda datos —textos, números, fechas—; los archivos van a otro
 * lado. Subir una imagen a Firestore en base64 es el error clásico: un
 * documento admite 1 MB en total y una foto de teléfono pesa cuatro.
 */
export const STORAGE = new InjectionToken<FirebaseStorage>('Storage');

/**
 * `Auth | null`, y el `null` es a propósito.
 *
 * En el servidor no hay sesión: no hay navegador, no hay cookies, no hay nadie
 * conectado. Pedirle a Firebase que inicialice la autenticación ahí es trabajo
 * tirado. Por eso en el servidor vale `null`, y el servicio lo contempla.
 */
export const AUTH = new InjectionToken<Auth | null>('Auth');

export function provideFirebase(options: FirebaseOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_APP,
      // En el servidor el módulo se reutiliza entre peticiones: si ya hay una
      // aplicación inicializada se toma esa. `initializeApp` dos veces lanza.
      useFactory: () => (getApps().length ? getApp() : initializeApp(options)),
    },
    {
      provide: FIRESTORE,
      useFactory: () => getFirestore(inject(FIREBASE_APP)),
    },
    {
      provide: AUTH,
      useFactory: () =>
        isPlatformBrowser(inject(PLATFORM_ID)) ? getAuth(inject(FIREBASE_APP)) : null,
    },
    {
      // El almacenamiento sí se crea en los dos lados: crearlo no abre ninguna
      // conexión, y así el servicio que lo usa no tiene que preguntar dónde
      // está corriendo. Subir un archivo, en cambio, solo pasa en el navegador:
      // el servidor no tiene un `File` que subir.
      provide: STORAGE,
      useFactory: () => getStorage(inject(FIREBASE_APP)),
    },
  ]);
}
