import { BroadBandFullPulseDictionary } from './../protocol/data-pack';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';
import { Subscription } from 'rxjs/Subscription';
import { BroadBandFullPulseDataPack } from 'app/protocol/data-pack';

@Component({
  selector: 'app-device-pdw',
  templateUrl: './device-pdw.component.html',
  styleUrls: ['./device-pdw.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DevicePdwComponent implements OnInit, OnDestroy {
  // message: any;
  subscription: Subscription;
  items = [];
  dictionary: BroadBandFullPulseDictionary = new BroadBandFullPulseDictionary();

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: BroadBandFullPulseDataPack) => {
      if (msg.type === 2) {// 判断是宽带全脉冲
        const message = msg.parserDescription(msg.datas[0]);
        this.setItems(message);
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

    setItems(message: Object): void {
    const keys = Object.keys(message);
    this.items = keys.map((curVal, index, arr) => {
      const obj = {};
      obj['name'] = this.dictionary[curVal];
      obj['value'] = message[curVal];
      return obj;
    });
  }

}
