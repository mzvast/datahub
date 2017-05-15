import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-device-main',
  templateUrl: './device-main.component.html',
  styleUrls: ['./device-main.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceMainComponent implements OnInit {
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

  constructor() { }

  ngOnInit() {
  }

}
