import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'app/database.service';
import { UdpService } from 'app/udp.service';

declare var electron: any; // 　Typescript 定义

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceComponent implements OnInit {
  server = electron.remote.getGlobal('udp').server;
  progress = false;
  protocols = [
    {
      name: '标签包',
      url: 'tag'
    }, {
      name: '全脉冲',
      url: 'pdw'
    }, {
      name: '辐射源',
      url: 'radiation'
    }, {
      name: '中频数据',
      url: 'if'
    }, {
      name: '相位校正',
      url: 'phase'
    }, {
      name: '定位',
      url: 'location'
    }
  ];
  constructor(private databaseService: DatabaseService, private udpService: UdpService, private parentRouter: Router) {

  }

  ngOnInit() {
  }

  startReceive() {
    console.log('启动UDP监听');
    this.udpService.startUdpServer();
  }

  stopReceive() {
    console.log('停止UDP监听');
    this.udpService.stopUdpServer();
    this.parentRouter.navigateByUrl('/device'); // 切换到空白页
  }

  toggle() {
    if (!this.progress) {// 启动
      this.startReceive();
    } else {
      this.stopReceive();
    }
  }
  checkToggle() {
    if (!this.progress) {// 启动
      this.progress = !this.progress;
      this.startReceive();
    }
  }

}
