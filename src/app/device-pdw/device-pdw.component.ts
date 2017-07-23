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

  control: string;
  gps: string;

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: NarrowBandFullPulseDataPack) => {
      if (msg.type === 1) {// 判断是窄带全脉冲
        const message = msg.parserDescription(msg.datas[0]);
        this.gps = [msg.gps.slice(0, 64), msg.gps.slice(64)].join('\n');
        this.control = [msg.control.slice(0, 64), msg.control.slice(64)].join('\n');
        this.items = msg.parserDescriptionLocalized(message);
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
