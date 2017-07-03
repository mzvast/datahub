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
  timeInt = 1;
  timeMax = 25;
  timeMin = 0.1;
  subscription: Subscription;
  message = '未收到数据';
  serial: number;
  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: IntermediateFrequencyDataPack) => {
      if (msg.type === 4) {// 判断是中频数据
        if (this.serial === undefined) { // 首波中频，无序号
          this.serial = msg.serial;
        } else if (msg.serial === this.serial) { // 中频序号相同，为同一幅图
          this.message += msg.data.slice(-8); // TODO 拼接数据
        } else {
           // TODO 怎样判断结束？
        }
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

  timePlus(val: number) {
    if (this.timeInt + val <= this.timeMax) {
      this.timeInt += val;
    }
  }

  timeMinus(val: number) {
    if (this.timeInt - val >= this.timeMin) {
      this.timeInt -= val;
    }
  }

  timeSet(val: number) {
    this.timeInt = val;
  }

  sendRequest() {
    console.log('timeInt=', this.timeInt);
    this.udpService.sendIntFreqRequest(this.timeInt);
  }

  exportData() {
    console.log('export data');
  }

}
