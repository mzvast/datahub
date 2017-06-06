import { UdpService } from './../udp.service';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class SettingsComponent implements OnInit {
  localPort: number;

  constructor(private udpService: UdpService) {
    this.localPort = this.udpService.LocalPORT;
  }

  ngOnInit() {
  }

}
