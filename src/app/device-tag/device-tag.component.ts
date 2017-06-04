import { TagDataPack } from './../protocol/data-pack';
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
  message: TagDataPack;
  subscription: Subscription;

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: TagDataPack) => {
      this.message = msg;
      this.cd.detectChanges(); // 检测更改，更新UI。
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
