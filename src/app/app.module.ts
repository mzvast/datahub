import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {MaterialModule} from '@angular/material';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

import {AppComponent} from './app.component';
import {DatabaseService} from './database.service';
import {TcpService} from './tcp.service';
import {SettingService} from './setting.service';
import {MysidenavComponent} from './mysidenav/mysidenav.component';
import {ProtoOutComponent} from './proto-out/proto-out.component';
import {DevicePdwComponent} from './device-pdw/device-pdw.component';
import {DeviceTagComponent} from './device-tag/device-tag.component';
import {DeviceRadiationComponent} from './device-radiation/device-radiation.component';
import {DeviceComponent} from './device/device.component';
import {SettingsComponent} from './settings/settings.component';
import {DataShowComponent} from './data-show/data-show.component';
import {DataComponent} from './data/data.component';
import {PlaceholderComponent} from './placeholder/placeholder.component';
import {DeviceIntfComponent} from './device-intf/device-intf.component';
import {DataShowDialogComponent} from './data-show-dialog/data-show-dialog.component';
import {DatePipe} from '@angular/common';
import {Ng4JsonEditorModule} from 'angular4-jsoneditor';
import {ClipboardModule} from 'ngx-clipboard';
import {HighlightPipe} from './highlight.pipe';
import {ProtoInComponent} from './proto-in/proto-in.component';
import {ModalDialogComponent} from './modal.dialog.component';
import {DeviceCustomComponent} from './device-custom/device-custom.component';
import {DeviceOutCustomComponent} from './device-out-custom/device-out-custom.component';

@NgModule({
  declarations: [
    AppComponent,
    MysidenavComponent,
    ProtoInComponent,
    ModalDialogComponent,
    ProtoOutComponent,
    DevicePdwComponent,
    DeviceTagComponent,
    DeviceCustomComponent,
    DeviceOutCustomComponent,
    DeviceRadiationComponent,
    DeviceComponent,
    SettingsComponent,
    DataShowComponent,
    DataComponent,
    PlaceholderComponent,
    DeviceIntfComponent,
    DeviceCustomComponent,
    DataShowDialogComponent,
    HighlightPipe
  ],
  imports: [
    NgxDatatableModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    // BrowserAnimationsModule,
    NoopAnimationsModule,
    Ng4JsonEditorModule,
    ClipboardModule,
    RouterModule.forRoot([
      {
        path: 'device',
        component: DeviceComponent,
        children: [
          {path: '', component: PlaceholderComponent},
          {path: 'tag', component: DeviceTagComponent},
          {path: 'pdw', component: DevicePdwComponent},
          {path: 'radiation', component: DeviceRadiationComponent},
          {path: 'custom/:custom', component: DeviceCustomComponent},
          {path: 'custom-out/:custom', component: DeviceOutCustomComponent},
          {path: 'intf', component: DeviceIntfComponent}
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
          {path: '', component: PlaceholderComponent},
          {path: 'show/:type', component: DataShowComponent}
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
    DataShowDialogComponent, ModalDialogComponent
  ],
  providers: [DatabaseService, TcpService, SettingService, DatePipe, HighlightPipe],
  bootstrap: [AppComponent]
})
export class AppModule {
}
