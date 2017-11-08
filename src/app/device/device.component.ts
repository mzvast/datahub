import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { TcpService } from 'app/tcp.service';
import {SettingService} from '../setting.service';

declare var electron: any; // 　Typescript 定义

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceComponent implements OnInit, OnDestroy {
  progress = false;
  saveFlag = true;
  protocols = [
    {
      name: '系统控制指令',
      url: 'intf'
    }, {
      name: '标签包',
      url: 'tag'
    }, {
      name: '全脉冲',
      url: 'pdw'
    }, {
      name: '辐射源',
      url: 'radiation'
    }
  ];
  constructor(private _settingService: SettingService, private tcpService: TcpService) {
    this._settingService.fetchSettingFromDB().then(() => {
      this.protocols.push({url : 'custom/6', name: _settingService.fetchCustomName(6)});
      this.protocols.push({url : 'custom/7', name: _settingService.fetchCustomName(7)});
      this.protocols.push({url : 'custom/8', name: _settingService.fetchCustomName(8)});
      this.protocols.push({url : 'custom/9', name: _settingService.fetchCustomName(9)});
      this.protocols.push({url : 'custom/10', name: _settingService.fetchCustomName(10)});
    });
  }

  ngOnInit() {
    this.progress = this.tcpService.checkProgressFlag();
    this.saveFlag = this.tcpService.saveFlag;
  }

  ngOnDestroy(): void {
    // console.log('停止TCP监听');
    // this.tcpService.stopTcpServer();
  }

  startReceive() {
    console.log('启动TCP监听');
    this.tcpService.startTcpServer();
  }

  stopReceive() {
    console.log('停止TCP监听');
    this.tcpService.stopTcpServer();
    // this.parentRouter.navigateByUrl('/device'); // 切换到空白页
  }

  toggleSave() {
    this.tcpService.toggleSave(!this.saveFlag);
  }

  toggle() {
    if (!this.progress) {// 启动
      this.startReceive();
    } else {
      this.stopReceive();
    }
  }
  checkToggle() {
    // if (!this.progress) {// 启动
    //   this.progress = !this.progress;
    //   this.startReceive();
    // }
  }

}
