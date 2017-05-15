import { ProtoInWidepdwComponent } from './proto-in-widepdw/proto-in-widepdw.component';
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
import { DeviceMainComponent } from './device-main/device-main.component';
import { DevicePdwComponent } from './device-pdw/device-pdw.component';
import { DeviceTagComponent } from './device-tag/device-tag.component';
import { DeviceRadiationComponent } from './device-radiation/device-radiation.component';
import { DeviceIfComponent } from './device-if/device-if.component';
import { DevicePhaseComponent } from './device-phase/device-phase.component';
import { DeviceLocationComponent } from './device-location/device-location.component';
import { ProtoInTagComponent } from './proto-in-tag/proto-in-tag.component';
import { ProtoInWidePdwComponent } from './proto-in-wide-pdw/proto-in-wide-pdw.component';
import { ProtoInNarrowPdwComponent } from './proto-in-narrow-pdw/proto-in-narrow-pdw.component';
import { ProtoInWideRadiationComponent } from './proto-in-wide-radiation/proto-in-wide-radiation.component';
import { ProtoInNarrowRadiationComponent } from './proto-in-narrow-radiation/proto-in-narrow-radiation.component';
import { ProtoInLocationComponent } from './proto-in-location/proto-in-location.component';
import { ProtoInIfComponent } from './proto-in-if/proto-in-if.component';
import { ProtoInPhraseComponent } from './proto-in-phrase/proto-in-phrase.component';

@NgModule({
  declarations: [
    AppComponent,
    MysidenavComponent,
    ProtoAddrComponent,
    ProtoInComponent,
    ProtoOutComponent,
    DeviceMainComponent,
    DevicePdwComponent,
    DeviceTagComponent,
    DeviceRadiationComponent,
    DeviceIfComponent,
    DevicePhaseComponent,
    DeviceLocationComponent,
    ProtoInTagComponent,
    ProtoInWidePdwComponent,
    ProtoInNarrowPdwComponent,
    ProtoInWideRadiationComponent,
    ProtoInNarrowRadiationComponent,
    ProtoInLocationComponent,
    ProtoInIfComponent,
    ProtoInPhraseComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'device-main',
        component: DeviceMainComponent,
        children: [
          { path: '', component: DeviceTagComponent },
          { path: 'tag', component: DeviceTagComponent },
          { path: 'pdw', component: DevicePdwComponent },
          { path: 'radiation', component: DeviceRadiationComponent },
          { path: 'if', component: DeviceIfComponent },
          { path: 'phase', component: DevicePhaseComponent },
          { path: 'location', component: DeviceLocationComponent }
        ]
      },
      {
        path: 'proto-addr',
        component: ProtoAddrComponent
      },
      {
        path: 'proto-out',
        component: ProtoOutComponent
      },
      {
        path: 'proto-in',
        component: ProtoInComponent,
        children: [
          { path: '', component: ProtoInTagComponent },
          { path: 'tag', component: ProtoInTagComponent },
          { path: 'wide-pdw', component: ProtoInWidePdwComponent },
          { path: 'wide-radiation', component: ProtoInWideRadiationComponent },
          { path: 'location', component: ProtoInLocationComponent },
          { path: 'narrow-pdw', component: ProtoInNarrowPdwComponent },
          { path: 'narrow-radiation', component: ProtoInNarrowRadiationComponent },
          { path: 'if', component: ProtoInIfComponent },
          { path: 'phrase', component: ProtoInPhraseComponent }
        ]
      }
    ])
  ],
  providers: [DatabaseService, UdpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
