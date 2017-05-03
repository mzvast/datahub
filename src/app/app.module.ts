import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DatabaseService } from './database.service';
import { UdpService } from './udp.service';
import { MysidenavComponent } from './mysidenav/mysidenav.component';
import { ProtoAddrComponent } from './proto-addr/proto-addr.component';
import { ProtoInComponent } from './proto-in/proto-in.component';
import { ProtoOutComponent } from './proto-out/proto-out.component';

@NgModule({
  declarations: [
    AppComponent,
    MysidenavComponent,
    ProtoAddrComponent,
    ProtoInComponent,
    ProtoOutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'proto-addr',
        component: ProtoAddrComponent
      },
      {
        path: 'proto-in',
        component: ProtoInComponent
      },
      {
        path: 'proto-out',
        component: ProtoOutComponent
      }
    ])
  ],
  providers: [DatabaseService, UdpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
