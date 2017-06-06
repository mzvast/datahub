import { SettingService } from './../setting.service';
import { UdpService } from './../udp.service';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mysidenav',
  templateUrl: './mysidenav.component.html',
  styleUrls: ['./mysidenav.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class MysidenavComponent implements OnInit {
  debug: boolean;
  record: boolean;
  devices = [
    {
      name: '接收数据',
      icon: 'home',
      url: 'device'
    }
  ];
  settings = [
    {
      name: '软件设置',
      icon: 'settings',
      url: 'settings'
    }]
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
  constructor(private _udpService: UdpService, private _settingService: SettingService) { }

  ngOnInit() {
    setTimeout(() => {
      this.debug = this._settingService.debug;
      this.record = this._settingService.record;
    }, 500);
  }

  toggleDebug() {
    this._settingService.toggleDebug();
  }
  toggleRecord() {
    this._settingService.toggleRecord();
  }

}
