import { TcpService } from 'app/tcp.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NarrowBandSourceDataPack } from 'app/protocol/data-pack';

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

  control: string;
  gps: string;
  host: string;

  constructor(private tcpService: TcpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.tcpService.getMessage().subscribe((msg: NarrowBandSourceDataPack) => {
      if (msg.type === 5) {// 判断是窄带辐射源
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
