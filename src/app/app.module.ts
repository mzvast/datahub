import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppComponent } from './app.component';
import { DatabaseService } from './database.service';
import { TcpService } from './tcp.service';
import { SettingService } from './setting.service';
import { MysidenavComponent } from './mysidenav/mysidenav.component';
import { ProtoInComponent } from './proto-in/proto-in.component';
import { ProtoOutComponent } from './proto-out/proto-out.component';
import { DevicePdwComponent } from './device-pdw/device-pdw.component';
import { DeviceTagComponent } from './device-tag/device-tag.component';
import { DeviceRadiationComponent } from './device-radiation/device-radiation.component';
import { DevicePhaseComponent } from './device-phase/device-phase.component';
import { DeviceLocationComponent } from './device-location/device-location.component';
import { ProtoInTagComponent } from './proto-in-tag/proto-in-tag.component';
import { ProtoInWidePdwComponent } from './proto-in-wide-pdw/proto-in-wide-pdw.component';
import { ProtoInNarrowPdwComponent } from './proto-in-narrow-pdw/proto-in-narrow-pdw.component';
import { ProtoInWideRadiationComponent } from './proto-in-wide-radiation/proto-in-wide-radiation.component';
import { ProtoInNarrowRadiationComponent } from './proto-in-narrow-radiation/proto-in-narrow-radiation.component';
import { ProtoInLocationComponent } from './proto-in-location/proto-in-location.component';
import { ProtoInPhraseComponent } from './proto-in-phrase/proto-in-phrase.component';
import { DeviceComponent } from './device/device.component';
import { SettingsComponent } from './settings/settings.component';
import { DataShowComponent } from './data-show/data-show.component';
import { DataComponent } from './data/data.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { ProtoInIntfComponent } from './proto-in-intf/proto-in-intf.component';
import { DeviceIntfComponent } from './device-intf/device-intf.component';
import { DataShowDialogComponent } from './data-show-dialog/data-show-dialog.component';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    MysidenavComponent,
    ProtoInComponent,
    ProtoOutComponent,
    DevicePdwComponent,
    DeviceTagComponent,
    DeviceRadiationComponent,
    DevicePhaseComponent,
    DeviceLocationComponent,
    ProtoInTagComponent,
    ProtoInWidePdwComponent,
    ProtoInNarrowPdwComponent,
    ProtoInWideRadiationComponent,
    ProtoInNarrowRadiationComponent,
    ProtoInLocationComponent,
    ProtoInPhraseComponent,
    DeviceComponent,
    SettingsComponent,
    DataShowComponent,
    DataComponent,
    PlaceholderComponent,
    ProtoInIntfComponent,
    DeviceIntfComponent,
    DataShowDialogComponent
  ],
  imports: [
    NgxDatatableModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'device',
        component: DeviceComponent,
        children: [
          { path: '', component: PlaceholderComponent },
          { path: 'tag', component: DeviceTagComponent },
          { path: 'pdw', component: DevicePdwComponent },
          { path: 'radiation', component: DeviceRadiationComponent },
          { path: 'intf', component: DeviceIntfComponent },
          { path: 'phase', component: DevicePhaseComponent },
          { path: 'location', component: DeviceLocationComponent }
        ]
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'data',
        component: DataComponent,
        children: [
          { path: '', component: PlaceholderComponent },
          { path: 'show/:type', component: DataShowComponent }
        ]
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
          { path: 'intf', component: ProtoInIntfComponent },
          { path: 'phrase', component: ProtoInPhraseComponent }
        ]
      }
    ])
  ],
  entryComponents: [
    DataShowDialogComponent
  ],
  providers: [DatabaseService, TcpService, SettingService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
