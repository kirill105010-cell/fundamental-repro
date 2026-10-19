import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopoverModule, ButtonModule, BusyIndicatorModule } from '@fundamental-ngx/core';

import { AppComponent } from './app.component';
import {SidebarSplitterComponent} from "./sidebar-splitter/sidebar-splitter.component";

@NgModule({
  declarations: [AppComponent, SidebarSplitterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PopoverModule,
    ButtonModule,
    BusyIndicatorModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
