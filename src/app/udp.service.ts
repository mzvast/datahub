import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = this.dgram.createSocket('udp4');
  PORT = 33333;
  HOST = '127.0.0.1';
  constructor() {
    console.log('udp service constructor');
    this.server.on('listening', function () {
      // const address = this.server.address();
      // console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });

    this.server.on('message', function (message, remote) {
      console.log('remote=', remote);
      console.log(remote.address + ':' + remote.port + ' - ' + message);
    });

    this.server.bind(this.PORT, this.HOST);
  }

}
