import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mysidenav',
  templateUrl: './mysidenav.component.html',
  styleUrls: ['./mysidenav.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class MysidenavComponent implements OnInit {
  devices = [
    {
      name: '设备主页',
      icon: 'home'
    }
  ];
  prefs = [
    {
      name: '软件设置',
      icon: 'settings'
    }, {
      name: '导入/导出',
      icon: 'import_export'
    }]
  data = [
    {
      name: '数据设置',
      icon: 'settings'
    }, {
      name: '历史数据',
      icon: 'history'
    }, {
      name: '导入/导出',
      icon: 'import_export'
    }
  ];
  prots = [
    {
      name: '端口/地址',
      icon: 'settings'
    }, {
      name: '发送方向',
      icon: 'arrow_forward'
    }, {
      name: '接收方向',
      icon: 'arrow_back'
    }
  ];
  insts = [
    {
      name: '内部指令',
      icon: 'send'
    }
  ]
  constructor() { }

  ngOnInit() {
  }

}
