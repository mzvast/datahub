import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { UdpService } from 'app/udp.service';
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-device-tag',
  templateUrl: './device-tag.component.html',
  styleUrls: ['./device-tag.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceTagComponent implements OnInit, OnDestroy {
  message: any;
  subscription: Subscription;

  constructor(private udpService: UdpService) { }
  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe(message => this.message = message);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
