import { SettingService } from './../setting.service';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import * as myGlobals from '../globals.service';

@Component({
  selector: 'app-mysidenav',
  templateUrl: './mysidenav.component.html',
  styleUrls: ['./mysidenav.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class MysidenavComponent implements OnInit {
  buildTimestamp: string;
  debug: boolean;
  record: boolean;
  devices = [
    {
      name: '系统界面',
      icon: 'home',
      url: 'device'
    }
  ];
  settings = [
    {
      name: '软件设置',
      icon: 'settings',
      url: 'settings'
    }];
  data = [
    {
      name: '历史数据',
      icon: 'history',
      url: 'data'
    }
  ];
  protocols = [
    {
      name: '协议设置',
      icon: 'arrow_back',
      url: 'proto-in'
    }
  ];
  // insts = [
  //   {
  //     name: '内部指令',
  //     icon: 'send'
  //   }
  // ]
  constructor(private _settingService: SettingService) { }

  ngOnInit() {
    this._settingService.fetchSettingFromDB().then(() => {
      this.debug = this._settingService.debug;
      this.record = this._settingService.record;

      this.buildTimestamp = myGlobals.codeVersion;
    });
  }

  toggleDebug() {
    this._settingService.toggleDebug();
    // 原始数据记录只有调试模式下生效（防止用户误会数据记录）
    if (!this._settingService.debug && this._settingService.record) {
      this.record = false;
      this._settingService.toggleRecord();
    }
  }

  toggleRecord() {
    if (this._settingService.debug) {
      this._settingService.toggleRecord();
    }
  }

}
