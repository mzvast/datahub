import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TcpService } from 'app/tcp.service';
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

  control: string;
  gps: string;
  host: string;

  constructor(private tcpService: TcpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.tcpService.getMessage().subscribe((msg: NarrowBandFullPulseDataPack) => {
      if (msg.type === 1) {// 判断是窄带全脉冲
        this.host = msg.host;
        this.gps = [msg.gps.slice(0, 64), msg.gps.slice(64)].join('\n');
        this.control = [msg.control.slice(0, 64), msg.control.slice(64)].join('\n');
        this.items = msg.parseItems(msg.datas[0]);
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
