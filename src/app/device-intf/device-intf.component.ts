import { IntermediateFrequencyDataPack } from './../protocol/data-pack';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';

@Component({
  selector: 'app-device-intf',
  templateUrl: './device-intf.component.html',
  styleUrls: ['./device-intf.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceIntfComponent implements OnInit {
  subscription: Subscription;
  message = '未收到数据';
  serial: number;
  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: IntermediateFrequencyDataPack) => {
      if (msg.type === 4) {// 判断是中频数据
        if (this.serial === undefined) { // 首波中频，无序号
          this.serial = msg.serial;
        } else if (msg.serial === this.serial) { // 中频序号相同，为同一幅图的数据 TODO 拼接图数据点
          this.message += msg.data.slice(-8); // 拼接后
        } else {
          this.message = msg.data.slice(-8); // 只打印最后几个，0001ffff
        }
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

}
