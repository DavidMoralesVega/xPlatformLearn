import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebase } from './services/firebase';
import { environment } from '../environments/environment';

// El idioma de los formatos. Sin esto, `{{ 7000 | number }}` sale «7,000» a la
// inglesa; con Bolivia registrado sale «7.000», que es como se escribe acá.
registerLocaleData(localeEsBo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-BO' },

    provideRouter(
      routes,
      // Al navegar, la pantalla nueva empieza arriba. Sin esto se entra a la
      // ficha de un programa a media altura, donde había quedado el catálogo.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideClientHydration(),

    // Firebase, una sola vez. De acá en adelante los servicios piden
    // `inject(FIRESTORE)` o `inject(AUTH)` y no vuelven a hablar del tema.
    provideFirebase(environment.firebase),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
