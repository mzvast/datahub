import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DataComponent implements OnInit {
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
    }, {
      name: '相位校正',
      url: 'phase'
    }, {
      name: '定位',
      url: 'location'
    }, {
      name: '原始数据',
      url: 'pkg'
    }
  ];
  constructor() { }

  ngOnInit() {
  }

}
