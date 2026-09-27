import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// provideHttpClient/provideAnimations/provideRouter são a versão "funcional"
// do que, no Angular com NgModules, você fazia importando HttpClientModule,
// BrowserAnimationsModule e RouterModule.forRoot() no array "imports" do
// AppModule. A ideia é a mesma (registrar serviços globais da aplicação),
// só que sem precisar de um módulo raiz.
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
  ]
};
