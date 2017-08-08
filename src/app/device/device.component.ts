import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'app/database.service';
import { TcpService } from 'app/tcp.service';

declare var electron: any; // 　Typescript 定义

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceComponent implements OnInit, OnDestroy {
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
      url: 'intf'
    }
  ];
  constructor(private databaseService: DatabaseService, private tcpService: TcpService, private parentRouter: Router) {

  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    console.log('停止TCP监听');
    this.tcpService.stopTcpServer();
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
