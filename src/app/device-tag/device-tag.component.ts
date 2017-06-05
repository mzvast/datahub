import { TagDataPack, TagDataPackDictionary } from './../protocol/data-pack';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-device-tag',
  templateUrl: './device-tag.component.html',
  styleUrls: ['./device-tag.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceTagComponent implements OnInit, OnDestroy {
  // message: TagDataPack;
  subscription: Subscription;
  items = [];
  dictionary: TagDataPackDictionary = new TagDataPackDictionary();

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: TagDataPack) => {
      if (msg.type === 0) {// 判断是标签包
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
