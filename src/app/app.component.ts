import { Component } from '@angular/core';

import { DatabaseService } from './database.service';
import { UdpService } from './udp.service';
import { MysidenavComponent } from './mysidenav/mysidenav.component';

@Component({
  selector: 'app-root',
  providers: [DatabaseService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;
  constructor(databaseService: DatabaseService, udpService: UdpService) {
    this.title = 'Hey God';
  }
}
