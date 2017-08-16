import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-proto-in',
  templateUrl: './proto-in.component.html',
  styleUrls: ['./proto-in.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProtoInComponent implements OnInit {
  protocols = [
    // {
    //   name: '标签包',
    //   url: 'tag'
    // }, {
    //   name: '宽带PDW',
    //   url: 'wide-pdw'
    // }, {
    //   name: '宽带辐射源结果',
    //   url: 'wide-radiation'
    // }, {
    //   name: '测向与定位信息',
    //   url: 'location'
    // },
    {
      name: '全脉冲',
      url: 'narrow-pdw'
    }, {
      name: '辐射源',
      url: 'narrow-radiation'
    }, {
      name: '中频',
      url: 'intf'
    }
    // , {
    //   name: '相位校正数据包',
    //   url: 'phrase'
    // }
  ];
  constructor() { }

  ngOnInit() {
  }

}
