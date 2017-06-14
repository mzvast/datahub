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
  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: IntermediateFrequencyDataPack) => {
      if (msg.type === 4) {// 判断是中频数据
        const message = msg.parserDescription(msg.data);
        this.message = message;
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

}
