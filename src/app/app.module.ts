import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {MaterialModule, MdIconModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DatabaseService } from './database.service';
import { UdpService } from './udp.service';
import { MysidenavComponent } from './mysidenav/mysidenav.component';

@NgModule({
  declarations: [
    AppComponent,
    MysidenavComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    MdIconModule,
    BrowserAnimationsModule
  ],
  providers: [DatabaseService, UdpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
