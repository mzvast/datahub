import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = this.dgram.createSocket('udp4');
  LocalPORT = 6011;
  TargetPORT = 8511;
  LocalHOST = '127.0.0.1';
  TargetHOST = '127.0.0.1';

  constructor() {
    console.log('udp service constructor');
    // this.startUdpServer();
    // this.setTargetAddress('127.0.0.1', 6011);
    // this.sendMsg('Hello World');
  }

  startUdpServer() {
    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    this.server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      // this.stopUdpServer();
    });

    this.server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.server.close();
      console.log('UDP server closed!');
    });

    this.server.bind(this.LocalPORT, this.LocalHOST);
  }

  stopUdpServer() {
    this.server.close();
    console.log('UDP server closed!');
  }

  setLocalAddress(host: string, port: number) {
    this.LocalHOST = host;
    this.LocalPORT = port;
    console.log(`setLocalAddress to ${this.LocalHOST}:${this.LocalPORT}`);
  }

  setTargetAddress(host: string, port: number) {
    this.TargetHOST = host;
    this.TargetPORT = port;
    console.log(`setTargetAddress to ${this.TargetHOST}:${this.TargetPORT}`);
  }

  sendMsg(message: string) {
    const client = this.dgram.createSocket('udp4');
    client.send(message, 0, message.length, this.TargetPORT, this.TargetHOST, (err) => {
      console.log(`UDP message sent to ${this.TargetHOST}:${this.TargetPORT} `);
      client.close();
    });
  }



}
