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
      name: '地址/端口',
      icon: 'settings',
      url: 'proto-addr'
    }, {
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
  constructor(private udpService: UdpService) { }

  ngOnInit() {
    this.debug = this.udpService.debug;
  }

  toggleDebug() {
    this.debug = !this.debug;
    this.udpService.debug = this.debug;
    console.log('debug=', this.udpService.debug);
  }

}
