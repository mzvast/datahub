import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { UdpService } from './../udp.service';

@Component({
  selector: 'app-proto-addr',
  templateUrl: './proto-addr.component.html',
  styleUrls: ['./proto-addr.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProtoAddrComponent implements OnInit {
  localPort: number;

  constructor(private udpService: UdpService) {
    this.localPort = this.udpService.LocalPORT;
   }

  ngOnInit() {
  }

}
