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
import { DeviceComponent } from './device/device.component';
import { SettingsComponent } from './settings/settings.component';
import { DataShowComponent } from './data-show/data-show.component';
import { DataComponent } from './data/data.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { DeviceIntfComponent } from './device-intf/device-intf.component';
import { DataShowDialogComponent } from './data-show-dialog/data-show-dialog.component';
import { DatePipe } from '@angular/common';
import { Ng4JsonEditorModule } from 'angular4-jsoneditor';

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
    DeviceComponent,
    SettingsComponent,
    DataShowComponent,
    DataComponent,
    PlaceholderComponent,
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
    Ng4JsonEditorModule,
    RouterModule.forRoot([
      {
        path: 'device',
        component: DeviceComponent,
        children: [
          { path: '', component: PlaceholderComponent },
          { path: 'tag', component: DeviceTagComponent },
          { path: 'pdw', component: DevicePdwComponent },
          { path: 'radiation', component: DeviceRadiationComponent },
          { path: 'intf', component: DeviceIntfComponent } // ,
          // { path: 'phase', component: DevicePhaseComponent },
          // { path: 'location', component: DeviceLocationComponent }
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
        component: ProtoInComponent
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
