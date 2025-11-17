import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app/app.routes';

import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {providePrimeNG} from 'primeng/config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async'; // ✅ Înlocuiește MessagesModule/MessageModule

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    }),
    MessageService,
    importProvidersFrom(ToastModule)
  ]
};
