import { SettingService } from './../setting.service';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig} from '@angular/material';

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
  hosts: string;
  refreshRate: number;
  custom6: string;
  custom7: string;
  custom8: string;
  custom9: string;
  custom10: string;

  constructor(
    private _settingService: SettingService,
    private _cd: ChangeDetectorRef,
    private snackBar: MdSnackBar) {
    this._settingService.fetchSettingFromDB().then(() => {
      this.parseData();
    });

  }

  ngOnInit() {
  }

  save() {
    this._settingService.local_port = this.localPort;
    this._settingService.remote_host = this.remoteHost;
    this._settingService.remote_port = this.remotePort;
    this._settingService.updateCustomsToDB(this.custom6, this.custom7, this.custom8, this.custom9, this.custom10);
    this._settingService.updateOtherSettingToDB(this.hosts.split(','), null, this.refreshRate);
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open('保存成功', null, config);
    // console.log(this._settingService.local_port);
  }

  parseData() {
    this.localPort = this._settingService.local_port;
    this.remoteHost = this._settingService.remote_host;
    this.remotePort = this._settingService.remote_port;
    const hosts = this._settingService.otherSt['hosts'];
    this.hosts = hosts.join(',');
    this.refreshRate = this._settingService.otherSt['refreshRate'];
    if (!this.refreshRate) {
      this.refreshRate = 500;
    }
    this.custom6 = this._settingService.otherSt['custom6'];
    this.custom7 = this._settingService.otherSt['custom7'];
    this.custom8 = this._settingService.otherSt['custom8'];
    this.custom9 = this._settingService.otherSt['custom9'];
    this.custom10 = this._settingService.otherSt['custom10'];
    this._cd.detectChanges(); // 检测更改，更新UI。
  }

  initSetting() {
    this._settingService.initSetting().then(() => {
      this.parseData();
    });
  }

}
