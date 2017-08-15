import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;
  remoteHost: string;
  constructor() {
    this.title = 'Hey God';
    this.remoteHost = '192.168.1.1';
  }
}
