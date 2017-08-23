import { TagDataPack } from './../protocol/data-pack';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TcpService } from 'app/tcp.service';
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

  control: string;
  gps: string;
  host: string;
  protoId: number;

  constructor(private tcpService: TcpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.tcpService.getMessage().subscribe((msg: TagDataPack) => {
      if (msg.type === 0) {// 判断是标签包
        this.host = msg.host;
        this.protoId = msg.protoId;
        this.gps = [msg.gps.slice(0, 64), msg.gps.slice(64)].join('\n');
        this.control = [msg.control.slice(0, 64), msg.control.slice(64)].join('\n');
        // console.log(message);
        this.items = msg.parseItems(msg.data);
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
