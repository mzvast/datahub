import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TcpService } from 'app/tcp.service';
import { Subscription } from 'rxjs/Subscription';
import { NarrowBandFullPulseDataPack } from 'app/protocol/data-pack';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

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
  protoId: number;

  constructor(private tcpService: TcpService, private cd: ChangeDetectorRef, private snackBar: MdSnackBar) { }
  ngOnInit() {
    this.subscription = this.tcpService.getMessage().subscribe((msg: NarrowBandFullPulseDataPack) => {
      if (msg.type === 1) {// 判断是窄带全脉冲
        this.host = msg.host;
        this.protoId = msg.protoId;
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

  valueCopied(value) {
    if (!value) {
      return;
    }
    if (value.length > 64) {
      value = value.substr(0, 64) + '...';
    }
    this.showToast('已复制: ' + value);
  }

  showToast(message: string) {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(message, null, config);
  }

}
