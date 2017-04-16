import { NgModule, ModuleWithProviders } from '@angular/core';
import { AsyncTrackerFactory } from './async-tracker-factory.service';

@NgModule({})
export class AsyncTrackerModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AsyncTrackerModule,
      providers: [
        AsyncTrackerFactory
      ]
    };
  }

}