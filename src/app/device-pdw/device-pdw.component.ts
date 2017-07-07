import { NarrowBandFullPulseDictionary } from './../protocol/data-pack';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';
import { Subscription } from 'rxjs/Subscription';
import { NarrowBandFullPulseDataPack } from 'app/protocol/data-pack';

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
  dictionary: NarrowBandFullPulseDictionary = new NarrowBandFullPulseDictionary();

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: NarrowBandFullPulseDataPack) => {
      if (msg.type === 1) {// 判断是窄带全脉冲
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
    const keys = Object.keys(this.dictionary); // 控制显示的字段
    this.items = keys.map((curVal, index, arr) => {
      const obj = {};
      obj['name'] = this.dictionary[curVal];
      obj['value'] = message[curVal];
      return obj;
    });
  }

}
