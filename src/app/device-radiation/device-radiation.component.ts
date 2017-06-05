import { UdpService } from 'app/udp.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BroadBandSourceDataPack, BroadBandRadiationDictionary } from "app/protocol/data-pack";

@Component({
  selector: 'app-device-radiation',
  templateUrl: './device-radiation.component.html',
  styleUrls: ['./device-radiation.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceRadiationComponent implements OnInit, OnDestroy {
  // message: any;
  subscription: Subscription;
  items = [];
  dictionary: BroadBandRadiationDictionary = new BroadBandRadiationDictionary();

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: BroadBandSourceDataPack) => {
      if (msg.type === 3) {// 判断是宽带辐射源
        const message = msg.parserDescription(msg.datas[0]);
        // console.log(message);
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
