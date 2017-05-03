import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-proto-out',
  templateUrl: './proto-out.component.html',
  styleUrls: ['./proto-out.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProtoOutComponent implements OnInit {
  protocols = [
    {
      name: '标签包',
      url: 'proto-out/biaoqian'
    }, {
      name: '宽带PDW',
      url: ''
    }, {
      name: '宽带辐射源结果',
      url: ''
    }, {
      name: '测向与定位信息',
      url: ''
    }, {
      name: '窄带PDW',
      url: ''
    }, {
      name: '窄带辐射源结果',
      url: ''
    }, {
      name: '中频数据包',
      url: ''
    }, {
      name: '相位校正数据包',
      url: ''
    }
  ];
  constructor() { }

  ngOnInit() {
  }

}
