import { SettingService } from './../setting.service';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class SettingsComponent implements OnInit {
  localPort: number;
  remotePort: number;
  remoteHost: string;

  constructor(
    private _settingService: SettingService,
    private _cd: ChangeDetectorRef, ) {
    this._settingService.fetchSettingFromDB().then(() => {
      this.parseData();
    });

  }

  ngOnInit() {
  }

  save() {
    console.log(this._settingService.local_port);
  }

  parseData() {
    this.localPort = this._settingService.local_port;
    this.remoteHost = this._settingService.remote_host;
    this.remotePort = this._settingService.remote_port;
    this._cd.detectChanges(); // 检测更改，更新UI。
  }

  initSetting() {
    this._settingService.initSetting().then(() => {
      this.parseData();
    });
  }

}
