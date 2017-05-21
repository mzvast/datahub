import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-device-tag',
  templateUrl: './device-tag.component.html',
  styleUrls: ['./device-tag.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceTagComponent implements OnInit {
  tiles = [
    { text: '指令接收状态', cols: 2, rows: 1, color: 'lightgreen', icon: 'check_circle' },
    { text: '分机工作状态', cols: 2, rows: 1, color: 'lightgreen', icon: 'check_circle' },
    { text: '前端工作温度', cols: 2, rows: 1, color: 'lightgreen', icon: 'check_circle' },
    { text: '分机工作温度', cols: 2, rows: 1, color: 'lightgreen', icon: 'check_circle' },
  ];
  constructor() { }
  ngOnInit() {
  }

}
