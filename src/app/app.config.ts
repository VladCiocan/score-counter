import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app/app.routes';

// PrimeNG standalone config (important!)
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast'; // ✅ Înlocuiește MessagesModule/MessageModule

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    MessageService,
    importProvidersFrom(ToastModule) // Toast pentru mesaje (vezi mai jos)
  ]
};
