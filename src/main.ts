import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideZoneChangeDetection } from '@angular/core';
import { AppModule } from './app/app.module';

// Mirrors workforce-management/frontend/src/app.ts:
// NgModule bootstrap via platformBrowserDynamic + zone-based change detection.
platformBrowserDynamic()
  .bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch(error => console.error(error));
