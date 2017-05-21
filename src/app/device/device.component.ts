import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService } from 'app/database.service';
import { UdpService } from 'app/udp.service';


@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceComponent implements OnInit {
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
  constructor(private databaseService: DatabaseService, private udpService: UdpService) {
  }

  ngOnInit() {
  }

  startReceive() {
    console.log('发送开始指令');
    this.udpService.sendStartMsg();
    console.log('启动UDP监听');
    this.udpService.startUdpServer();
  }

  stopReceive() {
    console.log('发送停止指令');
    this.udpService.sendStartMsg();
    console.log('停止UDP监听');
    this.udpService.stopUdpServer();
  }

  toggle() {
    if (!this.progress) {// 启动
      this.startReceive();
    } else {
      this.stopReceive();
    }
  }

}
