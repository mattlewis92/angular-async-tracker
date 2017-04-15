import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AsyncTrackerModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, AsyncTrackerModule.forRoot()],
  bootstrap: [DemoComponent]
})
export class DemoModule {}